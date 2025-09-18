import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

// Simple in-memory vector store for demo. Replace with a real vector DB.
interface DocChunk {
  id: string;
  text: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

const corpus: DocChunk[] = [
  // Class 6 Content
  {
    id: "science-6-basic-concepts-1",
    text: "In Class 6 Science, we learn about basic concepts like living and non-living things, plants, animals, and simple machines. Plants make their own food through photosynthesis using sunlight, water, and carbon dioxide.",
    metadata: { subject: "science", grade: 6, chapter: "Basic Concepts" },
  },
  {
    id: "math-6-basic-operations-1",
    text: "In Class 6 Math, we learn basic operations like addition, subtraction, multiplication, and division. We also study fractions, decimals, and basic geometry shapes like triangles, squares, and circles.",
    metadata: { subject: "mathematics", grade: 6, chapter: "Basic Operations" },
  },
  {
    id: "science-6-matter-1",
    text: "In Class 6 Science, matter is anything that has mass and takes up space. There are three states of matter: solid, liquid, and gas. Water can exist in all three states.",
    metadata: { subject: "science", grade: 6, chapter: "Matter" },
  },

  // Class 8 Content
  {
    id: "science-8-motion-1",
    text: "In Class 8 Science, Motion is the change in position of an object with time. Speed is distance traveled per unit time. Velocity includes both speed and direction. Acceleration is the rate of change of velocity.",
    metadata: { subject: "science", grade: 8, chapter: "Motion" },
  },
  {
    id: "math-8-fractions-1",
    text: "In Class 8 Math, to add fractions, first make the denominators same, then add numerators. To multiply fractions, multiply numerators and denominators separately. Division of fractions is done by multiplying with the reciprocal.",
    metadata: { subject: "mathematics", grade: 8, chapter: "Fractions" },
  },
  {
    id: "science-8-force-1",
    text: "In Class 8 Science, Force is a push or pull that can change the state of motion of an object. Newton's first law states that an object at rest stays at rest unless acted upon by an external force.",
    metadata: { subject: "science", grade: 8, chapter: "Force" },
  },

  // Class 10 Content
  {
    id: "science-10-light-1",
    text: "In Class 10 Science, Light is a form of energy that enables us to see objects. Light travels in straight lines. Reflection occurs when light bounces off a surface. The angle of incidence equals the angle of reflection.",
    metadata: { subject: "science", grade: 10, chapter: "Light" },
  },
  {
    id: "math-10-algebra-1",
    text: "In Class 10 Math, we study quadratic equations, polynomials, and coordinate geometry. A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0. The discriminant b² - 4ac determines the nature of roots.",
    metadata: { subject: "mathematics", grade: 10, chapter: "Algebra" },
  },
  {
    id: "science-10-electricity-1",
    text: "In Class 10 Science, Electric current is the flow of electric charge. Ohm's law states that V = IR, where V is voltage, I is current, and R is resistance. Electric power is given by P = VI.",
    metadata: { subject: "science", grade: 10, chapter: "Electricity" },
  },

  // Class 12 Content
  {
    id: "physics-12-mechanics-1",
    text: "In Class 12 Physics, we study advanced mechanics including rotational motion, gravitation, and oscillations. Angular momentum is conserved in the absence of external torque. Simple harmonic motion follows the equation x = A sin(ωt + φ).",
    metadata: { subject: "physics", grade: 12, chapter: "Mechanics" },
  },
  {
    id: "math-12-calculus-1",
    text: "In Class 12 Math, we study calculus including limits, derivatives, and integrals. The derivative of x^n is nx^(n-1). The integral of x^n is (x^(n+1))/(n+1) + C, where C is the constant of integration.",
    metadata: { subject: "mathematics", grade: 12, chapter: "Calculus" },
  },
  {
    id: "chemistry-12-organic-1",
    text: "In Class 12 Chemistry, we study organic chemistry including hydrocarbons, functional groups, and reactions. Alkanes have single bonds, alkenes have double bonds, and alkynes have triple bonds. IUPAC naming follows specific rules.",
    metadata: { subject: "chemistry", grade: 12, chapter: "Organic Chemistry" },
  },
];

let isEmbedded = false;

// Lightweight detector/solver for basic arithmetic in natural language
function tryBasicMath(question: string): string | null {
  const q = question.toLowerCase().replace(/[^0-9+\-*/x÷,.\s]/g, " ");
  // Normalize common words to operators
  const normalized = q
    .replace(/plus|add|sum of|\band\b/gi, "+")
    .replace(/minus|subtract|difference|less/gi, "-")
    .replace(/times|multiply|multiplied by|x|✕/gi, "*")
    .replace(/divide|divided by|over|÷/gi, "/");

  // Extract numbers (integers) and operator sequence
  const numbers = normalized.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  const opMatch = normalized.match(/[+\-*/]/);

  if (numbers.length >= 2 && opMatch) {
    const a = numbers[0];
    const b = numbers[1];
    let result: number | null = null;
    switch (opMatch[0]) {
      case "+":
        result = a + b;
        break;
      case "-":
        result = a - b;
        break;
      case "*":
        result = a * b;
        break;
      case "/":
        // Avoid division by zero
        result = b === 0 ? NaN : a / b;
        break;
    }
    if (result !== null && !Number.isNaN(result)) {
      return `${a} ${opMatch[0]} ${b} = ${result}`;
    }
  }
  return null;
}

async function ensureEmbeddings(embeddingModel: any) {
  if (isEmbedded) return;
  try {
    for (const c of corpus) {
      const res = await embeddingModel.embedContent(c.text);
      c.embedding = res.embedding.values as unknown as number[];
    }
    isEmbedded = true;
  } catch (error) {
    console.error("[RAG] Error generating embeddings:", error);
    // If embeddings fail, we'll use a simple text-based fallback
    throw new Error(
      "Failed to generate embeddings. Please check your GEMINI_API_KEY."
    );
  }
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(request: NextRequest) {
  try {
    const { question, language, response_language, grade } =
      await request.json();
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Missing question" },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_EMBEDDINGS_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use text-embedding-004 for embeddings
    const embeddingModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });

    const pcApiKey = process.env.PINECONE_API_KEY;
    const pcIndexName = process.env.PINECONE_INDEX;

    let retrieved = "";
    let ranked: Array<{ chunk: any; score: number }> = [];

    // If the question is a basic arithmetic query and grade supports it (>= 6)
    if (typeof grade === "number" && grade >= 6) {
      const mathAnswer = tryBasicMath(question);
      if (mathAnswer) {
        return NextResponse.json({
          success: true,
          data: {
            answer: `Answer: ${mathAnswer}`,
            context: [{ id: "math-basic-ops", score: 1 }],
          },
        });
      }
    }

    if (pcApiKey && pcIndexName) {
      try {
        const pc = new Pinecone({ apiKey: pcApiKey });
        const index = pc.index(pcIndexName);
        const q = await embeddingModel.embedContent(question);
        const qEmbedding = q.embedding.values as unknown as number[];
        const res = await index.query({
          vector: qEmbedding,
          topK: 5,
          includeMetadata: true,
          filter:
            typeof grade === "number" ? { grade: { $eq: grade } } : undefined,
        });
        const contexts: string[] = [];
        res.matches?.forEach((m: any) => {
          const text = m?.metadata?.text || m?.metadata?.content || "";
          if (text) contexts.push(text);
        });
        retrieved = contexts.join("\n\n");
        // If Pinecone returns no context, fall back to in-memory filtered by grade
        if (!retrieved) {
          await ensureEmbeddings(embeddingModel);
          const q2 = await embeddingModel.embedContent(question);
          const qEmbedding2 = q2.embedding.values as unknown as number[];
          const baseCorpus =
            typeof grade === "number"
              ? corpus.filter((c) => c.metadata?.grade === grade)
              : corpus;
          ranked = baseCorpus
            .map((c) => ({
              chunk: c,
              score: cosineSimilarity(c.embedding!, qEmbedding2),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 4);
          retrieved = ranked.map((r) => r.chunk.text).join("\n\n");
          // Keyword fallback if still empty
          if (!retrieved) {
            const questionLower2 = question.toLowerCase();
            const matchingChunks2 = baseCorpus.filter((c) => {
              const textLower = c.text.toLowerCase();
              return questionLower2
                .split(/\s+/)
                .some(
                  (word: string) => word.length > 3 && textLower.includes(word)
                );
            });
            if (matchingChunks2.length > 0) {
              retrieved = matchingChunks2
                .slice(0, 3)
                .map((c) => c.text)
                .join("\n\n");
            }
          }
        }
      } catch (e) {
        // Fallback to in-memory
        await ensureEmbeddings(embeddingModel);
        const q = await embeddingModel.embedContent(question);
        const qEmbedding = q.embedding.values as unknown as number[];
        const baseCorpus =
          typeof grade === "number"
            ? corpus.filter((c) => c.metadata?.grade === grade)
            : corpus;
        ranked = baseCorpus
          .map((c) => ({
            chunk: c,
            score: cosineSimilarity(c.embedding!, qEmbedding),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 4);
        retrieved = ranked.map((r) => r.chunk.text).join("\n\n");
        // If nothing matched after grade filtering, attempt keyword fallback
        if (!retrieved) {
          const questionLower2 = question.toLowerCase();
          const matchingChunks2 = baseCorpus.filter((c) => {
            const textLower = c.text.toLowerCase();
            const hasKeyword = questionLower2
              .split(/\s+/)
              .some(
                (word: string) => word.length > 3 && textLower.includes(word)
              );
            return hasKeyword;
          });
          if (matchingChunks2.length > 0) {
            retrieved = matchingChunks2
              .slice(0, 3)
              .map((c) => c.text)
              .join("\n\n");
          }
        }
      }
    } else {
      // In-memory with fallback for invalid API key
      try {
        await ensureEmbeddings(embeddingModel);
        const q = await embeddingModel.embedContent(question);
        const qEmbedding = q.embedding.values as unknown as number[];
        const baseCorpus =
          typeof grade === "number"
            ? corpus.filter((c) => c.metadata?.grade === grade)
            : corpus;
        ranked = baseCorpus
          .map((c) => ({
            chunk: c,
            score: cosineSimilarity(c.embedding!, qEmbedding),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 4);
        retrieved = ranked.map((r) => r.chunk.text).join("\n\n");
      } catch (error) {
        console.error(
          "[RAG] Using text-based fallback due to API error:",
          error
        );
        // Simple text-based matching as fallback
        const questionLower = question.toLowerCase();
        const keywordAllow = new Set([
          "add",
          "plus",
          "sum",
          "subtract",
          "minus",
          "difference",
          "multiply",
          "times",
          "product",
          "divide",
          "divided",
        ]);
        const baseCorpus =
          typeof grade === "number"
            ? corpus.filter((c) => c.metadata?.grade === grade)
            : corpus;
        const matchingChunks = baseCorpus.filter((c) => {
          const textLower = c.text.toLowerCase();
          const hasKeyword = questionLower.split(/\s+/).some((word: string) => {
            const w = word.replace(/[^a-z]/g, "");
            return (
              (w.length >= 3 && textLower.includes(w)) || keywordAllow.has(w)
            );
          });
          return hasKeyword;
        });

        if (matchingChunks.length > 0) {
          retrieved = matchingChunks
            .slice(0, 3)
            .map((c) => c.text)
            .join("\n\n");
        }
      }
    }

    // If no context retrieved, avoid calling the model and respond immediately
    const answerLang = response_language || "en";
    if (!retrieved || retrieved.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          answer: "I don't know because it is out of syllabus.",
          context: [],
        },
      });
    }

    // Prepare a simple extractive fallback in case model calls fail
    const trimmedContext = retrieved.slice(0, 2000);
    const defaultAnswer = (() => {
      const sentences = trimmedContext
        .replace(/\n+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .slice(0, 2)
        .join(" ");
      return sentences || "I don't know because it is out of syllabus.";
    })();

    // Build prompt (cap context to ~2k chars for speed)
    const gradeText = grade ? `Class ${grade}` : "the appropriate class level";
    const prompt = `You are an AI tutor for ${gradeText} students.\nUse only the following context to answer the question.\nIf the answer is not in the context, say "I don't know because it is out of syllabus."\nRespond concisely in language code: ${answerLang}.\n\nContext:\n${trimmedContext}\n\nQuestion (lang=${
      language || "en"
    }):\n${question}\n\nAnswer:`;

    // Try fast model with small fallback and brief backoff to handle 503s
    const models = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
    ];
    let answer = "";
    for (let i = 0; i < models.length; i++) {
      try {
        const model = genAI.getGenerativeModel({ model: models[i] });
        const completion = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        answer = completion.response.text();
        if (answer && answer.trim()) break;
      } catch (e) {
        if (i === models.length - 1) {
          // On persistent model failure (e.g., invalid API key), fall back to extractive answer
          return NextResponse.json({
            success: true,
            data: {
              answer: defaultAnswer,
              context: ranked?.length
                ? ranked.map((r) => ({ id: r.chunk.id, score: r.score }))
                : undefined,
            },
          });
        }
        await new Promise((r) => setTimeout(r, 300 * (i + 1)));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        answer,
        context: ranked?.length
          ? ranked.map((r) => ({ id: r.chunk.id, score: r.score }))
          : undefined,
      },
    });
  } catch (error) {
    console.error("[RAG] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate RAG answer" },
      { status: 500 }
    );
  }
}

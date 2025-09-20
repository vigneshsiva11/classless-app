import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory vector store for demo. Replace with a real vector DB.
interface DocChunk {
  id: string;
  text: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

const corpus: DocChunk[] = [
  // Class 3 Content
  {
    id: "science-3-solar-system-1",
    text: "In Class 3 Science, we learn about the solar system. The Sun is a star at the center of our solar system. We study the eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Earth is our home planet where we live.",
    metadata: { subject: "science", grade: 3, chapter: "Solar System" },
  },

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
    id: "science-8-solar-system-1",
    text: "In Class 8 Science, the Solar System consists of the Sun and all objects that orbit around it. The Sun is a star at the center. There are eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Earth is the third planet from the Sun and the only known planet with life.",
    metadata: { subject: "science", grade: 8, chapter: "Solar System" },
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
  {
    id: "science-8-newton-laws-1",
    text: "Newton's Laws of Motion: 1) First Law (Law of Inertia): An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force. 2) Second Law: Force equals mass times acceleration (F = ma). 3) Third Law: For every action, there is an equal and opposite reaction.",
    metadata: { subject: "science", grade: 8, chapter: "Newton's Laws" },
  },

  // Class 9 Content
  {
    id: "science-9-newton-laws-1",
    text: "In Class 9 Physics, Newton's three laws of motion are fundamental principles: 1) Law of Inertia - objects resist changes in motion, 2) F = ma - force causes acceleration proportional to mass, 3) Action-Reaction - forces always occur in pairs. These laws explain how objects move and interact.",
    metadata: { subject: "physics", grade: 9, chapter: "Newton's Laws" },
  },
  {
    id: "math-9-algebra-1",
    text: "In Class 9 Math, we study algebra including linear equations, quadratic equations, and polynomials. We learn to solve equations with one variable and graph linear functions on coordinate planes.",
    metadata: { subject: "mathematics", grade: 9, chapter: "Algebra" },
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

// Step 1: Query Expansion / Rephrasing
async function expandQuery(
  question: string,
  grade?: number
): Promise<string[]> {
  try {
    const gradeText = grade ? `Class ${grade}` : "appropriate grade level";
    const expansionPrompt = `You are an AI tutor. Given a student question, generate 2-3 expanded/rephrased versions that would help find better educational content.

Original question: "${question}"
Grade level: ${gradeText}

Generate variations that:
1. Use more specific educational terminology
2. Include related concepts from the same topic
3. Add context about the grade level
4. Use synonyms and alternative phrasings

Return only the expanded questions, one per line, without numbering or explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: expansionPrompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "";
    const expansions = response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.match(/^\d+\./))
      .slice(0, 3);

    return [question, ...expansions];
  } catch (error) {
    console.error("[RAG OpenAI] Query expansion failed:", error);
    return [question];
  }
}

// Step 2: Retrieve Documents from Vector Database
async function retrieveDocuments(
  query: string,
  grade?: number,
  topK: number = 5
): Promise<DocChunk[]> {
  try {
    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Calculate cosine similarity with corpus
    const results = corpus
      .filter((chunk) => {
        if (!grade) return true;
        return chunk.metadata?.grade === grade;
      })
      .map((chunk) => {
        if (!chunk.embedding) {
          // Generate embedding for chunk if not exists
          return { chunk, score: 0 };
        }
        const similarity = cosineSimilarity(chunk.embedding, queryEmbedding);
        return { chunk, score: similarity };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((result) => result.chunk);

    return results;
  } catch (error) {
    console.error("[RAG OpenAI] Document retrieval failed:", error);
    // Fallback to simple keyword matching
    return corpus
      .filter((chunk) => {
        if (!grade) return true;
        return chunk.metadata?.grade === grade;
      })
      .filter((chunk) => {
        const queryWords = query.toLowerCase().split(/\s+/);
        const textWords = chunk.text.toLowerCase().split(/\s+/);
        return queryWords.some(
          (word) =>
            word.length > 3 &&
            textWords.some((textWord) => textWord.includes(word))
        );
      })
      .slice(0, topK);
  }
}

// Helper function for cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
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

// Ensure embeddings are generated for all chunks
async function ensureEmbeddings() {
  if (isEmbedded) return;

  try {
    for (const chunk of corpus) {
      if (!chunk.embedding) {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk.text,
        });
        chunk.embedding = embeddingResponse.data[0].embedding;
      }
    }
    isEmbedded = true;
  } catch (error) {
    console.error("[RAG OpenAI] Error generating embeddings:", error);
    throw new Error(
      "Failed to generate embeddings. Please check your OPENAI_API_KEY."
    );
  }
}

// Step 3: Generate Answer with OpenAI
async function generateAnswer(
  question: string,
  retrievedDocs: DocChunk[],
  grade?: number
): Promise<string> {
  const gradeText = grade ? `Class ${grade}` : "appropriate grade level";
  const context = retrievedDocs.map((doc) => doc.text).join("\n\n");

  const prompt = `You are an AI tutor for ${gradeText} students. Use the following context to answer the question accurately and helpfully.

Context:
${context}

Question: ${question}

Instructions:
- Answer based on the provided context
- If the context doesn't contain enough information, say so clearly
- Use simple, clear language appropriate for the grade level
- Provide examples when helpful
- If the question is about something not in the syllabus, provide a brief, helpful response

Answer:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    });

    return (
      completion.choices[0]?.message?.content ||
      "I couldn't generate an answer."
    );
  } catch (error) {
    console.error("[RAG OpenAI] Answer generation failed:", error);
    return "I'm sorry, I couldn't generate an answer at this time.";
  }
}

// Main RAG Tutor Flow
export async function POST(request: NextRequest) {
  try {
    const { question, grade, language = "en" } = await request.json();

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Missing question" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log(
      `[RAG OpenAI] Processing question: "${question}" (Grade: ${grade})`
    );

    // Step 1: Query Expansion / Rephrasing
    const expandedQueries = await expandQuery(question, grade);
    console.log("[RAG OpenAI] Expanded queries:", expandedQueries);

    // Step 2: Retrieve Documents
    await ensureEmbeddings();

    // Try each expanded query and collect results
    const allRetrievedDocs: DocChunk[] = [];
    for (const expandedQuery of expandedQueries) {
      const docs = await retrieveDocuments(expandedQuery, grade, 3);
      allRetrievedDocs.push(...docs);
    }

    // Remove duplicates and limit results
    const uniqueDocs = new Map();
    allRetrievedDocs.forEach((doc) => {
      if (!uniqueDocs.has(doc.id)) {
        uniqueDocs.set(doc.id, doc);
      }
    });
    const retrievedDocs = Array.from(uniqueDocs.values()).slice(0, 5);

    console.log(`[RAG OpenAI] Retrieved ${retrievedDocs.length} documents`);

    // Step 3: Generate Answer with OpenAI
    const answer = await generateAnswer(question, retrievedDocs, grade);

    return NextResponse.json({
      success: true,
      data: {
        answer,
        context: retrievedDocs.map((doc) => ({
          id: doc.id,
          text: doc.text.substring(0, 200) + "...",
          metadata: doc.metadata,
        })),
        expandedQueries,
        retrievedCount: retrievedDocs.length,
      },
    });
  } catch (error) {
    console.error("[RAG OpenAI] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate RAG answer" },
      { status: 500 }
    );
  }
}

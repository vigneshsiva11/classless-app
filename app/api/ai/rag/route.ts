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

// Map requested grade to the nearest available syllabus grade in our demo corpus
function mapToAvailableGrade(input?: number): number | undefined {
  if (!input || Number.isNaN(input)) return undefined;
  // Our demo corpus has content for grades: 6, 8, 10, 12
  if ([6, 8, 10, 12].includes(input)) return input;
  if (input <= 5) return 6;
  if (input === 7) return 8;
  if (input === 9) return 10;
  if (input === 11) return 12;
  return undefined;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function keywordOverlapScore(query: string, doc: string): number {
  const stop = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "from",
    "this",
    "are",
    "was",
    "were",
    "have",
    "has",
    "had",
    "into",
    "about",
    "your",
    "their",
    "our",
    "you",
    "class",
  ]);
  const qToks = tokenize(query).filter((t) => !stop.has(t));
  const dToks = new Set(tokenize(doc).filter((t) => !stop.has(t)));
  if (qToks.length === 0 || dToks.size === 0) return 0;
  let hits = 0;
  for (const t of qToks) if (dToks.has(t)) hits++;
  return hits / qToks.length; // 0..1
}

function answerSuggestedForGrade(
  grade: number | undefined,
  question: string
): string | null {
  const q = question.trim().toLowerCase();
  if (!grade) return null;
  // Common simple Q&A across lower grades
  if (/(name|list).*(colors|colours)/i.test(question)) {
    return "Red, Blue, and Green are three common colors.";
  }
  if (/what comes after (number )?9\??/i.test(question)) {
    return "10 comes after 9.";
  }
  if (/days of the week|name .* days/i.test(question)) {
    return "The days of the week are: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and Sunday.";
  }
  if (/living and non[- ]living/i.test(question)) {
    return "Living things grow, need food and water, and can move on their own. Non‑living things do not grow, do not need food, and cannot move by themselves.";
  }
  if (/what is a noun\??/i.test(question)) {
    return "A noun is a naming word. It names a person, place, animal, or thing.";
  }
  if (/parts of a plant/i.test(question)) {
    return "Main parts of a plant are: root, stem, leaves, flower, and fruit.";
  }
  if (/water cycle/i.test(question)) {
    return "The water cycle has evaporation, condensation, and precipitation. Water evaporates, forms clouds, and falls as rain.";
  }
  if (/fraction/i.test(question)) {
    return "A fraction shows equal parts of a whole, like 1/2 or 3/4.";
  }
  if (/photosynthesis/i.test(question)) {
    return "Photosynthesis is how plants make food using sunlight, water, and carbon dioxide to produce sugar and oxygen.";
  }
  if (/states? of matter/i.test(question)) {
    return "The three states of matter are solid, liquid, and gas.";
  }

  // Grade-specific suggested fallbacks
  switch (grade) {
    case 1:
      if (/add\s*2\s*(and|\+)\s*3/i.test(question)) return "2 + 3 = 5.";
      break;
    case 2:
      if (/subtract\s*7\s*(and|from|-)\s*4|7\s*-\s*4/i.test(question))
        return "7 - 4 = 3.";
      break;
    case 3:
      if (/add\s*15\s*(and|\+)\s*6|15\s*\+\s*6/i.test(question))
        return "15 + 6 = 21.";
      break;
    case 4:
      if (/subtract\s*50\s*(and|from|-)\s*27|50\s*-\s*27/i.test(question))
        return "50 - 27 = 23.";
      break;
    case 6:
      if (/add\s*23\s*(and|\+)\s*8|23\s*\+\s*8/i.test(question))
        return "23 + 8 = 31.";
      break;
    case 7:
      if (/define\s+integers?/i.test(question))
        return "Integers are whole numbers and their negatives: ...,-3,-2,-1,0,1,2,3,...";
      if (
        /speed.*velocity|difference between speed and velocity/i.test(question)
      )
        return "Speed is how fast an object moves (distance/time). Velocity is speed with direction (displacement/time).";
      if (/what is an adjective\??/i.test(question))
        return "An adjective is a describing word. It tells us more about a noun (e.g., big, red, happy).";
      break;
    case 8:
      if (/what is motion\??/i.test(question))
        return "Motion is a change in position of an object with time.";
      if (/what is force\??/i.test(question))
        return "Force is a push or pull that can change an object's state of motion.";
      if (/multiply fractions|multiplying fractions/i.test(question))
        return "To multiply fractions, multiply numerators together and denominators together: (a/b)×(c/d)=(ac)/(bd).";
      break;
    case 9:
      if (/define\s+atom\s+and\s+molecule/i.test(question))
        return "An atom is the smallest unit of an element. A molecule is two or more atoms bonded together.";
      if (/coordinate geometry/i.test(question))
        return "Coordinate geometry studies points, lines, and shapes using the (x, y) coordinate plane.";
      if (/types of motion/i.test(question))
        return "Types include translatory, rotatory, oscillatory, and random motion.";
      break;
    case 10:
      if (/what is light\??/i.test(question))
        return "Light is a form of energy that enables vision and travels in straight lines.";
      if (/ohm'?s law|ohms law/i.test(question))
        return "Ohm's law: V = I×R, where V is voltage, I current, and R resistance.";
      if (/quadratic equation/i.test(question))
        return "A quadratic equation has the form ax² + bx + c = 0 (a≠0).";
      break;
    case 11:
      if (/newton'?s laws? of motion/i.test(question))
        return "Newton's laws: (1) Inertia, (2) F=ma, (3) Action-Reaction.";
      if (/what is a limit|limit in calculus/i.test(question))
        return "A limit describes the value a function approaches as the input approaches a point.";
      if (/chemical bonding/i.test(question))
        return "Chemical bonding is the attraction between atoms to form compounds, mainly ionic, covalent, and metallic bonds.";
      break;
    case 12:
      if (/angular momentum/i.test(question))
        return "Angular momentum (L) is rotational analog of linear momentum; for a particle L = r × p and is conserved without external torque.";
      if (/derivative of\s*x\^?n|derivative of x\^n/i.test(question))
        return "If n is a real number, d/dx(x^n) = n·x^(n−1).";
      if (/alkanes?/i.test(question))
        return "Alkanes are saturated hydrocarbons with only single bonds (general formula CnH2n+2).";
      break;
  }
  return null;
}

function answerGeneralTopic(question: string, grade?: number): string | null {
  // Computers: generations overview
  if (/generations? of computers?|computer generations?/i.test(question)) {
    return [
      "Computer generations:",
      "1st (1940s–50s): Vacuum tubes; machine language; very large, hot, slow.",
      "2nd (1950s–60s): Transistors; assembly languages; smaller, faster, more reliable.",
      "3rd (1960s–70s): Integrated Circuits (ICs); high-level languages; multiprogramming.",
      "4th (1970s–present): Microprocessors (LSI/VLSI); personal computers; GUIs, networks.",
      "5th (present–future): AI-focused systems; parallel processing; neural networks; natural language.",
    ].join("\n");
  }

  // Operating Systems: processes, threads, memory, scheduling, file systems (incl. virtual memory)
  if (
    /\b(os|operating system|process(?:es)?|thread(?:s)?|scheduling|scheduler|file system|filesystem|memory management|virtual memory|paging|page fault|swapping|swap)\b/i.test(
      question
    )
  ) {
    return [
      "Operating Systems overview:",
      "Process vs Thread: A process has its own memory space; a thread is a lightweight unit of execution within a process sharing memory.",
      "CPU Scheduling: Common algorithms include FCFS, SJF, Priority, and Round-Robin (time quantum).",
      "Memory Management: Paging divides memory into fixed-size pages/frames; segmentation uses variable-size segments.",
      "Virtual Memory: Uses disk (swap) to extend RAM; demand paging loads pages on access; page faults occur when pages are not in RAM.",
      "File Systems: Provide files/directories, allocation (contiguous, linked, indexed), and metadata (permissions, timestamps).",
    ].join("\n");
  }

  // DBMS: relational model, SQL basics, normalization, ACID
  if (
    /(dbms|database|sql|relational model|normalization|acid|transaction)/i.test(
      question
    )
  ) {
    return [
      "DBMS overview:",
      "Relational Model: Data in tables (relations) with rows (tuples) and columns (attributes). Keys uniquely identify rows.",
      "SQL Basics: SELECT-FROM-WHERE for queries; INSERT/UPDATE/DELETE to modify; CREATE/ALTER/DROP for schema.",
      "Normalization: 1NF (no repeating groups), 2NF (no partial dependency), 3NF (no transitive dependency) to reduce redundancy.",
      "Transactions & ACID: Atomicity, Consistency, Isolation, Durability ensure reliable multi-step operations.",
    ].join("\n");
  }

  // Networking: OSI/TCP-IP, IP, HTTP, switching vs routing
  if (
    /(network|osi|tcp\/?ip|ip address|http|switching|routing|router|switch)/i.test(
      question
    )
  ) {
    return [
      "Computer Networks overview:",
      "Models: OSI (7 layers) vs TCP/IP (4–5 layers). Layers separate concerns from physical transmission to applications.",
      "IP: Network layer addressing and routing; IPv4 uses dotted decimal (e.g., 192.168.1.1); packets are routed hop-by-hop.",
      "HTTP: Application-layer protocol for the web; request methods like GET/POST; stateless over TCP (often port 80/443).",
      "Switching vs Routing: Switches operate at Layer 2 (MAC) to forward within a LAN; Routers operate at Layer 3 (IP) to forward between networks.",
    ].join("\n");
  }
  return null;
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
    const answerLang = response_language || "en";

    async function translateIfNeeded(text: string): Promise<string> {
      if (!text || answerLang === "en") return text;
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const completion = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Translate into language code ${answerLang}. Keep numbers, formulas, and proper nouns intact.\n\n${text}`,
                },
              ],
            },
          ],
        });
        const out = completion.response.text();
        return out?.trim() || text;
      } catch {
        return text;
      }
    }

    // Try basic arithmetic for any grade
    {
      const mathAnswer = tryBasicMath(question);
      if (mathAnswer) {
        const translated = await translateIfNeeded(`Answer: ${mathAnswer}`);
        return NextResponse.json({
          success: true,
          data: {
            answer: translated,
            context: [{ id: "math-basic-ops", score: 1 }],
          },
        });
      }
    }

    // Early general-topic fallback (OS/DBMS/Networking/Computer Generations)
    {
      const gt = answerGeneralTopic(
        question,
        typeof grade === "number" ? grade : undefined
      );
      if (gt) {
        const translated = await translateIfNeeded(gt);
        return NextResponse.json({
          success: true,
          data: { answer: translated, context: [] },
        });
      }
    }

    const effectiveGrade = typeof grade === "number" ? grade : undefined;
    const mappedGrade = mapToAvailableGrade(effectiveGrade);

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
          filter: mappedGrade ? { grade: { $eq: mappedGrade } } : undefined,
        });
        const contexts: string[] = [];
        res.matches?.forEach((m: any) => {
          const meta = m?.metadata || {};
          const metaGrade =
            typeof meta.grade === "string" ? parseInt(meta.grade) : meta.grade;
          if (mappedGrade && metaGrade !== mappedGrade) {
            return;
          }
          const text = meta.text || meta.content || "";
          if (text) contexts.push(text);
        });
        retrieved = contexts.join("\n\n");
        // If Pinecone returns no context, fall back to in-memory filtered by grade
        if (!retrieved) {
          await ensureEmbeddings(embeddingModel);
          const q2 = await embeddingModel.embedContent(question);
          const qEmbedding2 = q2.embedding.values as unknown as number[];
          const baseCorpus = mappedGrade
            ? corpus.filter((c) => c.metadata?.grade === mappedGrade)
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
        const baseCorpus = mappedGrade
          ? corpus.filter((c) => c.metadata?.grade === mappedGrade)
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
        const baseCorpus = mappedGrade
          ? corpus.filter((c) => c.metadata?.grade === mappedGrade)
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
    if (!retrieved || retrieved.trim().length === 0) {
      // Always try suggested/fallback answers for lower grades when user clicked a suggestion
      const suggestedAns = answerSuggestedForGrade(
        typeof grade === "number" ? grade : undefined,
        question
      );
      if (suggestedAns) {
        const translated = await translateIfNeeded(suggestedAns);
        return NextResponse.json({
          success: true,
          data: { answer: translated, context: [] },
        });
      }

      // Try general topic fallbacks (e.g., computer generations)
      const generalTopic = answerGeneralTopic(
        question,
        typeof grade === "number" ? grade : undefined
      );
      if (generalTopic) {
        const translated = await translateIfNeeded(generalTopic);
        return NextResponse.json({
          success: true,
          data: { answer: translated, context: [] },
        });
      }

      // As a last resort, generate a brief high-level answer appropriate for the class
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const gradeText = grade
          ? `Class ${grade}`
          : "the appropriate class level";
        const completion = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Give a short, syllabus-friendly overview suitable for ${gradeText} about: "${question}". Keep it 3-6 bullet points or 3-5 sentences. Reply in language code ${answerLang}.`,
                },
              ],
            },
          ],
        });
        const text = completion.response.text()?.trim();
        if (text) {
          return NextResponse.json({
            success: true,
            data: { answer: text, context: [] },
          });
        }
      } catch {}

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
    const prompt = `You are an AI tutor for ${gradeText} students.\nUse only the following context to answer the question.\nIf the answer is not in the context, and the topic is generally part of standard school curricula (e.g., computer generations, basic science/math), provide a brief high-level answer suitable for ${gradeText}. Otherwise say "I don't know because it is out of syllabus."\nRespond concisely in language code: ${answerLang}.\n\nContext:\n${trimmedContext}\n\nQuestion (lang=${
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
          const translated = await translateIfNeeded(defaultAnswer);
          return NextResponse.json({
            success: true,
            data: {
              answer: translated,
              context: ranked?.length
                ? ranked.map((r) => ({ id: r.chunk.id, score: r.score }))
                : undefined,
            },
          });
        }
        await new Promise((r) => setTimeout(r, 300 * (i + 1)));
      }
    }

    const finalAnswer = await translateIfNeeded(answer || defaultAnswer);
    return NextResponse.json({
      success: true,
      data: {
        answer: finalAnswer,
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

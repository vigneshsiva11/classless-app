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
  {
    id: "science-8-motion-1",
    text: "In Class 8 Science, Motion is the change in position of an object with time. Speed is distance traveled per unit time.",
    metadata: { subject: "science", grade: 8, chapter: "Motion" },
  },
  {
    id: "math-8-fractions-1",
    text: "In Class 8 Math, to add fractions, first make the denominators same, then add numerators.",
    metadata: { subject: "mathematics", grade: 8, chapter: "Fractions" },
  },
];

let isEmbedded = false;

async function ensureEmbeddings(embeddingModel: any) {
  if (isEmbedded) return;
  for (const c of corpus) {
    const res = await embeddingModel.embedContent(c.text);
    c.embedding = res.embedding.values as unknown as number[];
  }
  isEmbedded = true;
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
      } catch (e) {
        // Fallback to in-memory
        await ensureEmbeddings(embeddingModel);
        const q = await embeddingModel.embedContent(question);
        const qEmbedding = q.embedding.values as unknown as number[];
        ranked = corpus
          .map((c) => ({
            chunk: c,
            score: cosineSimilarity(c.embedding!, qEmbedding),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 4);
        retrieved = ranked.map((r) => r.chunk.text).join("\n\n");
      }
    } else {
      // In-memory
      await ensureEmbeddings(embeddingModel);
      const q = await embeddingModel.embedContent(question);
      const qEmbedding = q.embedding.values as unknown as number[];
      ranked = corpus
        .map((c) => ({
          chunk: c,
          score: cosineSimilarity(c.embedding!, qEmbedding),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
      // Apply grade filter for in-memory corpus if provided
      if (typeof grade === "number") {
        ranked = ranked.filter((r) => r.chunk?.metadata?.grade === grade);
      }
      retrieved = ranked.map((r) => r.chunk.text).join("\n\n");
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

    // Build prompt (cap context to ~2k chars for speed)
    const prompt = `You are an AI tutor for 8th standard students.\nUse only the following context to answer the question.\nIf the answer is not in the context, say "I don't know because it is out of syllabus."\nRespond concisely in language code: ${answerLang}.\n\nContext:\n${retrieved.slice(
      0,
      2000
    )}\n\nQuestion (lang=${language || "en"}):\n${question}\n\nAnswer:`;

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
          return NextResponse.json({
            success: true,
            data: {
              answer: "I don't know because it is out of syllabus.",
              context: [],
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

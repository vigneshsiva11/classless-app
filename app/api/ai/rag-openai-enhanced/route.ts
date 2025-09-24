import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { contentManagementService } from "@/lib/content-management-service";
import { vectorDatabaseService } from "@/lib/vector-database-service";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    console.error("[RAG OpenAI Enhanced] Query expansion failed:", error);
    return [question];
  }
}

// Step 2: Retrieve Documents from Vector Database
async function retrieveDocuments(
  query: string,
  grade?: number,
  topK: number = 5
): Promise<any[]> {
  try {
    // Infer subject from question to tighten retrieval
    const qLower = query.toLowerCase();
    const mathKeywords = [
      "polynomial",
      "algebra",
      "equation",
      "fraction",
      "geometry",
      "triangle",
      "right triangle",
      "angle",
      "line",
      "shape",
      "polygon",
      "circle",
      "perimeter",
      "area",
      "volume",
      "mensuration",
      "coordinate",
      "graph",
      "trigonometry",
      "matrix",
      "determinant",
      "calculus",
    ];
    const inferredSubject = mathKeywords.some((k) => qLower.includes(k))
      ? "mathematics"
      : undefined;

    // Two-pass retrieval: try subject-focused first, then broaden
    let results = [] as any[];
    if (inferredSubject) {
      results = await vectorDatabaseService.searchSimilar(query, {
        topK: topK + 5,
        grade,
        subject: inferredSubject,
        filter: { isSyllabus: true },
      });
    }
    // If too few, broaden without subject but keep syllabus filter
    if (!results || results.length < 2) {
      const broad = await vectorDatabaseService.searchSimilar(query, {
        topK: topK + 5,
        grade,
        filter: { isSyllabus: true },
      });
      results = [...(results || []), ...broad];
    }

    // If syllabus-filtered results are few, broaden search and then prefer syllabus
    let fallbackResults: any[] = [];
    if (!results || results.length < 3) {
      const broad = await vectorDatabaseService.searchSimilar(query, {
        topK: topK + 5,
        grade,
      });
      fallbackResults = broad.map((r) => ({
        id: r.id,
        text: r.text || "",
        metadata: r.metadata,
        score: r.score,
      }));
    }

    const all = [
      ...results.map((r) => ({
        id: r.id,
        text: r.text || "",
        metadata: r.metadata,
        score: (r as any).score || 0,
      })),
      ...fallbackResults,
    ];

    // Re-rank: prioritize syllabus entries, then by score, then subject match
    const unique = new Map<string, any>();
    for (const item of all) {
      if (!unique.has(item.id) || item.score > unique.get(item.id).score) {
        unique.set(item.id, item);
      }
    }
    let reranked = Array.from(unique.values())
      .sort((a, b) => {
        const aSyl = a?.metadata?.isSyllabus ? 1 : 0;
        const bSyl = b?.metadata?.isSyllabus ? 1 : 0;
        if (aSyl !== bSyl) return bSyl - aSyl;
        const aSub = (a?.metadata?.subject || "").toLowerCase();
        const bSub = (b?.metadata?.subject || "").toLowerCase();
        if (inferredSubject && aSub !== bSub) {
          if (aSub === inferredSubject) return -1;
          if (bSub === inferredSubject) return 1;
        }
        return (b.score || 0) - (a.score || 0);
      })
      .slice(0, topK + 1);

    // Final filter: if we inferred subject, drop obvious mismatches unless not enough results
    if (inferredSubject) {
      const filtered = reranked.filter(
        (d) => (d?.metadata?.subject || "").toLowerCase() === inferredSubject
      );
      if (filtered.length >= Math.min(topK, 3)) reranked = filtered;
    }

    return reranked.slice(0, topK);
  } catch (error) {
    console.error("[RAG OpenAI Enhanced] Document retrieval failed:", error);

    // Fallback to content management service
    try {
      const fallbackResults = await contentManagementService.searchContent(
        query,
        {
          grade,
        },
        topK
      );

      return fallbackResults.map((result) => ({
        id: result.id,
        text: result.text,
        metadata: result.metadata,
        score: 0.5, // Default score for fallback
      }));
    } catch (fallbackError) {
      console.error(
        "[RAG OpenAI Enhanced] Fallback retrieval also failed:",
        fallbackError
      );
      return [];
    }
  }
}

// Step 3: Generate Answer with OpenAI
async function generateAnswer(
  question: string,
  retrievedDocs: any[],
  grade?: number
): Promise<string> {
  const gradeText = grade ? `Class ${grade}` : "appropriate grade level";
  const context = retrievedDocs.map((doc) => doc.text).join("\n\n");

  const prompt = `You are an AI tutor for ${gradeText} students. Prefer syllabus-aligned information when available. Use the following context to answer the question accurately and helpfully.

Context:
${context}

Question: ${question}

Instructions:
- Answer based on the provided context
- If the context doesn't contain enough information, say so clearly
- Use simple, clear language appropriate for the grade level
- Provide examples when helpful
 - If the question is outside the syllabus, provide a brief high-level overview and note it's beyond syllabus
 - Structure the answer as: brief concept, step-by-step explanation, 1-2 examples, short recap

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
    console.error("[RAG OpenAI Enhanced] Answer generation failed:", error);
    // Fallback: extractive concise answer from retrieved context
    if (retrievedDocs?.length) {
      const first = (retrievedDocs[0].text || "").trim();
      if (first) {
        const excerpt = first
          .split(/(?<=[.!?])\s+/)
          .slice(0, 2)
          .join(" ");
        return `From the syllabus: ${excerpt}`;
      }
    }
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
      `[RAG OpenAI Enhanced] Processing question: "${question}" (Grade: ${grade})`
    );

    // Initialize content management service if needed
    try {
      await contentManagementService.initialize();
    } catch (error) {
      console.error(
        "[RAG OpenAI Enhanced] Failed to initialize content management:",
        error
      );
      return NextResponse.json(
        { success: false, error: "Content management service unavailable" },
        { status: 500 }
      );
    }

    // Step 1: Query Expansion / Rephrasing
    const expandedQueries = await expandQuery(question, grade);
    console.log("[RAG OpenAI Enhanced] Expanded queries:", expandedQueries);

    // Step 2: Retrieve Documents using multiple queries
    const allRetrievedDocs: any[] = [];
    for (const expandedQuery of expandedQueries) {
      const docs = await retrieveDocuments(expandedQuery, grade, 3);
      allRetrievedDocs.push(...docs);
    }

    // Remove duplicates and limit results
    const uniqueDocs = new Map();
    allRetrievedDocs.forEach((doc) => {
      if (!uniqueDocs.has(doc.id) || uniqueDocs.get(doc.id).score < doc.score) {
        uniqueDocs.set(doc.id, doc);
      }
    });
    const retrievedDocs = Array.from(uniqueDocs.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    console.log(
      `[RAG OpenAI Enhanced] Retrieved ${retrievedDocs.length} documents`
    );

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
          score: doc.score,
        })),
        expandedQueries,
        retrievedCount: retrievedDocs.length,
        source: "vector_database",
      },
    });
  } catch (error) {
    console.error("[RAG OpenAI Enhanced] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate RAG answer" },
      { status: 500 }
    );
  }
}

// GET endpoint for health check and statistics
export async function GET(request: NextRequest) {
  try {
    await contentManagementService.initialize();

    const stats = await contentManagementService.getContentStatistics();

    return NextResponse.json({
      success: true,
      data: {
        status: "healthy",
        statistics: stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[RAG OpenAI Enhanced] Health check failed:", error);
    return NextResponse.json(
      { success: false, error: "Service unavailable" },
      { status: 500 }
    );
  }
}

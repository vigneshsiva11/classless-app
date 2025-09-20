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
    // Use the vector database service for retrieval
    const results = await vectorDatabaseService.searchSimilar(query, {
      topK,
      grade,
    });

    return results.map((result) => ({
      id: result.id,
      text: result.text || "",
      metadata: result.metadata,
      score: result.score,
    }));
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
- Structure your answer with clear explanations and examples

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

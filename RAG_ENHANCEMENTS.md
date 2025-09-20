# RAG Tutor Enhancements

This document describes the enhancements made to the RAG (Retrieval-Augmented Generation) tutor to improve its accuracy and user experience.

## 🚀 New Features

### 1. Query Expansion / Rephrasing

**What it does:** When a user asks a question, the system first generates 2-3 expanded/rephrased versions to improve retrieval accuracy.

**Example:**

- User asks: "What is Newton's law?"
- System expands to:
  - "What is Newton's law?"
  - "Explain Newton's three laws of motion for Class 8 Physics"
  - "What are the fundamental laws of motion in physics?"

**Implementation:** Uses Gemini to generate educational variations that include:

- More specific educational terminology
- Related concepts from the same topic
- Grade-level context
- Synonyms and alternative phrasings

### 2. Hybrid Search (Keyword + Semantic)

**What it does:** Combines BM25-style keyword search with vector similarity search for better retrieval.

**How it works:**

- **Vector Search (70% weight):** Uses embeddings for semantic similarity
- **Keyword Search (30% weight):** Uses BM25-style term overlap scoring
- **Combined Score:** Weighted average of both approaches

**Benefits:**

- If embeddings fail, keyword search still finds related material
- Better handling of exact term matches
- Improved recall for both semantic and literal queries

### 3. Confidence-Based Answering

**What it does:** Provides different response styles based on retrieval confidence levels.

**Confidence Levels:**

- **High (≥0.7):** Complete, confident answer from context
- **Medium (0.4-0.7):** Partial/related answer with disclaimer
- **Low (<0.4):** Brief overview or "out of syllabus" response

**Example Responses:**

```
High Confidence: "Speed is how fast an object moves (distance/time). Velocity is speed with direction (displacement/time)."

Medium Confidence: "I couldn't find an exact match, but here's something related: Light refraction occurs when light bends as it passes from one medium to another, like when a pencil appears bent in water."

Low Confidence: "This isn't directly in the syllabus, but related to communication technology: The telephone was invented by Alexander Graham Bell in 1876."
```

### 4. Fallback to Partial Answers

**What it does:** Instead of hard "I don't know" responses, provides related information when possible.

**Strategy:**

1. Try to find exact matches first
2. If no exact match, look for related concepts
3. Provide partial answers with appropriate disclaimers
4. Only use "out of syllabus" as last resort

### 5. Few-Shot Prompting for Generalization

**What it does:** Includes examples in the prompt to guide the AI's response style.

**Examples included:**

- High confidence responses
- Medium confidence partial answers
- Low confidence related information
- Out-of-syllabus handling

## 🔧 Technical Implementation

### Query Expansion Function

```typescript
async function expandQuery(
  question: string,
  grade?: number,
  genAI?: any
): Promise<string[]>;
```

### Hybrid Search Function

```typescript
function hybridSearch(
  query: string,
  corpus: DocChunk[],
  queryEmbedding: number[],
  topK: number = 5
): Array<{
  chunk: DocChunk;
  score: number;
  confidence: "high" | "medium" | "low";
}>;
```

### Confidence Calculation

```typescript
const maxScore = Math.max(...ranked.map((r) => r.score));
const confidence =
  maxScore >= 0.7 ? "high" : maxScore >= 0.4 ? "medium" : "low";
```

## 📊 Performance Improvements

### Before Enhancements:

- Single query retrieval
- Binary confidence (match/no match)
- Hard "I don't know" responses
- Vector-only search

### After Enhancements:

- Multi-query expansion retrieval
- Graduated confidence levels
- Partial answer fallbacks
- Hybrid keyword + vector search
- Few-shot guided responses

## 🧪 Testing

Use the provided test script to verify enhancements:

```bash
node test-rag-enhancements.js
```

Test cases include:

- Query expansion effectiveness
- Partial answer generation
- Confidence-based responses
- Out-of-syllabus handling
- Hybrid search performance

## 🎯 Expected Outcomes

1. **Better Retrieval:** Query expansion increases chances of finding relevant content
2. **More Helpful Responses:** Partial answers provide value even when exact matches aren't found
3. **Appropriate Confidence:** Users understand the reliability of answers
4. **Robust Search:** Hybrid approach works even if one method fails
5. **Consistent Quality:** Few-shot examples guide consistent response patterns

## 🔄 Backward Compatibility

All enhancements are backward compatible:

- Existing API endpoints unchanged
- Fallback mechanisms preserve original behavior
- No breaking changes to frontend integration

## 🚀 Future Enhancements

Potential future improvements:

- Dynamic confidence thresholds based on question type
- User feedback integration for confidence calibration
- Advanced query expansion with domain-specific knowledge
- Multi-modal retrieval (text + images)
- Personalized confidence thresholds per user

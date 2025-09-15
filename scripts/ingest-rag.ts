/**
 * Simple RAG ingestion script
 * Usage:
 *   PINECONE_API_KEY=... PINECONE_INDEX=classless-rag GEMINI_API_KEY=... npm run ingest:rag -- ./content
 * The script will read .txt and .md files, chunk into ~300-word blocks,
 * create embeddings with Gemini, and upsert to Pinecone with metadata.
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname, basename } from "path";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAI } from "@google/generative-ai";

const pcApiKey = process.env.PINECONE_API_KEY as string;
const pcIndexName = process.env.PINECONE_INDEX as string;
const geminiKey = process.env.GEMINI_API_KEY as string;

if (!pcApiKey || !pcIndexName || !geminiKey) {
  console.error(
    "Missing env vars. Require PINECONE_API_KEY, PINECONE_INDEX, GEMINI_API_KEY"
  );
  process.exit(1);
}

const rootDir = process.argv[2] || "./content";

function walkFiles(dir: string, files: string[] = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, files);
    else if ([".txt", ".md"].includes(extname(entry).toLowerCase()))
      files.push(full);
  }
  return files;
}

function chunkText(text: string, targetWords = 300): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + targetWords, words.length);
    chunks.push(words.slice(start, end).join(" "));
    start = end;
  }
  return chunks.filter((c) => c.trim().length > 0);
}

async function main() {
  console.log("[Ingest] Starting ingestion from:", rootDir);
  const files = walkFiles(rootDir);
  console.log(`[Ingest] Found ${files.length} files`);

  const pc = new Pinecone({ apiKey: pcApiKey });
  const index = pc.index(pcIndexName);
  const genAI = new GoogleGenerativeAI(geminiKey);
  const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const chunks = chunkText(content, 300);
    console.log(`[Ingest] ${basename(file)} → ${chunks.length} chunks`);

    const vectors: any[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      const id = `${basename(file)}::${i}`;
      const emb = await embedModel.embedContent(text);
      const values = emb.embedding.values as unknown as number[];
      vectors.push({
        id,
        values,
        metadata: { text, source: file },
      });
    }

    // Upsert in batches
    for (let i = 0; i < vectors.length; i += 50) {
      const batch = vectors.slice(i, i + 50);
      await index.upsert(batch);
    }
  }

  console.log("[Ingest] Completed");
}

main().catch((e) => {
  console.error("[Ingest] Error:", e);
  process.exit(1);
});

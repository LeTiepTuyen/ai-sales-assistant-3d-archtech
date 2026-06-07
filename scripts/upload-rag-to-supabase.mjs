import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const chunksPath = path.join(rootDir, "data", "chunks", "chunks.json");
const summaryPath = path.join(rootDir, "data", "chunks", "ingestion-summary.json");
const envLocalPath = path.join(rootDir, ".env.local");

const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_EMBEDDING_DIMENSIONS = 768;
const BATCH_SIZE = 10;
const MAX_EMBED_RETRIES = 5;
const PLACEHOLDER_VALUES = new Set(["", "NEEDS_INPUT", "YOUR_API_KEY", "YOUR_API_KEY_HERE"]);

function requiredEnv(name) {
  const value = process.env[name]?.trim() ?? "";

  if (PLACEHOLDER_VALUES.has(value)) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function loadEnvLocal() {
  try {
    const raw = await readFile(envLocalPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separator = trimmed.indexOf("=");
      if (separator < 0) {
        continue;
      }

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] ??= value;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
}

function optionalIntEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback;
}

function vectorPayload(values) {
  return `[${values.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(message, attempt) {
  const retryMatch = message.match(/retry in ([\d.]+)s/i);
  const retrySeconds = retryMatch ? Number(retryMatch[1]) : NaN;

  if (Number.isFinite(retrySeconds)) {
    return Math.ceil(retrySeconds * 1000) + 1000;
  }

  return Math.min(60000, 2000 * 2 ** attempt);
}

async function embedText(text, apiKey) {
  const model = process.env.GEMINI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;
  const dimensions = optionalIntEnv("GEMINI_EMBEDDING_DIMENSIONS", DEFAULT_EMBEDDING_DIMENSIONS);

  for (let attempt = 0; attempt <= MAX_EMBED_RETRIES; attempt += 1) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }]
          },
          outputDimensionality: dimensions
        })
      }
    );
    const data = await response.json();

    if (!response.ok) {
      const message = data.error?.message ?? `Gemini embedding failed with ${response.status}`;
      const isRetryable = response.status === 429 || response.status >= 500;

      if (isRetryable && attempt < MAX_EMBED_RETRIES) {
        const delay = retryDelayMs(message, attempt);
        process.stdout.write(`Embedding rate limited; retrying in ${Math.round(delay / 1000)}s\n`);
        await sleep(delay);
        continue;
      }

      throw new Error(message);
    }

    const values = data.embedding?.values;

    if (!Array.isArray(values) || values.length !== dimensions) {
      throw new Error(`Expected ${dimensions} embedding values, received ${values?.length ?? 0}.`);
    }

    return values;
  }

  throw new Error("Gemini embedding failed after retries.");
}

async function loadUploadedChunkIds(client) {
  const uploaded = new Set();
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from("rag_chunks")
      .select("chunk_id")
      .not("embedding", "is", null)
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Failed to read existing chunk embeddings: ${error.message}`);
    }

    for (const row of data ?? []) {
      uploaded.add(row.chunk_id);
    }

    if (!data || data.length < pageSize) {
      return uploaded;
    }
  }
}

async function upsertDocuments(client, summary) {
  const rows = summary.documents.map((document) => ({
    document_id: document.documentId,
    file_name: document.fileName,
    source_path: document.sourcePath,
    file_type: document.fileType,
    document_type: document.documentType,
    service_category: document.serviceCategory,
    file_size_bytes: document.fileSizeBytes,
    modified_at: document.modifiedAt,
    ingested_at: document.ingestedAt,
    status: document.status,
    extracted_characters: document.extractedCharacters,
    chunk_count: document.chunkCount,
    warnings: document.warnings ?? [],
    error: document.error
  }));

  const { error } = await client.from("rag_documents").upsert(rows, {
    onConflict: "document_id"
  });

  if (error) {
    throw new Error(`Failed to upsert documents: ${error.message}`);
  }
}

async function upsertChunks(client, chunks, apiKey) {
  const uploadedChunkIds = await loadUploadedChunkIds(client);
  const pendingChunks = chunks.filter((chunk) => !uploadedChunkIds.has(chunk.chunkId));
  let uploaded = 0;

  if (uploadedChunkIds.size > 0) {
    process.stdout.write(`Skipping ${uploadedChunkIds.size}/${chunks.length} chunks that already have embeddings\n`);
  }

  if (pendingChunks.length === 0) {
    return {
      skipped: uploadedChunkIds.size,
      uploaded: 0
    };
  }

  for (let index = 0; index < pendingChunks.length; index += BATCH_SIZE) {
    const batch = pendingChunks.slice(index, index + BATCH_SIZE);
    const rows = [];

    for (const chunk of batch) {
      const embedding = await embedText(chunk.text, apiKey);
      rows.push({
        chunk_id: chunk.chunkId,
        document_id: chunk.documentId,
        document_name: chunk.documentName,
        document_type: chunk.documentType,
        service_category: chunk.serviceCategory,
        page_start: chunk.pageStart,
        page_end: chunk.pageEnd,
        section_title: chunk.sectionTitle,
        text: chunk.text,
        token_estimate: chunk.tokenEstimate,
        embedding: vectorPayload(embedding),
        created_at: chunk.createdAt
      });
      await sleep(150);
    }

    const { error } = await client.from("rag_chunks").upsert(rows, {
      onConflict: "chunk_id"
    });

    if (error) {
      throw new Error(`Failed to upsert chunks ${index + 1}-${index + batch.length}: ${error.message}`);
    }

    uploaded += rows.length;
    process.stdout.write(`Uploaded ${uploaded}/${pendingChunks.length} pending chunks\n`);
  }

  return {
    skipped: uploadedChunkIds.size,
    uploaded
  };
}

async function main() {
  await loadEnvLocal();

  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const geminiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    "";

  if (PLACEHOLDER_VALUES.has(geminiKey)) {
    throw new Error("Missing Gemini API key for embeddings.");
  }

  const [chunks, summary] = await Promise.all([
    readFile(chunksPath, "utf8").then(JSON.parse),
    readFile(summaryPath, "utf8").then(JSON.parse)
  ]);

  if (!Array.isArray(chunks) || chunks.length === 0) {
    throw new Error("No chunks found. Run npm run ingest before uploading.");
  }

  if (!Array.isArray(summary.documents) || summary.documents.length === 0) {
    throw new Error("No document summary found. Run npm run ingest before uploading.");
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  await upsertDocuments(client, summary);
  const uploadResult = await upsertChunks(client, chunks, geminiKey);
  process.stdout.write(
    `Supabase RAG upload complete: ${summary.documents.length} documents, ${uploadResult.uploaded} uploaded chunks, ${uploadResult.skipped} skipped chunks.\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

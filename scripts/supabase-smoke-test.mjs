import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_EMBEDDING_DIMENSIONS = 768;
const PLACEHOLDER_VALUES = new Set(["", "NEEDS_INPUT", "YOUR_API_KEY", "YOUR_API_KEY_HERE"]);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envLocalPath = path.join(rootDir, ".env.local");

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

async function embedText(text, apiKey) {
  const model = process.env.GEMINI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;
  const dimensions = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS) || DEFAULT_EMBEDDING_DIMENSIONS;
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
    throw new Error(data.error?.message ?? `Gemini embedding failed with ${response.status}`);
  }

  return data.embedding?.values;
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

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const [{ count: documentCount, error: documentError }, { count: chunkCount, error: chunkError }] =
    await Promise.all([
      client.from("rag_documents").select("*", { count: "exact", head: true }),
      client.from("rag_chunks").select("*", { count: "exact", head: true })
    ]);

  if (documentError) {
    throw new Error(`Document count check failed: ${documentError.message}`);
  }

  if (chunkError) {
    throw new Error(`Chunk count check failed: ${chunkError.message}`);
  }

  const embedding = await embedText(
    "Explain Digital Twin for a manufacturing client in business language.",
    geminiKey
  );

  const { data, error } = await client.rpc("match_rag_chunks", {
    query_embedding: embedding,
    match_threshold: 0.18,
    match_count: 5,
    filter_document_type: null,
    filter_service_category: null
  });

  if (error) {
    throw new Error(`Vector match RPC failed: ${error.message}`);
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Vector match RPC returned no chunks.");
  }

  console.log("Supabase RAG smoke test passed");
  console.log(`- documents: ${documentCount ?? 0}`);
  console.log(`- chunks: ${chunkCount ?? 0}`);
  console.log(`- matches: ${data.length}`);
  console.log(`- top source: ${data[0].document_name} (${data[0].chunk_id})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

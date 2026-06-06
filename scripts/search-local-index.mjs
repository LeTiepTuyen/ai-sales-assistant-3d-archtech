import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const indexPath = path.join(rootDir, "data", "chunks", "retrieval-index.json");

function tokenize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u1ef9]+/gi, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function scoreChunk(queryTokens, chunk) {
  const text = `${chunk.documentName} ${chunk.documentType} ${chunk.serviceCategory} ${chunk.text}`;
  const chunkTokens = tokenize(text);
  const frequencies = new Map();

  for (const token of chunkTokens) {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }

  return queryTokens.reduce((score, token) => {
    const exact = frequencies.get(token) ?? 0;
    const partial = chunkTokens.some((chunkToken) => chunkToken.includes(token)) ? 0.25 : 0;
    return score + exact + partial;
  }, 0);
}

export async function searchLocalIndex(query, options = {}) {
  const raw = await readFile(indexPath, "utf8");
  const index = JSON.parse(raw);
  const queryTokens = tokenize(query);
  const limit = options.limit ?? 5;

  if (queryTokens.length === 0) {
    return [];
  }

  return index.chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(queryTokens, chunk)
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const query = process.argv.slice(2).join(" ");

if (query) {
  const results = await searchLocalIndex(query);
  console.log(
    JSON.stringify(
      {
        query,
        resultCount: results.length,
        results: results.map((result) => ({
          score: result.score,
          chunkId: result.chunkId,
          documentName: result.documentName,
          documentType: result.documentType,
          serviceCategory: result.serviceCategory,
          pageStart: result.pageStart,
          sectionTitle: result.sectionTitle,
          preview: result.text.slice(0, 320)
        }))
      },
      null,
      2
    )
  );
}

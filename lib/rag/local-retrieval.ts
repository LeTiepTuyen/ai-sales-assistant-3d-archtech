import { promises as fs } from "node:fs";
import path from "node:path";

export type LocalChunk = {
  chunkId: string;
  documentId: string;
  documentName: string;
  documentType: string;
  serviceCategory: string;
  pageStart: number | null;
  pageEnd: number | null;
  sectionTitle: string | null;
  tokenEstimate: number;
  text: string;
};

export type LocalRetrievalResult = LocalChunk & {
  score: number;
};

export type LocalRetrievalOptions = {
  limit?: number;
  documentType?: string;
  serviceCategory?: string;
  indexPath?: string;
};

type RetrievalIndex = {
  generatedAt: string;
  retrievalMode: string;
  chunkCount: number;
  chunks: LocalChunk[];
};

const defaultIndexPath = path.join(
  process.cwd(),
  "data",
  "chunks",
  "retrieval-index.json"
);

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u1ef9]+/gi, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function scoreChunk(queryTokens: string[], chunk: LocalChunk) {
  const text = `${chunk.documentName} ${chunk.documentType} ${chunk.serviceCategory} ${chunk.text}`;
  const chunkTokens = tokenize(text);
  const frequencies = new Map<string, number>();

  for (const token of chunkTokens) {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }

  return queryTokens.reduce((score, token) => {
    const exact = frequencies.get(token) ?? 0;
    const partial = chunkTokens.some((chunkToken) => chunkToken.includes(token)) ? 0.25 : 0;
    return score + exact + partial;
  }, 0);
}

export async function loadLocalRetrievalIndex(indexPath = defaultIndexPath) {
  const raw = await fs.readFile(indexPath, "utf8");
  return JSON.parse(raw) as RetrievalIndex;
}

export async function retrieveLocalChunks(
  query: string,
  options: LocalRetrievalOptions = {}
): Promise<LocalRetrievalResult[]> {
  const index = await loadLocalRetrievalIndex(options.indexPath);
  const queryTokens = tokenize(query);
  const limit = options.limit ?? 5;

  if (queryTokens.length === 0) {
    return [];
  }

  return index.chunks
    .filter((chunk) =>
      options.documentType ? chunk.documentType === options.documentType : true
    )
    .filter((chunk) =>
      options.serviceCategory ? chunk.serviceCategory === options.serviceCategory : true
    )
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(queryTokens, chunk)
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

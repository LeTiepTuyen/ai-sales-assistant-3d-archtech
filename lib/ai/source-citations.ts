import type { LocalRetrievalResult } from "@/lib/rag/local-retrieval";

export type SourceCitation = {
  chunkId: string;
  documentName: string;
  documentType: string;
  serviceCategory: string;
  pageStart: number | null;
  pageEnd: number | null;
  sectionTitle: string | null;
  score: number;
  preview: string;
};

export function buildCitations(chunks: LocalRetrievalResult[]): SourceCitation[] {
  return chunks.map((chunk) => ({
    chunkId: chunk.chunkId,
    documentName: chunk.documentName,
    documentType: chunk.documentType,
    serviceCategory: chunk.serviceCategory,
    pageStart: chunk.pageStart,
    pageEnd: chunk.pageEnd,
    sectionTitle: chunk.sectionTitle,
    score: Number(chunk.score.toFixed(2)),
    preview: chunk.text.slice(0, 260)
  }));
}

export function formatCitation(citation: SourceCitation) {
  const location = citation.pageStart
    ? `page ${citation.pageStart}`
    : citation.sectionTitle
      ? citation.sectionTitle
      : "chunk";

  return `${citation.documentName}, ${location}, ${citation.chunkId}`;
}

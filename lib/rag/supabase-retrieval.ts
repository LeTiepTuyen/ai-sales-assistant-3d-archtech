import { embedWithGemini } from "@/lib/ai/embeddings";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabase/server";
import type { LocalRetrievalOptions, LocalRetrievalResult } from "@/lib/rag/local-retrieval";

type SupabaseMatchRow = {
  chunk_id: string;
  document_id: string;
  document_name: string;
  document_type: string;
  service_category: string;
  page_start: number | null;
  page_end: number | null;
  section_title: string | null;
  text: string;
  similarity: number;
};

export async function retrieveSupabaseChunks(
  query: string,
  options: LocalRetrievalOptions = {}
): Promise<LocalRetrievalResult[]> {
  if (!isSupabaseServerConfigured()) {
    return [];
  }

  const client = getSupabaseServerClient();
  const embedding = await embedWithGemini(query);

  if (!client || !embedding) {
    return [];
  }

  const { data, error } = await client.rpc("match_rag_chunks", {
    query_embedding: embedding,
    match_threshold: 0.18,
    match_count: options.limit ?? 6,
    filter_document_type: options.documentType ?? null,
    filter_service_category: options.serviceCategory ?? null
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SupabaseMatchRow[]).map((row) => ({
    chunkId: row.chunk_id,
    documentId: row.document_id,
    documentName: row.document_name,
    documentType: row.document_type,
    serviceCategory: row.service_category,
    pageStart: row.page_start,
    pageEnd: row.page_end,
    sectionTitle: row.section_title,
    tokenEstimate: Math.ceil(row.text.length / 4),
    text: row.text,
    score: row.similarity
  }));
}

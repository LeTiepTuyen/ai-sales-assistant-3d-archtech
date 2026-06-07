import { retrieveLocalChunks, type LocalRetrievalOptions, type LocalRetrievalResult } from "@/lib/rag/local-retrieval";
import { retrieveSupabaseChunks } from "@/lib/rag/supabase-retrieval";

export type RetrievalBackend = "local" | "supabase";

export type RetrievalOptions = LocalRetrievalOptions & {
  backend?: RetrievalBackend;
};

export async function retrieveChunks(
  query: string,
  options: RetrievalOptions = {}
): Promise<LocalRetrievalResult[]> {
  const requestedBackend = options.backend ?? process.env.RAG_BACKEND?.trim();

  if (requestedBackend === "supabase") {
    try {
      const chunks = await retrieveSupabaseChunks(query, options);

      if (chunks.length > 0) {
        return chunks;
      }
    } catch (error) {
      console.warn(
        "[rag] Supabase retrieval failed; falling back to local retrieval.",
        error instanceof Error ? error.message : error
      );
    }
  }

  return retrieveLocalChunks(query, options);
}

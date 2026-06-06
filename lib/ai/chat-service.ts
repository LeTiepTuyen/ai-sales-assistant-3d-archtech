import { routeIntent } from "@/lib/ai/intent-router";
import { buildCitations, formatCitation } from "@/lib/ai/source-citations";
import { generateWithGemini, isGeminiConfigured } from "@/lib/ai/gemini";
import { retrieveLocalChunks, type LocalRetrievalResult } from "@/lib/rag/local-retrieval";

export type ChatRequest = {
  message: string;
  mode?: string;
};

function contextBlock(chunks: LocalRetrievalResult[]) {
  if (chunks.length === 0) {
    return "No retrieved source context was found for this request.";
  }

  return chunks
    .map((chunk, index) => {
      const location = chunk.pageStart
        ? `page ${chunk.pageStart}`
        : chunk.sectionTitle ?? "section unavailable";

      return [
        `Source ${index + 1}: ${chunk.documentName} (${location}, ${chunk.chunkId})`,
        chunk.text
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

function localFallbackAnswer(
  message: string,
  routeLabel: string,
  chunks: LocalRetrievalResult[]
) {
  if (chunks.length === 0) {
    return [
      `${routeLabel}: NEEDS_INPUT`,
      "",
      "No supporting source chunks were found in the local retrieval index for this request.",
      "Please add more specific client context or review whether the relevant source document was ingested."
    ].join("\n");
  }

  const evidence = chunks.slice(0, 3).map((chunk, index) => {
    const source = `${chunk.documentName}${chunk.pageStart ? `, page ${chunk.pageStart}` : ""}`;
    const preview = chunk.text.replace(/\s+/g, " ").slice(0, 520);
    return `${index + 1}. ${source}: ${preview}`;
  });

  return [
    `${routeLabel}: source-grounded local fallback`,
    "",
    `Question: ${message}`,
    "",
    "Relevant source evidence:",
    ...evidence,
    "",
    "Draft answer:",
    "Use the evidence above as the factual basis. Any client-specific outcomes, pricing, timeline, quantified ROI, or unsupported implementation details remain NEEDS_INPUT until verified from source documents or provided by the user."
  ].join("\n");
}

export async function answerChat(request: ChatRequest) {
  const route = routeIntent(request.message, request.mode);
  const retrievalQuery = `${request.message} ${route.preferredServiceCategory ?? ""}`;

  let chunks = await retrieveLocalChunks(retrievalQuery, {
    limit: 6,
    serviceCategory: route.preferredServiceCategory
  });

  if (chunks.length < 3) {
    const fallbackChunks = await retrieveLocalChunks(retrievalQuery, {
      limit: 6
    });
    const seen = new Set(chunks.map((chunk) => chunk.chunkId));
    chunks = [...chunks, ...fallbackChunks.filter((chunk) => !seen.has(chunk.chunkId))].slice(0, 6);
  }

  const citations = buildCitations(chunks);
  let answer = "";
  let provider: "gemini" | "local_fallback" = "local_fallback";
  let geminiFallbackReason = "";

  if (isGeminiConfigured()) {
    const systemInstruction = [
      "You are a source-grounded AI Sales Assistant for 3D Archtech.",
      "Use only retrieved source context and user-provided input.",
      "Do not invent company facts, client outcomes, pricing, timelines, metrics, or implementation results.",
      "If retrieved source context is empty or a detail is not supported, write NEEDS_INPUT.",
      "Use concise professional business English.",
      "End with a Sources section listing the cited source names and chunk IDs."
    ].join("\n");

    const userPrompt = [
      `Intent: ${route.label}`,
      `User request: ${request.message}`,
      "",
      "Retrieved context:",
      contextBlock(chunks),
      "",
      "Available citations:",
      citations.length > 0 ? citations.map(formatCitation).join("\n") : "None"
    ].join("\n");

    try {
      answer = (await generateWithGemini({ systemInstruction, userPrompt })) ?? "";
      if (answer) {
        provider = "gemini";
      }
    } catch {
      geminiFallbackReason =
        "Gemini generation failed. Local fallback was used; check the server-side API key, selected model, quota, or network access.";
    }
  }

  if (!answer) {
    answer = localFallbackAnswer(request.message, route.label, chunks);
  }

  return {
    intent: route.intent,
    intentLabel: route.label,
    provider,
    answer,
    sources: citations,
    needsInput:
      chunks.length === 0
        ? [
            "No supporting source chunks found for this request.",
            ...(geminiFallbackReason ? [geminiFallbackReason] : [])
          ]
        : [
            "Verify client-specific outcomes, timeline, budget, and metrics before external use.",
            ...(geminiFallbackReason ? [geminiFallbackReason] : [])
          ]
  };
}

import { routeIntent } from "@/lib/ai/intent-router";
import { buildCitations, formatCitation } from "@/lib/ai/source-citations";
import { generateWithGemini, isGeminiConfigured } from "@/lib/ai/gemini";
import { retrieveLocalChunks, type LocalRetrievalResult } from "@/lib/rag/local-retrieval";
import { Buffer } from "node:buffer";
import mammoth from "mammoth";

export type ChatRequest = {
  message: string;
  mode?: string;
  attachments?: ChatAttachment[];
};

export type ChatAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  kind: "image" | "file";
  text?: string;
  contentBase64?: string;
};

function stripSourcesSection(answer: string) {
  const sourcesIndex = answer.search(/\n#{1,3}\s*sources\s*\n/i);

  if (sourcesIndex >= 0) {
    return answer.slice(0, sourcesIndex).trim();
  }

  return answer.replace(/\n#{1,3}\s*sources\s*$/i, "").trim();
}

async function extractAttachmentText(attachment: ChatAttachment) {
  if (attachment.text?.trim()) {
    return attachment.text.trim();
  }

  if (!attachment.contentBase64?.trim()) {
    return "";
  }

  const buffer = Buffer.from(attachment.contentBase64, "base64");
  const fileName = attachment.name.toLowerCase();
  const mimeType = attachment.type.toLowerCase();

  if (fileName.endsWith(".docx") || mimeType.includes("wordprocessingml.document")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (fileName.endsWith(".txt") || fileName.endsWith(".csv") || mimeType.startsWith("text/")) {
    return buffer.toString("utf8").trim();
  }

  return "";
}

async function buildAttachmentContext(attachments: ChatAttachment[] = []) {
  const extracted = await Promise.all(
    attachments.map(async (attachment) => {
      try {
        const text = await extractAttachmentText(attachment);
        if (!text) {
          return "";
        }

        return [
          `Attachment: ${attachment.name}`,
          `Type: ${attachment.type || "application/octet-stream"}`,
          text.trim()
        ].join("\n");
      } catch {
        return [
          `Attachment: ${attachment.name}`,
          "Unable to extract text from this file. Use the visible metadata only."
        ].join("\n");
      }
    })
  );

  return extracted.filter((value) => value.trim()).join("\n\n---\n\n");
}

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
  chunks: LocalRetrievalResult[],
  attachmentContext?: string
) {
  if (chunks.length === 0) {
    return [
      `## ${routeLabel}`,
      "**Status:** NEEDS_INPUT",
      "",
      "No supporting source chunks were found in the local retrieval index for this request.",
      attachmentContext
        ? "Uploaded client brief content was received, but it did not produce searchable support for this answer."
        : "Please add more specific client context or review whether the relevant source document was ingested."
    ].join("\n");
  }

  const evidence = chunks.slice(0, 3).map((chunk, index) => {
    const source = `${chunk.documentName}${chunk.pageStart ? `, page ${chunk.pageStart}` : ""}`;
    const preview = chunk.text.replace(/\s+/g, " ").slice(0, 520);
    return `${index + 1}. ${source}: ${preview}`;
  });

  return [
    `## ${routeLabel}`,
    "**Status:** Source-grounded local fallback",
    "",
    `**Question:** ${message}`,
    "",
    attachmentContext ? "### Uploaded client brief" : "",
    attachmentContext ? attachmentContext : "",
    attachmentContext ? "" : "",
    "### Key evidence",
    ...evidence,
    "",
    "### Draft guidance",
    "Use the evidence above as the factual basis. Any client-specific outcomes, pricing, timeline, quantified ROI, or unsupported implementation details remain NEEDS_INPUT until verified from source documents or provided by the user."
  ].join("\n");
}

export async function answerChat(request: ChatRequest) {
  const route = routeIntent(request.message, request.mode);
  const retrievalQuery = `${request.message} ${route.preferredServiceCategory ?? ""}`;
  const attachmentContext = await buildAttachmentContext(request.attachments);

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
      "Write as a polished senior sales assistant with a warm, confident, client-ready tone.",
      "Return well-structured Markdown with a clear title, short intro, section headings, selective bullet points, and bold emphasis for key business points.",
      "Make the answer detailed, focused, and specific enough to be reused in a client conversation.",
      "Do not include a Sources section because citations are shown separately in the UI."
    ].join("\n");

    const userPrompt = [
      `Intent: ${route.label}`,
      `User request: ${request.message}`,
      "",
      "Retrieved context:",
      contextBlock(chunks),
      "",
      "Uploaded client brief:",
      attachmentContext || "No uploaded attachment content was available.",
      "",
      "Available citations:",
      citations.length > 0 ? citations.map(formatCitation).join("\n") : "None"
    ].join("\n");

    try {
      answer = (await generateWithGemini({ systemInstruction, userPrompt })) ?? "";
      if (answer) {
        answer = stripSourcesSection(answer);
        provider = "gemini";
      }
    } catch {
      geminiFallbackReason =
        "Gemini generation failed. Local fallback was used; check the server-side API key, selected model, quota, or network access.";
    }
  }

  if (!answer) {
    answer = localFallbackAnswer(request.message, route.label, chunks, attachmentContext);
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

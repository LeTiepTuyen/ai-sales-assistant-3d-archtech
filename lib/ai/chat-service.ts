import { routeIntent } from "@/lib/ai/intent-router";
import { buildCitations, formatCitation, type SourceCitation } from "@/lib/ai/source-citations";
import { generateWithGemini, isGeminiConfigured } from "@/lib/ai/gemini";
import type { LocalRetrievalResult } from "@/lib/rag/local-retrieval";
import { retrieveChunks } from "@/lib/rag/retrieval";
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

type AttachmentContext = {
  text: string;
  citations: SourceCitation[];
};

const proposalHeadings = [
  "Proposal Title",
  "Prepared For / Prepared By",
  "Executive Summary",
  "Client Context and Pain Points",
  "Proposed Solution",
  "Scope of Work",
  "Manufacturing Use Case Alignment",
  "Implementation Approach",
  "Expected Business Value",
  "Assumptions and Items to Confirm",
  "Risks and Dependencies",
  "Recommended Next Steps",
  "Source Notes"
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

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

async function buildAttachmentContext(attachments: ChatAttachment[] = []): Promise<AttachmentContext> {
  const extracted = await Promise.all(
    attachments.map(async (attachment, index) => {
      try {
        const text = await extractAttachmentText(attachment);
        if (!text) {
          return null;
        }

        const cleanText = text.trim();
        const citation: SourceCitation = {
          chunkId: `uploaded-${index + 1}-${slugify(attachment.name) || "attachment"}`,
          documentName: attachment.name,
          documentType: "uploaded_client_brief",
          serviceCategory: "client_context",
          pageStart: null,
          pageEnd: null,
          sectionTitle: "Uploaded client brief",
          score: 1,
          preview: cleanText.replace(/\s+/g, " ").slice(0, 260)
        };

        return {
          block: [
          `Attachment: ${attachment.name}`,
          `Type: ${attachment.type || "application/octet-stream"}`,
            cleanText
          ].join("\n"),
          citation
        };
      } catch {
        const fallbackText = [
          `Attachment: ${attachment.name}`,
          "Unable to extract text from this file. Use the visible metadata only."
        ].join("\n");

        return {
          block: fallbackText,
          citation: null
        };
      }
    })
  );

  const usable = extracted.filter((value): value is { block: string; citation: SourceCitation | null } =>
    Boolean(value?.block.trim())
  );

  return {
    text: usable.map((value) => value.block).join("\n\n---\n\n"),
    citations: usable
      .map((value) => value.citation)
      .filter((value): value is SourceCitation => Boolean(value))
  };
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
      "**Status:** Additional source context recommended",
      "",
      "No supporting source chunks were found in the local retrieval index for this request.",
      attachmentContext
        ? "Uploaded client brief content was received and can still be used as client-provided context."
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
    "Use the evidence above as the factual basis. Any client-specific outcomes, pricing, timeline, quantified ROI, or unsupported implementation details should be confirmed before external use."
  ].join("\n");
}

function extractField(text: string, labels: string[]) {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*:\\s*([^\\n\\r]+)`, "i");
    const match = text.match(pattern);
    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
  }

  return "";
}

function inferProposalContext(message: string, attachmentText: string) {
  const combined = `${message}\n${attachmentText}`;
  const lower = combined.toLowerCase();
  const clientName =
    extractField(combined, ["client", "client name", "company", "customer"]) ||
    (attachmentText ? "the client described in the uploaded brief" : "the client");
  const painPoints =
    extractField(combined, ["pain points", "pain point", "challenge", "challenges", "problem"]) ||
    "the operational challenges described by Sales or in the uploaded brief";
  const goal =
    extractField(combined, ["goal", "business goal", "business goals", "objective", "objectives"]) ||
    "create a client-ready solution proposal";
  const services =
    lower.includes("digital twin")
      ? "Digital Twin solution"
      : lower.includes("visualization") || lower.includes("visualisation")
        ? "3D visualization solution"
        : lower.includes("ar") || lower.includes("vr")
          ? "AR/VR solution"
          : "3D Archtech solution";
  const industry =
    lower.includes("manufacturing") ||
    lower.includes("factory") ||
    lower.includes("production line")
      ? "Manufacturing"
      : "the client's industry";

  return {
    clientName,
    painPoints,
    goal,
    services,
    industry
  };
}

function buildSourceNotes(attachmentCitations: SourceCitation[], retrievalCitations: SourceCitation[]) {
  const notes = [
    ...attachmentCitations.map((source) => `Uploaded brief: ${source.documentName}`),
    ...retrievalCitations.slice(0, 5).map((source) => formatCitation(source))
  ];

  return notes.length ? notes : ["No cited source chunks were available for this draft."];
}

function buildLocalProposalAnswer(
  message: string,
  chunks: LocalRetrievalResult[],
  attachmentContext: AttachmentContext
) {
  const inferred = inferProposalContext(message, attachmentContext.text);
  const retrievalCitations = buildCitations(chunks);
  const sourceNotes = buildSourceNotes(attachmentContext.citations, retrievalCitations);
  const supportingEvidence = chunks
    .slice(0, 4)
    .map((chunk) => `${chunk.documentName}: ${chunk.text.replace(/\s+/g, " ").slice(0, 280)}`);
  const uploadedBriefSummary = attachmentContext.text
    ? attachmentContext.text.replace(/\s+/g, " ").slice(0, 900)
    : "No uploaded brief text was available. The draft below uses the user's message as the client-provided context.";

  return [
    `## Client-Ready ${inferred.services} Proposal for ${inferred.clientName}`,
    "",
    "### Prepared For / Prepared By",
    `**Prepared for:** ${inferred.clientName}`,
    "**Prepared by:** 3D Archtech Sales Assistant",
    `**Industry focus:** ${inferred.industry}`,
    "",
    "### Executive Summary",
    `${inferred.clientName} is seeking a practical solution that addresses ${inferred.painPoints}. This proposal recommends a ${inferred.services} designed to help manufacturing stakeholders improve operational visibility, communicate production-line conditions more clearly, and evaluate improvement scenarios before decisions are made on the factory floor.`,
    "",
    `The proposal is intentionally written as a client-ready draft: it turns the available brief into a structured business conversation, keeps commitments realistic, and separates confirmed context from items that Sales should validate before external delivery.`,
    "",
    "### Client Context and Pain Points",
    `The main client context used for this draft is: ${uploadedBriefSummary}`,
    "",
    `Based on that context, the central business challenge is ${inferred.painPoints}. In a manufacturing environment, this type of challenge often affects production visibility, cross-team decision-making, issue escalation, and the ability to compare operational scenarios in a format that both technical and business stakeholders can understand.`,
    "",
    "### Proposed Solution",
    `3D Archtech should position the recommended ${inferred.services} as a business-facing digital layer for manufacturing operations. The solution should translate production-line context into a visual, explainable, and decision-ready experience for operations, production, engineering, and management teams.`,
    "",
    "The proposed solution can include:",
    "- A visual representation of relevant production lines, assets, stations, or process areas.",
    "- Real-time or near-real-time operational monitoring where validated data connections are available.",
    "- Scenario simulation views that help stakeholders compare what-if changes before committing to operational action.",
    "- Role-friendly dashboards or guided views for production, maintenance, management, and client-facing demonstrations.",
    "- A structured proposal and implementation roadmap that can be adjusted after confirming data availability, delivery constraints, and success criteria.",
    "",
    "### Scope of Work",
    "The recommended scope should be presented in phases so the demo remains credible and the client can understand how the solution moves from discovery to a usable business tool.",
    "",
    "- Discovery and requirements alignment: confirm client goals, production-line scope, user groups, source systems, and decision workflows.",
    "- Data and process mapping: identify which operational signals, assets, and process stages should be visualized or simulated.",
    "- Experience design: define the client-facing views, interaction model, and business-friendly storytelling structure.",
    "- Digital twin or visualization build: create the core 3D/visual environment, dashboard logic, and scenario demonstration flow.",
    "- Review and refinement: validate the draft experience with Sales and client stakeholders before final demo handoff.",
    "- Handoff support: provide usage notes, demo prompts, and recommended next-step materials for Sales follow-up.",
    "",
    "### Manufacturing Use Case Alignment",
    "For a manufacturing client, the strongest value story is not simply that the system looks modern. The stronger business story is that the solution helps teams see operations, understand constraints, and discuss improvement scenarios in one shared visual language.",
    "",
    "The proposal should emphasize alignment with:",
    "- Production-line visibility for faster understanding of operational status.",
    "- Scenario simulation for planning, stakeholder discussion, and risk-aware decision-making.",
    "- Business-friendly communication between technical teams and decision makers.",
    "- Reusable demo and proposal assets that Sales can adapt for future manufacturing conversations.",
    "",
    "### Implementation Approach",
    "A practical implementation approach should start with a focused pilot rather than an enterprise-wide build. The pilot can center on one representative production line, one process area, or one high-value monitoring scenario. This keeps the project demo-focused while still showing a credible path toward a broader digital twin roadmap.",
    "",
    "Recommended implementation flow:",
    "- Confirm the manufacturing process and priority use cases.",
    "- Select the first production-line area for the pilot.",
    "- Gather available diagrams, process notes, operational data expectations, and stakeholder requirements.",
    "- Build a visual prototype that demonstrates monitoring and scenario simulation clearly.",
    "- Review the prototype with Sales and client stakeholders.",
    "- Prepare a polished proposal/export package for client follow-up.",
    "",
    "### Expected Business Value",
    "The expected business value should be framed as directional benefits unless the client provides verified metrics. The draft can credibly position value around improved visibility, clearer operational conversations, faster stakeholder alignment, and stronger support for manufacturing improvement planning.",
    "",
    "Potential value areas include:",
    "- Better shared understanding of production-line status and constraints.",
    "- More professional communication of complex technical operations to management stakeholders.",
    "- A clearer foundation for discussing future automation, IoT integration, or digital transformation initiatives.",
    "- A reusable sales demonstration that helps the client evaluate the solution before committing to a larger scope.",
    "",
    "### Assumptions and Items to Confirm",
    "Sales should confirm the project timeline, budget range, production-line scope, data availability, required integrations, and measurable success criteria before sending a final external proposal. Any quantified ROI, cost-saving claim, delivery commitment, or production-performance claim should be added only after the client or source materials provide support.",
    "",
    "### Risks and Dependencies",
    "Key dependencies include access to accurate production-line information, clarity on which systems provide operational data, stakeholder availability for review, and agreement on the level of simulation fidelity required. The main delivery risk is scope expansion: a digital twin can become broad quickly, so the first proposal should define a focused pilot and then outline optional expansion paths.",
    "",
    "### Recommended Next Steps",
    "- Confirm the client decision makers and workshop participants.",
    "- Validate the manufacturing line or process area to be used in the first pilot.",
    "- Request any available diagrams, layouts, process descriptions, or data-source notes.",
    "- Align on the proposal timeline and preferred export format.",
    "- Prepare a revised client-ready version after Sales confirms the open items.",
    "",
    "### Source Notes",
    ...sourceNotes.map((note) => `- ${note}`),
    supportingEvidence.length ? "" : "",
    supportingEvidence.length ? "### Supporting Context Used" : "",
    ...supportingEvidence.map((item) => `- ${item}`)
  ]
    .filter((line) => line !== "")
    .join("\n\n");
}

function buildProposalSystemInstruction() {
  return [
    "You are a senior AI Sales Assistant for 3D Archtech.",
    "Write a detailed, client-ready proposal in professional academic/business English.",
    "Use the uploaded brief and user-provided request as the primary client context.",
    "Use retrieved context only for source-grounded 3D Archtech service framing, proposal style, and supporting internal material.",
    "Do not invent company facts, client results, pricing, delivery timeline, ROI, metrics, architecture details, or implementation commitments.",
    "Do not name specific client systems such as SCADA, MES, ERP, PLCs, databases, or protocols unless the user, uploaded brief, or retrieved source context explicitly mentions them.",
    "Frame business value as directional benefits, not guaranteed or quantified results, unless the source context provides verified metrics.",
    "If a detail is not supported, do not stop the answer. Put it under 'Assumptions and Items to Confirm' in plain language.",
    "Do not use all-caps missing-information labels anywhere.",
    "Be more expansive than a short answer: produce a complete proposal draft with polished paragraphs and selective bullet points.",
    "When a comparison table is useful, use standard Markdown table syntax with a header row and separator row. Do not use ASCII box-drawing tables inside code fences.",
    "For manufacturing use cases, emphasize production-line visibility, monitoring, scenario simulation, stakeholder communication, and practical implementation phasing.",
    `Use these Markdown sections in this order: ${proposalHeadings.join("; ")}.`,
    "Do not add a section named Sources because citations are displayed separately in the UI."
  ].join("\n");
}

export async function answerChat(request: ChatRequest) {
  const route = routeIntent(request.message, request.mode);
  const retrievalQuery = `${request.message} ${route.preferredServiceCategory ?? ""}`;
  const attachmentContext = await buildAttachmentContext(request.attachments);

  let chunks = await retrieveChunks(retrievalQuery, {
    limit: 6,
    serviceCategory: route.preferredServiceCategory
  });

  if (chunks.length < 3) {
    const fallbackChunks = await retrieveChunks(retrievalQuery, {
      limit: 6
    });
    const seen = new Set(chunks.map((chunk) => chunk.chunkId));
    chunks = [...chunks, ...fallbackChunks.filter((chunk) => !seen.has(chunk.chunkId))].slice(0, 6);
  }

  const retrievalCitations = buildCitations(chunks);
  const citations = [...attachmentContext.citations, ...retrievalCitations];
  let answer = "";
  let provider: "gemini" | "local_fallback" = "local_fallback";
  let geminiFallbackReason = "";
  const isProposalRequest = route.intent === "proposal_support";

  if (isGeminiConfigured()) {
    const systemInstruction = isProposalRequest
      ? buildProposalSystemInstruction()
      : [
          "You are a source-grounded AI Sales Assistant for 3D Archtech.",
          "Use only retrieved source context and user-provided input.",
          "Do not invent company facts, client outcomes, pricing, timelines, metrics, or implementation results.",
          "Do not name specific client systems, databases, protocols, or architecture components unless they appear in the user input or source context.",
          "If a detail is not supported, say that it should be confirmed before external use instead of inventing it.",
          "Do not use all-caps missing-information labels anywhere.",
          "Write as a polished senior sales assistant with a warm, confident, client-ready tone.",
          "Return well-structured Markdown with a clear title, short intro, section headings, selective bullet points, and bold emphasis for key business points.",
          "When a table is useful, use standard Markdown table syntax. Do not use ASCII box-drawing tables inside code fences.",
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
      attachmentContext.text || "No uploaded attachment content was available.",
      "",
      "Available citations:",
      citations.length > 0 ? citations.map(formatCitation).join("\n") : "None"
    ].join("\n");

    try {
      answer =
        (await generateWithGemini({
          systemInstruction,
          userPrompt,
          maxOutputTokens: isProposalRequest ? 12000 : 8192,
          temperature: isProposalRequest ? 0.42 : 0.35,
          topP: 0.92
        })) ?? "";
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
    answer = isProposalRequest
      ? buildLocalProposalAnswer(request.message, chunks, attachmentContext)
      : localFallbackAnswer(request.message, route.label, chunks, attachmentContext.text);
  }

  const needsConfirmation = isProposalRequest
    ? [
        "Confirm timeline, budget, source-system availability, and measurable success criteria before external use.",
        ...(geminiFallbackReason ? [geminiFallbackReason] : [])
      ]
    : chunks.length === 0
      ? [
          "No supporting source chunks found for this request.",
          ...(geminiFallbackReason ? [geminiFallbackReason] : [])
        ]
      : [
          "Verify client-specific outcomes, timeline, budget, and metrics before external use.",
          ...(geminiFallbackReason ? [geminiFallbackReason] : [])
        ];

  return {
    intent: route.intent,
    intentLabel: route.label,
    provider,
    answer,
    sources: citations,
    needsInput: needsConfirmation,
    canExport: isProposalRequest,
    exportTitle: isProposalRequest
      ? `Proposal Response - ${inferProposalContext(request.message, attachmentContext.text).clientName}`
      : undefined
  };
}

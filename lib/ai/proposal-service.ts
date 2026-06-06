import { buildCitations } from "@/lib/ai/source-citations";
import { generateWithGemini, isGeminiConfigured } from "@/lib/ai/gemini";
import { retrieveLocalChunks, type LocalRetrievalResult } from "@/lib/rag/local-retrieval";
import { routeIntent } from "@/lib/ai/intent-router";
import type { ProposalDraft, ProposalInput, ProposalSection } from "@/lib/ai/proposal-types";

const sectionTitles = [
  "Cover Page",
  "Company and Team Overview",
  "Project Overview",
  "Challenge vs. Solution Table",
  "Detailed Features",
  "Implementation Process",
  "Scope of Application",
  "Expected Results",
  "Risks, Assumptions, and NEEDS_INPUT"
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function assertProposalInput(input: ProposalInput) {
  const missing = [
    ["clientName", input.clientName],
    ["industry", input.industry],
    ["painPoints", input.painPoints],
    ["businessGoals", input.businessGoals],
    ["services", input.services]
  ]
    .filter(([, value]) => !String(value ?? "").trim())
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required proposal fields: ${missing.join(", ")}`);
  }
}

function contextBlock(chunks: LocalRetrievalResult[]) {
  if (chunks.length === 0) {
    return "No retrieved source context was found for this proposal request.";
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

function uniqueChunks(chunks: LocalRetrievalResult[]) {
  const seen = new Set<string>();
  return chunks.filter((chunk) => {
    if (seen.has(chunk.chunkId)) {
      return false;
    }
    seen.add(chunk.chunkId);
    return true;
  });
}

function sectionChunks(title: string, chunks: LocalRetrievalResult[]) {
  const lower = title.toLowerCase();
  const preferred = chunks.filter((chunk) => {
    if (lower.includes("company") || lower.includes("team")) {
      return chunk.documentType === "company_profile" || chunk.documentType === "proposal";
    }
    if (
      lower.includes("feature") ||
      lower.includes("solution") ||
      lower.includes("scope")
    ) {
      return chunk.documentType === "portfolio" || chunk.documentType === "proposal";
    }
    if (
      lower.includes("process") ||
      lower.includes("expected") ||
      lower.includes("risk")
    ) {
      return chunk.documentType === "proposal" || chunk.documentType === "prompt_library";
    }
    return true;
  });

  return preferred.length > 0 ? preferred : chunks;
}

function localSectionContent(title: string, input: ProposalInput, chunks: LocalRetrievalResult[]) {
  const topEvidence = chunks[0];
  const sourceSentence = topEvidence
    ? `Relevant source context is available from ${topEvidence.documentName}${topEvidence.pageStart ? `, page ${topEvidence.pageStart}` : ""}.`
    : "NEEDS_INPUT: No supporting source chunk was retrieved for this section.";

  if (title === "Cover Page") {
    return [
      `Draft proposal for ${input.clientName}`,
      `Industry: ${input.industry}`,
      `Proposed services: ${input.services}`,
      "Prepared as a source-grounded draft for sales review."
    ].join("\n");
  }

  if (title === "Project Overview") {
    return [
      `${input.clientName} is evaluating ${input.services} in the ${input.industry} context.`,
      `Pain points provided by Sales: ${input.painPoints}`,
      `Business goals provided by Sales: ${input.businessGoals}`,
      sourceSentence
    ].join("\n");
  }

  if (title === "Challenge vs. Solution Table") {
    return [
      `Challenge: ${input.painPoints}`,
      `Proposed solution direction: ${input.services}`,
      `Expected business alignment: ${input.businessGoals}`,
      "NEEDS_INPUT: Validate exact feature scope, delivery timeline, and measurable success criteria."
    ].join("\n");
  }

  if (title === "Expected Results") {
    return [
      "Expected results must be expressed as draft business outcomes, not verified performance metrics.",
      `Business goal basis: ${input.businessGoals}`,
      "NEEDS_INPUT: Quantified ROI, cost savings, timeline, and implementation results require verified source data or client confirmation."
    ].join("\n");
  }

  return [
    sourceSentence,
    `Client context: ${input.industry}; services requested: ${input.services}.`,
    "This section should be reviewed by Sales before external use.",
    "NEEDS_INPUT: Add verified company details or client-specific commitments where required."
  ].join("\n");
}

function buildLocalProposal(input: ProposalInput, chunks: LocalRetrievalResult[]) {
  const sections = sectionTitles.map((title) => ({
    id: slugify(title),
    title,
    content: localSectionContent(title, input, sectionChunks(title, chunks)),
    sources: buildCitations(sectionChunks(title, chunks)).slice(0, 4),
    needsInput: [
      "Verify company facts against cited source chunks.",
      "Confirm client-specific scope, timeline, budget, and measurable outcomes."
    ]
  }));

  return {
    provider: "local_fallback" as const,
    sections
  };
}

function parseGeminiProposal(text: string, fallback: ProposalSection[]) {
  if (!text.trim()) {
    return fallback;
  }

  return sectionTitles.map((title, index) => {
    const nextTitle = sectionTitles[index + 1];
    const start = text.toLowerCase().indexOf(title.toLowerCase());
    const end =
      nextTitle && start >= 0 ? text.toLowerCase().indexOf(nextTitle.toLowerCase(), start + title.length) : -1;
    const content =
      start >= 0
        ? text.slice(start + title.length, end > start ? end : undefined).trim().replace(/^[:#\-\s]+/, "")
        : fallback[index].content;

    return {
      ...fallback[index],
      content: content || fallback[index].content
    };
  });
}

export async function generateProposal(input: ProposalInput): Promise<ProposalDraft> {
  assertProposalInput(input);

  const query = [
    input.industry,
    input.painPoints,
    input.businessGoals,
    input.services,
    input.style ?? ""
  ].join(" ");

  const serviceCategory = routeIntent(input.services).preferredServiceCategory;
  const retrievedGroups = await Promise.all([
    retrieveLocalChunks(`${query} proposal template`, {
      limit: 3,
      documentType: "prompt_library"
    }),
    retrieveLocalChunks(query, {
      limit: 4,
      documentType: "proposal"
    }),
    retrieveLocalChunks(`${input.services} ${input.industry}`, {
      limit: 3,
      documentType: "company_profile"
    }),
    serviceCategory
      ? retrieveLocalChunks(`${input.services} ${input.painPoints}`, {
          limit: 5,
          serviceCategory
        })
      : retrieveLocalChunks(`${input.services} ${input.painPoints}`, {
          limit: 5,
          documentType: "portfolio"
        })
  ]);
  const chunks = uniqueChunks(retrievedGroups.flat()).slice(0, 12);
  const localProposal = buildLocalProposal(input, chunks);
  let provider: "gemini" | "local_fallback" = localProposal.provider;
  let sections = localProposal.sections;
  let geminiFallbackReason = "";

  if (isGeminiConfigured()) {
    const systemInstruction = [
      "You are a source-grounded proposal assistant for 3D Archtech.",
      "Use only retrieved context and user-provided client input.",
      "Never invent company facts, client results, pricing, timeline, metrics, or implementation commitments.",
      "Use NEEDS_INPUT for unsupported details or when retrieved context is empty.",
      "Write professional business English.",
      `Use exactly these section headings: ${sectionTitles.join("; ")}.`
    ].join("\n");

    const userPrompt = [
      "Client input:",
      JSON.stringify(input, null, 2),
      "",
      "Retrieved context:",
      contextBlock(chunks),
      "",
      "Generate a proposal draft with the required section headings."
    ].join("\n");

    try {
      const generated = await generateWithGemini({ systemInstruction, userPrompt });
      if (generated) {
        sections = parseGeminiProposal(generated, sections);
        provider = "gemini";
      }
    } catch {
      geminiFallbackReason =
        "Gemini generation failed. Local fallback was used; check the server-side API key, selected model, quota, or network access.";
    }
  }

  return {
    proposalId: `proposal-${Date.now()}`,
    provider,
    clientInput: input,
    sections,
    sources: buildCitations(chunks),
    needsInput: [
      ...(input.timeline ? [] : ["Project timeline is missing."]),
      ...(input.budget ? [] : ["Budget is missing."]),
      "All quantified outcomes require source or client confirmation.",
      ...(geminiFallbackReason ? [geminiFallbackReason] : [])
    ],
    createdAt: new Date().toISOString()
  };
}

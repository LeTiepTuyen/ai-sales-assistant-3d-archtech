import type { SourceCitation } from "@/lib/ai/source-citations";

export type ProposalInput = {
  clientName: string;
  industry: string;
  painPoints: string;
  businessGoals: string;
  services: string;
  timeline?: string;
  budget?: string;
  style?: string;
};

export type ProposalSection = {
  id: string;
  title: string;
  content: string;
  sources: SourceCitation[];
  needsInput: string[];
};

export type ProposalDraft = {
  proposalId: string;
  provider: "gemini" | "local_fallback";
  clientInput: ProposalInput;
  sections: ProposalSection[];
  sources: SourceCitation[];
  needsInput: string[];
  createdAt: string;
};

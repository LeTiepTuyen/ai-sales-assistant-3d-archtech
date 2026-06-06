"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProposalDraft } from "@/lib/ai/proposal-types";

export function ProposalPreviewPage() {
  const [proposal, setProposal] = useState<ProposalDraft | null>(null);

  useEffect(() => {
    window.setTimeout(() => {
      const raw = window.localStorage.getItem("latestProposalDraft");
      if (raw) {
        setProposal(JSON.parse(raw) as ProposalDraft);
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get("print") === "1") {
        window.setTimeout(() => window.print(), 300);
      }
    }, 0);
  }, []);

  if (!proposal) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-semibold">No proposal draft found</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Generate a proposal first, then open preview again.
        </p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl bg-card p-6 text-foreground shadow-sm print:shadow-none">
      <div className="no-print mb-6 flex justify-end">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <header className="border-b border-border pb-6">
        <h1 className="text-3xl font-semibold">
          Draft Proposal for {proposal.clientInput.clientName}
        </h1>
        <div className="mt-4 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          <p>Industry: {proposal.clientInput.industry}</p>
          <p>Services: {proposal.clientInput.services}</p>
          <p>Provider: {proposal.provider === "gemini" ? "Gemini" : "local fallback"}</p>
          <p>Created: {new Date(proposal.createdAt).toLocaleString()}</p>
        </div>
      </header>

      {proposal.needsInput.length > 0 ? (
        <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 print:bg-white">
          <h2 className="font-semibold">NEEDS_INPUT</h2>
          <ul className="mt-2 list-inside list-disc leading-6">
            {proposal.needsInput.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-8 space-y-8">
        {proposal.sections.map((section) => (
          <section key={section.id}>
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <Badge variant={section.sources.length ? "success" : "warning"}>
                {section.sources.length} sources
              </Badge>
            </div>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-7">
              {section.content}
            </div>
            {section.sources.length > 0 ? (
              <div className="mt-4 space-y-1 text-xs leading-5 text-muted-foreground">
                {section.sources.slice(0, 5).map((source) => (
                  <p key={`${section.id}-${source.chunkId}`}>
                    {source.documentName}
                    {source.pageStart ? `, page ${source.pageStart}` : ""} - {source.chunkId}
                  </p>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}

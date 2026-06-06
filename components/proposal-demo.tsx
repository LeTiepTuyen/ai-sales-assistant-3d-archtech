"use client";

import { FormEvent, useState } from "react";
import { Download, FileText, Printer, Sparkles } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Input } from "@/components/ui/input";
import { ShineBorder } from "@/components/ui/shine-border";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ProposalDraft } from "@/lib/ai/proposal-types";

type FormState = {
  clientName: string;
  industry: string;
  painPoints: string;
  businessGoals: string;
  services: string;
  timeline: string;
  budget: string;
  style: string;
};

type ProposalResponse = ProposalDraft & {
  error?: string;
};

const initialForm: FormState = {
  clientName: "",
  industry: "",
  painPoints: "",
  businessGoals: "",
  services: "",
  timeline: "",
  budget: "",
  style: "Use best matching old proposal"
};

const sampleForm: FormState = {
  clientName: "Demo Manufacturing Client",
  industry: "Manufacturing",
  painPoints:
    "Need real-time visibility across factory operations and clearer stakeholder communication.",
  businessGoals:
    "Improve operational decisions and communicate complex factory data in a business-friendly way.",
  services: "Digital Twin and Visualization",
  timeline: "",
  budget: "",
  style: "Use best matching old proposal"
};

export function ProposalDemo() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function generateProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = ["clientName", "industry", "painPoints", "businessGoals", "services"].filter(
      (key) => !form[key as keyof FormState].trim()
    );

    if (missing.length > 0) {
      setError("Please complete client name, industry, pain points, business goals, and proposed services.");
      setProposal(null);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const data = (await response.json()) as ProposalResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Proposal generation failed.");
      }

      window.localStorage.setItem("latestProposalDraft", JSON.stringify(data));
      setProposal(data);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Proposal generation failed.";
      setError(message);
      setProposal(null);
    } finally {
      setLoading(false);
    }
  }

  async function exportDocx() {
    if (!proposal) {
      return;
    }

    const response = await fetch("/api/proposals/export/docx", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(proposal)
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "DOCX export failed.");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${proposal.proposalId}.docx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  function openPrintPreview(print = false) {
    if (!proposal) {
      return;
    }

    window.localStorage.setItem("latestProposalDraft", JSON.stringify(proposal));
    window.open(`/proposal/preview${print ? "?print=1" : ""}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <BlurFade>
        <Card className="relative overflow-hidden">
          <ShineBorder shineColor={["#f06423", "#fbbf24", "#111216"]} duration={14} />
        <CardHeader>
          <CardTitle>Client Input</CardTitle>
          <CardDescription>
            Required fields match the approved proposal workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={generateProposal}>
            <label className="block space-y-2 text-sm font-medium">
              <span>Client name</span>
              <Input
                value={form.clientName}
                onChange={(event) => updateField("clientName", event.target.value)}
                placeholder="Example client"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Industry</span>
              <Input
                value={form.industry}
                onChange={(event) => updateField("industry", event.target.value)}
                placeholder="Manufacturing, real estate, education..."
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Pain points</span>
              <Textarea
                value={form.painPoints}
                onChange={(event) => updateField("painPoints", event.target.value)}
                placeholder="Current operational or customer communication challenges"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Business goals</span>
              <Textarea
                value={form.businessGoals}
                onChange={(event) => updateField("businessGoals", event.target.value)}
                placeholder="Business outcomes the client wants to reach"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Proposed services</span>
              <Input
                value={form.services}
                onChange={(event) => updateField("services", event.target.value)}
                placeholder="Digital Twin, AR, Visualization, IoT..."
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2 text-sm font-medium">
                <span>Timeline</span>
                <Input
                  value={form.timeline}
                  onChange={(event) => updateField("timeline", event.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                <span>Budget</span>
                <Input
                  value={form.budget}
                  onChange={(event) => updateField("budget", event.target.value)}
                  placeholder="Optional"
                />
              </label>
            </div>
            <label className="block space-y-2 text-sm font-medium">
              <span>Old proposal style</span>
              <Select
                value={form.style}
                onChange={(event) => updateField("style", event.target.value)}
              >
                <option>Use best matching old proposal</option>
                <option>FarmDiaries_Proposal_3DArchtech.pdf</option>
                <option>Knowlympic_Proposal.pdf</option>
                <option>WA_GRAB_Proposal.pdf</option>
              </Select>
            </label>
            {error ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {error}
              </div>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setForm(sampleForm);
                setError("");
              }}
            >
              Load Demo Scenario
            </Button>
            <Button type="submit" className="w-full" disabled={loading}>
              <Sparkles className="h-4 w-4" />
              {loading ? "Generating..." : "Generate Draft"}
            </Button>
          </form>
        </CardContent>
        </Card>
      </BlurFade>

      <BlurFade delay={0.06} direction="left">
        <Card className="relative overflow-hidden">
          <AnimatedGridPattern
            className="text-primary/20 [mask-image:linear-gradient(to_right,white,transparent_72%)]"
            duration={9}
            maxOpacity={0.05}
            numSquares={26}
            width={36}
            height={36}
          />
          {proposal ? (
            <BorderBeam colorFrom="#f06423" colorTo="#fbbf24" duration={9} size={110} />
          ) : null}
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Proposal Preview</CardTitle>
              <CardDescription>
                The draft is generated from local retrieval context and keeps sales review notes visible.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={!proposal} onClick={exportDocx}>
                <Download className="h-4 w-4" />
                DOCX
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!proposal}
                onClick={() => openPrintPreview(true)}
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!proposal}
                onClick={() => openPrintPreview(false)}
              >
                Preview
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {proposal ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold">
                      Draft Proposal for {form.clientName}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Industry: {form.industry}. Services: {form.services}. Provider:{" "}
                      {proposal.provider === "gemini" ? "Gemini" : "local fallback"}.
                    </p>
                  </div>
                </div>
              </div>
              {proposal.needsInput.length > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Sales Review Notes</p>
                  <ul className="mt-2 list-inside list-disc leading-6">
                    {proposal.needsInput.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="grid gap-3">
                {proposal.sections.map((section) => (
                  <section
                    key={section.id}
                    className="rounded-lg border border-border bg-card/90 p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-sm font-semibold">{section.title}</h3>
                      <Badge variant={section.sources.length > 0 ? "success" : "warning"}>
                        {section.sources.length} sources
                      </Badge>
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {section.content}
                    </div>
                    {section.sources.length > 0 ? (
                      <div className="mt-3 space-y-2 border-t border-border pt-3">
                        {section.sources.slice(0, 3).map((source) => (
                          <div key={`${section.id}-${source.chunkId}`} className="text-xs leading-5 text-muted-foreground">
                            {source.documentName}
                            {source.pageStart ? `, page ${source.pageStart}` : ""} - {source.chunkId}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <h2 className="mt-4 text-base font-semibold">
                  No draft generated
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Complete the required fields to create a placeholder proposal preview.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileText, Workflow } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShineBorder } from "@/components/ui/shine-border";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { readinessItems } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Demo Workspace"
        description="A local-first AI Sales Assistant demo for source-aware sales Q&A, prompt reuse, and proposal drafting workflows."
        status="Local demo ready"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {readinessItems.map((item, index) => {
          const Icon = item.icon;
          const variant = item.value === "Ready" ? "success" : "warning";

          return (
            <BlurFade key={item.label} delay={index * 0.04}>
              <Card className="relative overflow-hidden">
                <AnimatedGridPattern
                  className="text-primary/20 [mask-image:linear-gradient(to_right,white,transparent_76%)]"
                  duration={7}
                  maxOpacity={0.06}
                  numSquares={12}
                  width={34}
                  height={34}
                />
                {index === 0 ? (
                  <BorderBeam colorFrom="#f06423" colorTo="#fbbf24" duration={8} />
                ) : null}
                <CardHeader className="relative">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge variant={variant}>{item.value}</Badge>
                </div>
                <CardTitle>{item.label}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </BlurFade>
          );
        })}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <BlurFade delay={0.08}>
          <Card className="relative overflow-hidden">
            <ShineBorder shineColor={["#f06423", "#fbbf24", "#111216"]} duration={16} />
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#111216] text-primary">
                <Workflow className="h-4 w-4" />
              </span>
              <div>
                <CardTitle>Main Demo Flow</CardTitle>
                <CardDescription>
                  Core sales workflows stay source-aware, local-first, and demo-focused.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              {
                title: "Knowledge-base Q&A",
                description:
                  "Ask source-aware sales questions and review inline citations from local retrieval context.",
                href: "/chat"
              },
              {
                title: "AI Sales Prompt Hub",
                description:
                  "Search, customize, compile, and copy sales prompts sourced from the internal prompt workbook.",
                href: "/prompts"
              },
              {
                title: "Proposal generation",
                description:
                  "Capture client context and generate a structured proposal draft with source-aware sales review notes.",
                href: "/proposal"
              },
              {
                title: "Data source administration",
                description:
                  "Review expected source files and simulated ingestion status before the RAG package is implemented.",
                href: "/admin/data-sources"
              }
            ].map((item, index) => (
              <div
                key={item.title}
                className="group flex flex-col gap-3 rounded-lg border border-border bg-card/80 p-4 transition-all duration-200 hover:border-primary/35 hover:shadow-md hover:shadow-primary/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex gap-3">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    {index + 1}
                  </span>
                  <div>
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={item.href}>
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
          </Card>
        </BlurFade>

        <BlurFade delay={0.12} direction="left">
          <Card className="relative overflow-hidden bg-[#111216] text-white">
            <AnimatedGridPattern
              className="text-white/15 [mask-image:linear-gradient(to_bottom,white,transparent_78%)]"
              duration={9}
              maxOpacity={0.08}
              numSquares={24}
              width={32}
              height={32}
            />
            <BorderBeam colorFrom="#f06423" colorTo="#ffffff" duration={10} />
          <CardHeader>
            <CardTitle className="text-white">Implementation Boundaries</CardTitle>
          <CardDescription>
              The demo remains local-first and keeps secrets/server-side model calls out of the browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-col gap-3 text-sm">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
              <span className="text-white/78">Uses local source-derived retrieval context for source-aware Gemini responses.</span>
            </div>
            <div className="flex gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-amber-600" />
              <span className="text-white/78">Falls back locally only when Gemini is not configured or the API request fails.</span>
            </div>
            <div className="flex gap-3">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span className="text-white/78">Internal source files stay under local data folders and are not exposed publicly.</span>
            </div>
          </CardContent>
          </Card>
        </BlurFade>
      </section>
    </>
  );
}

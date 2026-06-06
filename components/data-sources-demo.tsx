"use client";

import { useState } from "react";
import { AlertCircle, FileText, RefreshCw } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { sampleSources } from "@/lib/demo-data";

type SourceState = (typeof sampleSources)[number] & {
  actionStatus?: "idle" | "queued" | "complete";
};

export function DataSourcesDemo() {
  const [sources, setSources] = useState<SourceState[]>(
    sampleSources.map((source) => ({ ...source, actionStatus: "idle" }))
  );

  function queueSource(name: string) {
    setSources((current) =>
      current.map((source) =>
        source.name === name
          ? { ...source, status: "Queued for prompt 03", actionStatus: "queued" }
          : source
      )
    );

    window.setTimeout(() => {
      setSources((current) =>
        current.map((source) =>
          source.name === name
            ? {
                ...source,
                status: "Simulated only",
                actionStatus: "complete"
              }
            : source
        )
      );
    }, 600);
  }

  return (
    <div className="flex flex-col gap-4">
      <BlurFade>
        <Card className="relative overflow-hidden">
          <AnimatedGridPattern
            className="text-primary/20 [mask-image:linear-gradient(to_right,white,transparent_72%)]"
            duration={8}
            maxOpacity={0.05}
            numSquares={22}
            width={36}
            height={36}
          />
          <BorderBeam colorFrom="#f06423" colorTo="#fbbf24" duration={10} />
        <CardHeader>
          <CardTitle>Ingestion Readiness</CardTitle>
          <CardDescription>
            Raw files are expected under `data/source-pdfs/`; extracted local indexes are generated outside the public app surface.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium">Raw source folder</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Present in workspace; not exposed under `public/`.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium">Extraction status</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Local extraction outputs are available under ignored `data/extracted/` files after ingestion.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium">Embedding status</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Supabase pgvector remains optional for a deployed demo.
              </p>
            </div>
          </div>
        </CardContent>
        </Card>
      </BlurFade>

      <BlurFade delay={0.06}>
        <Card className="relative overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Source Documents</CardTitle>
              <CardDescription>
                Registry view for expected internal sales and proposal materials.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => sources.forEach((source) => queueSource(source.name))}
            >
              <RefreshCw className="h-4 w-4" />
              Queue All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Chunks</TableHead>
                <TableHead>Last ingested</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.name}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 text-primary" />
                      <span className="font-medium">{source.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{source.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        source.actionStatus === "complete" ? "success" : "warning"
                      }
                    >
                      {source.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{source.chunks}</TableCell>
                  <TableCell>{source.lastIngested}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => queueSource(source.name)}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Re-ingest
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-6">
              The re-ingest buttons are demo UI state only. Run `npm run ingest` to refresh local extraction and chunk files.
            </p>
          </div>
        </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}

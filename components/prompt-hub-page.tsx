"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookOpenText,
  Braces,
  Briefcase,
  Check,
  Clipboard,
  ClipboardList,
  Copy,
  FileSpreadsheet,
  Lightbulb,
  Library,
  LayoutTemplate,
  MessageSquareText,
  MoreVertical,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  User
} from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShineBorder } from "@/components/ui/shine-border";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { PromptHubItem } from "@/lib/prompt-hub/read-prompts";

type PromptHubPageProps = {
  prompts: PromptHubItem[];
};

function compilePrompt(template: string, fields: Record<string, string>) {
  return template.replace(/\[([^\][\n]+)\]/g, (match, key: string) => {
    const value = fields[key.trim()]?.trim();
    return value || match;
  });
}

function labelForPlaceholder(value: string) {
  return value
    .toLowerCase()
    .split(/[\s/_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function lineCount(value: string) {
  return Math.max(value.split(/\r?\n/).length, 1);
}

function categoryLabel(value: string) {
  if (value === "Client Communication") {
    return "Client";
  }

  if (value === "Customer Insight") {
    return "Insight";
  }

  return value;
}

export function PromptHubPage({ prompts }: PromptHubPageProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(prompts[0]?.id ?? "");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<"base" | "compiled" | null>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    prompts.forEach((prompt) => {
      counts.set(prompt.category, (counts.get(prompt.category) ?? 0) + 1);
    });

    return [
      { label: "All", count: prompts.length },
      ...Array.from(counts.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, count]) => ({ label, count }))
    ];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return prompts.filter((prompt) => {
      const categoryMatch = category === "All" || prompt.category === category;
      const queryMatch =
        !normalizedQuery ||
        [
          prompt.title,
          prompt.useCase,
          prompt.category,
          prompt.template,
          prompt.placeholders.join(" ")
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return categoryMatch && queryMatch;
    });
  }, [category, prompts, query]);

  const activePrompt =
    filteredPrompts.find((prompt) => prompt.id === selectedId) ??
    filteredPrompts[0] ??
    null;

  const compiledPrompt = activePrompt
    ? compilePrompt(activePrompt.template, fields)
    : "";

  const filledPlaceholderCount = activePrompt
    ? activePrompt.placeholders.filter((placeholder) => fields[placeholder]?.trim()).length
    : 0;

  async function copyText(kind: "base" | "compiled", value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    toast.success(kind === "base" ? "Base prompt copied" : "Prompt ready to paste into Chat");
    window.setTimeout(() => setCopied(null), 1400);
  }

  function clearActiveFields() {
    if (!activePrompt) {
      return;
    }

    setFields((current) => {
      const next = { ...current };
      activePrompt.placeholders.forEach((placeholder) => {
        delete next[placeholder];
      });
      return next;
    });
  }

  if (!prompts.length) {
    return (
      <section className="relative overflow-hidden rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <BorderBeam colorFrom="#f06423" colorTo="#fbbf24" duration={10} />
        <FileSpreadsheet className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-xl font-semibold">Prompt library unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The source workbook could not be read from the local workspace.
        </p>
      </section>
    );
  }

  return (
    <section className="prompt-hub-shell relative isolate flex min-h-[calc(100dvh-8rem)] w-full max-w-full flex-col overflow-hidden rounded-lg border border-border/80 bg-[#f5f6f8] shadow-2xl shadow-black/10">
      <BorderBeam colorFrom="#f06423" colorTo="#fbbf24" duration={11} size={140} />

      <header className="relative shrink-0 overflow-hidden border-b border-white/10 bg-[#101115] px-4 py-4 text-white sm:px-5">
        <AnimatedGridPattern
          className="text-white/15 [mask-image:linear-gradient(to_right,white,transparent_82%)]"
          duration={9}
          height={34}
          maxOpacity={0.06}
          numSquares={24}
          width={34}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/75 to-transparent" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <ShineBorder duration={10} shineColor={["#fff", "#f06423", "#fff"]} />
              <Bookmark className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-normal">
                AI Sales Prompt Hub
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-white/62">
                Find, customize, and deploy high-impact prompts from the internal
                workbook.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 xl:flex xl:items-center xl:gap-4">
            <HeaderMetric
              icon={Library}
              label="Library"
              value={`${prompts.length} prompts`}
            />
            <HeaderMetric
              icon={LayoutTemplate}
              label="Templates"
              value={`${Math.max(categories.length - 1, 0)} categories`}
            />
            <HeaderMetric icon={Star} label="Favorites" value="Starred" />
            <HeaderMetric icon={Lightbulb} label="Usage Tips" value="Guide" />
          </div>
        </div>
      </header>

      <div className="prompt-hub-layout grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] overflow-x-hidden overflow-y-auto">
        <PromptLibraryPanel
          categories={categories}
          category={category}
          filteredPrompts={filteredPrompts}
          prompts={prompts}
          query={query}
          selectedId={activePrompt?.id ?? ""}
          setCategory={setCategory}
          setQuery={setQuery}
          setSelectedId={setSelectedId}
        />

        <div
          className="prompt-hub-panel-separator min-h-0 min-w-0 w-full max-w-full overflow-hidden bg-white"
        >
          {activePrompt ? (
            <PromptDetailPanel
              activePrompt={activePrompt}
              clearActiveFields={clearActiveFields}
              fields={fields}
              filledPlaceholderCount={filledPlaceholderCount}
              setFields={setFields}
            />
          ) : (
            <NoPromptSelected />
          )}
        </div>

        <div
          className="prompt-hub-panel-separator prompt-hub-preview-wrap min-h-0 min-w-0 w-full max-w-full overflow-hidden"
        >
          {activePrompt ? (
            <PromptPreviewPanel
              activePrompt={activePrompt}
              compiledPrompt={compiledPrompt}
              copied={copied}
              copyText={copyText}
            />
          ) : (
            <NoPromptSelected dark />
          )}
        </div>
      </div>
    </section>
  );
}

function HeaderMetric({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 xl:border-l xl:border-r-0 xl:border-y-0 xl:bg-transparent xl:px-5 xl:first:border-l-0">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold text-white">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-white/50">{value}</span>
      </div>
    </div>
  );
}

type CategoryOption = {
  label: string;
  count: number;
};

function PromptLibraryPanel({
  categories,
  category,
  filteredPrompts,
  prompts,
  query,
  selectedId,
  setCategory,
  setQuery,
  setSelectedId
}: {
  categories: CategoryOption[];
  category: string;
  filteredPrompts: PromptHubItem[];
  prompts: PromptHubItem[];
  query: string;
  selectedId: string;
  setCategory: (value: string) => void;
  setQuery: (value: string) => void;
  setSelectedId: (value: string) => void;
}) {
  return (
    <aside
      className="prompt-hub-panel prompt-hub-library flex h-[min(620px,calc(100dvh-12rem))] min-h-[460px] min-w-0 w-full max-w-full flex-col overflow-hidden border-border bg-[#f0f2f5] xl:h-full xl:min-h-0"
    >
      <div className="shrink-0 border-b border-border bg-card/95 p-3">
        <label className="flex h-11 min-w-0 items-center gap-2 rounded-md border border-border bg-white px-3 shadow-sm focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/10">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search prompts..."
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="mt-3">
          <ToggleGroup
            type="single"
            value={category}
            onValueChange={(value) => {
              if (value) {
                setCategory(value);
                setSelectedId("");
              }
            }}
            className="grid w-full min-w-0 grid-cols-2 gap-2"
            spacing={2}
          >
            {categories.map((item) => (
              <ToggleGroupItem
                key={item.label}
                value={item.label}
                className="h-auto w-full min-w-0 gap-2 overflow-hidden rounded-md border border-border bg-white px-2.5 py-2 text-xs text-muted-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                <span className="min-w-0 flex-1 truncate text-left">
                  {categoryLabel(item.label)}
                </span>
                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground group-data-[state=on]/toggle-group-item:bg-white/20 group-data-[state=on]/toggle-group-item:text-white">
                  {item.count}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 text-xs text-muted-foreground">
        <span className="font-semibold uppercase tracking-wide text-foreground">
          {filteredPrompts.length} prompts
        </span>
        <span className="inline-flex items-center gap-1">
          {filteredPrompts.length} / {prompts.length}
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </span>
      </div>

      <Command shouldFilter={false} className="flex min-h-0 min-w-0 flex-1 flex-col bg-transparent">
        <CommandList className="h-full max-h-none min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
            {filteredPrompts.length ? (
              <CommandGroup className="min-h-full overflow-visible p-0">
                  <div className="flex min-w-0 flex-col gap-2 p-3">
                    {filteredPrompts.map((prompt, index) => {
                      const active = prompt.id === selectedId;

                      return (
                        <BlurFade
                          key={prompt.id}
                          delay={Math.min(index, 8) * 0.012}
                          direction="right"
                        >
                          <CommandItem
                            value={`${prompt.title} ${prompt.useCase} ${prompt.id}`}
                            onSelect={() => setSelectedId(prompt.id)}
                            className={cn(
                              "relative block w-full min-w-0 max-w-full cursor-pointer overflow-hidden rounded-md border p-3 data-[selected=true]:bg-white",
                              active
                                ? "border-primary bg-white shadow-md shadow-primary/10 ring-1 ring-primary/20"
                                : "border-transparent bg-white/75 hover:border-primary/35 hover:bg-white"
                            )}
                          >
                            {active ? (
                              <ShineBorder
                                duration={12}
                                shineColor={["#f06423", "#fbbf24"]}
                              />
                            ) : null}
                            <div className="relative flex min-w-0 items-start gap-3">
                              <span
                                className={cn(
                                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/9 text-primary",
                                  active && "bg-primary text-primary-foreground"
                                )}
                              >
                                <MessageSquareText className="h-4 w-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-start justify-between gap-2">
                                  <h2 className="line-clamp-2 min-w-0 break-words [overflow-wrap:anywhere] text-sm font-semibold leading-5 text-foreground">
                                    {prompt.title}
                                  </h2>
                                  <Star className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                </div>
                                <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "max-w-full truncate border-primary/20 bg-primary/10 text-[11px] text-primary",
                                      active && "border-primary/30 bg-primary/15"
                                    )}
                                  >
                                    {categoryLabel(prompt.category)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="max-w-full truncate border-border bg-muted text-[11px] text-muted-foreground"
                                  >
                                    {prompt.placeholders.length} variables
                                  </Badge>
                                </div>
                                <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
                                  <span className="shrink-0">Source XLSX</span>
                                  <span className="text-border">.</span>
                                  <span className="shrink-0">Row {prompt.rowNumber}</span>
                                  <span className="text-border">.</span>
                                  <span className="inline-flex min-w-0 items-center gap-1">
                                    <Braces className="h-3 w-3 text-primary" />
                                    {prompt.placeholders.length}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        </BlurFade>
                      );
                    })}
                  </div>
              </CommandGroup>
            ) : (
              <CommandEmpty>
                <div className="flex min-h-72 items-center justify-center p-6 text-center">
                  <div>
                    <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h2 className="mt-3 text-sm font-semibold">No matching prompts</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Adjust search text or choose another category.
                    </p>
                  </div>
                </div>
              </CommandEmpty>
            )}
        </CommandList>
      </Command>
    </aside>
  );
}

function PromptDetailPanel({
  activePrompt,
  clearActiveFields,
  fields,
  filledPlaceholderCount,
  setFields
}: {
  activePrompt: PromptHubItem;
  clearActiveFields: () => void;
  fields: Record<string, string>;
  filledPlaceholderCount: number;
  setFields: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  return (
    <section
      className="prompt-hub-panel flex h-[640px] min-h-0 min-w-0 w-full max-w-full flex-col overflow-hidden bg-white"
    >
      <ScrollArea className="h-full">
        <div className="min-w-0 p-5">
          <BlurFade>
            <div className="min-w-0">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Selected Prompt
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button type="button" variant="ghost" size="icon" aria-label="More actions">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Favorite prompt">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="min-w-0">
                  <h2 className="break-words [overflow-wrap:anywhere] text-2xl font-semibold leading-8 text-foreground">
                    {activePrompt.title}
                  </h2>
                </div>

                <div className="flex min-w-0 flex-wrap gap-2 text-xs">
                  <MetaChip label="Category" value={categoryLabel(activePrompt.category)} accent />
                  <MetaChip label="Use Case" value={activePrompt.useCase} />
                  <MetaChip label="Source" value="XLSX" />
                  <MetaChip label="Row" value={String(activePrompt.rowNumber)} />
                </div>
              </div>

              <Separator className="my-5" />

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Template Summary
                </p>
                <p className="mt-3 line-clamp-4 break-words [overflow-wrap:anywhere] text-sm leading-6 text-muted-foreground">
                  {activePrompt.template}
                </p>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.04} className="mt-6">
            <div className="border-t border-border pt-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Context Variables
                    <span className="rounded-sm border border-border bg-muted px-2 py-1 font-normal normal-case tracking-normal text-muted-foreground">
                      {activePrompt.placeholders.length} detected
                    </span>
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {filledPlaceholderCount} of {activePrompt.placeholders.length} fields completed
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!activePrompt.placeholders.length || filledPlaceholderCount === 0}
                  onClick={clearActiveFields}
                >
                  Clear
                </Button>
              </div>

              <div className="mt-4">
                {activePrompt.placeholders.length ? (
                  <div className="grid min-w-0 gap-4">
                    {activePrompt.placeholders.map((placeholder, index) => (
                      <div
                        key={placeholder}
                        className="grid min-w-0 gap-3 sm:grid-cols-[40px_minmax(0,1fr)]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-[#fbfbfc] text-primary">
                          <PlaceholderIcon index={index} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center justify-between gap-3">
                            <Label
                              htmlFor={`prompt-field-${placeholder}`}
                              className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-primary"
                            >
                              [{placeholder}]
                            </Label>
                            <span className="min-w-0 truncate text-[11px] text-muted-foreground">
                              {labelForPlaceholder(placeholder)}
                            </span>
                          </div>
                          <Textarea
                            id={`prompt-field-${placeholder}`}
                            value={fields[placeholder] ?? ""}
                            onChange={(event) =>
                              setFields((current) => ({
                                ...current,
                                [placeholder]: event.target.value
                              }))
                            }
                            placeholder={`Enter ${labelForPlaceholder(placeholder).toLowerCase()}`}
                            className="mt-2 min-h-12 resize-y rounded-md bg-white text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                    This prompt has no detected placeholders.
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Template Note
                </p>
                <div className="mt-3 flex items-start gap-3 rounded-md border border-border bg-[#fbfbfc] p-3">
                  <BookOpenText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="break-words text-xs leading-5 text-muted-foreground">
                    Source-grounded prompt from {activePrompt.source.workbook}, sheet{" "}
                    {activePrompt.source.sheet}, row {activePrompt.rowNumber}.
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </ScrollArea>
    </section>
  );
}

function MetaChip({
  label,
  value,
  accent = false
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <span className="inline-flex max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-md border border-border bg-[#fbfbfc] px-2.5 py-2">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          "min-w-0 max-w-full truncate rounded-sm bg-muted px-1.5 py-0.5 font-medium text-foreground [overflow-wrap:anywhere]",
          accent && "bg-primary/10 text-primary"
        )}
      >
        {value}
      </span>
    </span>
  );
}

function PlaceholderIcon({ index }: { index: number }) {
  const icons = [User, Briefcase, AlertTriangle, Target, ClipboardList];
  const Icon = icons[index % icons.length];

  return <Icon className="h-4 w-4" />;
}

function PromptPreviewPanel({
  activePrompt,
  compiledPrompt,
  copied,
  copyText
}: {
  activePrompt: PromptHubItem;
  compiledPrompt: string;
  copied: "base" | "compiled" | null;
  copyText: (kind: "base" | "compiled", value: string) => Promise<void>;
}) {
  const rows = Math.min(lineCount(compiledPrompt), 160);

  function useInChat() {
    window.localStorage.setItem("promptHubDraftForChat", compiledPrompt);
    window.location.href = "/chat?from=prompts";
  }

  return (
    <section
      className="prompt-hub-panel relative flex h-[680px] min-h-0 min-w-0 w-full max-w-full flex-col overflow-hidden bg-[#101115] text-white"
    >
      <AnimatedGridPattern
        className="text-white/15 [mask-image:linear-gradient(to_bottom,white,transparent_74%)]"
        duration={10}
        height={36}
        maxOpacity={0.05}
        numSquares={30}
        width={36}
      />
      <div className="relative flex min-w-0 shrink-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-4 w-4 text-primary" />
            Live Preview
          </h3>
        </div>
        <div className="flex shrink-0 rounded-md border border-white/10 bg-white/[0.04] p-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-white/60 hover:bg-white/10 hover:text-white"
          >
            Source
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 px-3"
          >
            Compiled
          </Button>
        </div>
      </div>

      <div className="relative min-h-0 min-w-0 flex-1 px-4 pb-4">
        <div className="h-full min-h-0 min-w-0 overflow-hidden rounded-lg border border-white/10 bg-[#0b0c0f] shadow-2xl shadow-black/25">
          <ScrollArea className="h-full">
            <div className="flex min-h-full min-w-0">
              <div className="hidden w-11 shrink-0 select-none border-r border-white/8 bg-white/[0.025] py-4 text-right font-mono text-xs leading-6 text-white/25 sm:block">
                {Array.from({ length: rows }, (_, index) => (
                  <div key={index} className="px-3">
                    {index + 1}
                  </div>
                ))}
              </div>
              <pre className="min-h-full min-w-0 flex-1 whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6 text-white/82">
                {compiledPrompt}
              </pre>
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="relative shrink-0 border-t border-white/10 p-4">
        <div className="prompt-hub-action-grid grid gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-10 min-w-0 whitespace-normal border-primary/70 bg-white/[0.03] px-3 text-center leading-5 text-white hover:bg-white/10 hover:text-white"
            onClick={() => copyText("base", activePrompt.template)}
          >
            {copied === "base" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copy Base Prompt
          </Button>
          <Button
            type="button"
            className="h-auto min-h-10 min-w-0 whitespace-normal px-3 text-center leading-5"
            onClick={() => copyText("compiled", compiledPrompt)}
          >
            {copied === "compiled" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
            Copy for Chat
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-10 min-w-0 whitespace-normal border-white/15 bg-white/[0.03] px-3 text-center leading-5 text-white hover:bg-white/10 hover:text-white"
            onClick={useInChat}
          >
            <ArrowRight className="h-4 w-4" />
            Use in Chat
          </Button>
        </div>
        <p className="mt-3 text-center text-xs leading-5 text-white/38">
          Fill variables, review the compiled prompt, then copy or send it to Chat.
        </p>
      </div>
    </section>
  );
}

function NoPromptSelected({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[420px] items-center justify-center p-8 text-center",
        dark ? "bg-[#101115] text-white" : "bg-white text-foreground"
      )}
    >
      <div>
        <Search className={cn("mx-auto h-10 w-10", dark ? "text-white/35" : "text-muted-foreground")} />
        <h2 className="mt-4 text-base font-semibold">No prompt selected</h2>
        <p className={cn("mt-2 text-sm", dark ? "text-white/45" : "text-muted-foreground")}>
          Select a prompt from the library to open its workspace.
        </p>
      </div>
    </div>
  );
}

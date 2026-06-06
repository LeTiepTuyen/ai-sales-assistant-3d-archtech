"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  FileImage,
  FileText,
  Loader2,
  Paperclip,
  SendHorizontal,
  UserRound,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AttachmentMeta = {
  id: string;
  name: string;
  size: number;
  type: string;
  kind: "image" | "file";
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intentLabel?: string;
  provider?: string;
  sources?: SourceCitation[];
  needsInput?: string[];
  attachments?: AttachmentMeta[];
};

type SourceCitation = {
  chunkId: string;
  documentName: string;
  documentType: string;
  serviceCategory: string;
  pageStart: number | null;
  sectionTitle: string | null;
  score: number;
  preview: string;
};

type ChatResponse = {
  intentLabel: string;
  provider: string;
  answer: string;
  sources: SourceCitation[];
  needsInput: string[];
  error?: string;
};

const initialMessages: Message[] = [
  {
    id: "assistant-intro",
    role: "assistant",
    content:
      "Ready to help with source-aware sales questions, technical explanations, service recommendations, and client-ready response drafts."
  }
];

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function selectFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const selected = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      kind: file.type.startsWith("image/") ? ("image" as const) : ("file" as const)
    }));

    setAttachments((current) => {
      const known = new Set(current.map((item) => item.id));
      return [...current, ...selected.filter((item) => !known.has(item.id))];
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }

  function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const outgoingAttachments = attachments;
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      attachments: outgoingAttachments
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setAttachments([]);
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          mode: "Ask Knowledge Base",
          attachments: outgoingAttachments.map(({ id, name, size, type, kind }) => ({
            id,
            name,
            size,
            type,
            kind
          }))
        })
      });
      const data = (await response.json()) as ChatResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Chat request failed.");
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        intentLabel: data.intentLabel,
        provider: data.provider,
        sources: data.sources,
        needsInput: data.needsInput
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Chat request failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex h-[calc(100vh-2rem)] max-h-[940px] min-h-[650px] max-w-5xl flex-col overflow-hidden rounded-lg border border-border/80 bg-card/95 shadow-2xl shadow-black/10 lg:h-[calc(100vh-3rem)]">
      <div className="relative flex-1 overflow-y-auto bg-gradient-to-b from-white via-white to-muted/35 px-4 py-5 sm:px-6">
        <AnimatedGridPattern
          className="text-primary/20 [mask-image:linear-gradient(to_bottom,white,transparent_44%)]"
          duration={9}
          maxOpacity={0.05}
          numSquares={26}
          width={42}
          height={42}
        />
        <div className="relative flex flex-col gap-5">
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            const Icon = isAssistant ? Bot : UserRound;

            return (
              <BlurFade
                key={message.id}
                delay={0.02}
                direction={isAssistant ? "right" : "left"}
                className={cn("relative flex gap-3", !isAssistant && "justify-end")}
              >
                {isAssistant ? (
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#17181d] text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                ) : null}
                <div
                  className={cn(
                    "max-w-[820px] rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm",
                    isAssistant
                      ? "border-border bg-card text-foreground"
                      : "border-primary bg-primary text-primary-foreground"
                  )}
                >
                {isAssistant && (message.intentLabel || message.provider) ? (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {message.intentLabel ? (
                      <Badge variant="outline" className="bg-card/90">
                        {message.intentLabel}
                      </Badge>
                    ) : null}
                    {message.provider ? (
                      <Badge variant={message.provider === "gemini" ? "success" : "warning"}>
                        {message.provider === "gemini" ? "Gemini" : "Local fallback"}
                      </Badge>
                    ) : null}
                  </div>
                ) : null}

                <div className="whitespace-pre-wrap">{message.content}</div>

                {message.attachments?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => {
                      const AttachmentIcon =
                        attachment.kind === "image" ? FileImage : FileText;
                      return (
                        <span
                          key={attachment.id}
                          className="inline-flex items-center gap-2 rounded-md bg-white/15 px-2.5 py-1 text-xs"
                        >
                          <AttachmentIcon className="h-3.5 w-3.5" />
                          {attachment.name}
                        </span>
                      );
                    })}
                  </div>
                ) : null}

                {message.needsInput?.length ? (
                  <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
                    <p className="font-medium">NEEDS_INPUT</p>
                    <ul className="mt-1 list-inside list-disc">
                      {message.needsInput.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {isAssistant && message.sources?.length ? (
                  <details className="group mt-3 rounded-md border border-border bg-muted/45 px-3 py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
                      <span>{message.sources.length} cited source chunks</span>
                      <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-3 space-y-3">
                      {message.sources.slice(0, 4).map((source) => (
                        <div key={source.chunkId} className="rounded-md bg-card p-3 text-xs">
                          <p className="font-semibold text-foreground">
                            {source.documentName}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {source.pageStart ? `Page ${source.pageStart}` : source.sectionTitle ?? "Chunk"} / {source.serviceCategory}
                          </p>
                          <p className="mt-2 line-clamp-3 leading-5 text-muted-foreground">
                            {source.preview}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                ) : null}
                </div>
              </BlurFade>
            );
          })}

          {loading ? (
            <BlurFade className="relative flex gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#17181d] text-primary">
                <Bot className="h-4 w-4" />
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Preparing source-aware response...
              </div>
            </BlurFade>
          ) : null}
        </div>
      </div>

      <form ref={formRef} onSubmit={submitMessage} className="border-t border-border bg-card p-3 sm:p-4">
        {error ? (
          <div className="mb-3 rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {attachments.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment) => {
              const AttachmentIcon = attachment.kind === "image" ? FileImage : FileText;
              return (
                <span
                  key={attachment.id}
                  className="inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs text-foreground"
                >
                  <AttachmentIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="max-w-[220px] truncate">{attachment.name}</span>
                  <span className="text-muted-foreground">{formatBytes(attachment.size)}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${attachment.name}`}
                    className="rounded-sm p-0.5 text-muted-foreground hover:bg-card hover:text-foreground"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        ) : null}

        <div className="relative flex items-center gap-2 overflow-hidden rounded-lg border border-input bg-background p-2 shadow-inner focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
          <BorderBeam
            borderWidth={1}
            colorFrom="#f06423"
            colorTo="#fbbf24"
            duration={8}
            size={72}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            onChange={(event) => selectFiles(event.target.files)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 self-center"
            aria-label="Attach files"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={submitOnEnter}
            placeholder="Ask about services, technical terms, sales messaging, or client context."
            className="max-h-40 min-h-10 flex-1 resize-none border-0 bg-transparent px-1 py-2 leading-6 shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 self-center"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </section>
  );
}

"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  Download,
  FileImage,
  FileText,
  Loader2,
  Paperclip,
  Printer,
  SendHorizontal,
  Square,
  UserRound,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { ChatMarkdown } from "@/components/chat-markdown";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AttachmentMeta = {
  id: string;
  name: string;
  size: number;
  type: string;
  kind: "image" | "file";
  text?: string;
  contentBase64?: string;
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
  canExport?: boolean;
  exportTitle?: string;
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
  canExport?: boolean;
  exportTitle?: string;
  error?: string;
};

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

async function readAttachment(file: File): Promise<AttachmentMeta> {
  const buffer = await file.arrayBuffer();
  const fileName = file.name.toLowerCase();
  const type = file.type || "application/octet-stream";
  const isTextFile =
    type.startsWith("text/") || fileName.endsWith(".txt") || fileName.endsWith(".csv");

  if (isTextFile) {
    return {
      id: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      size: file.size,
      type,
      kind: "file",
      text: new TextDecoder().decode(buffer)
    };
  }

  return {
    id: `${file.name}-${file.lastModified}-${file.size}`,
    name: file.name,
    size: file.size,
    type,
    kind: file.type.startsWith("image/") ? "image" : "file",
    contentBase64: toBase64(buffer)
  };
}

const initialMessages: Message[] = [
  {
    id: "assistant-intro",
    role: "assistant",
    content:
      "Ready to help with source-aware sales questions, technical explanations, service recommendations, and client-ready proposal drafts."
  }
];

const promptHubDraftStorageKey = "promptHubDraftForChat";

export function ChatDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  function resizePromptInput() {
    const element = promptInputRef.current;

    if (!element) {
      return;
    }

    const maxHeight = 220;
    element.style.height = "auto";
    const nextHeight = Math.min(element.scrollHeight, maxHeight);
    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
  }

  useEffect(() => {
    resizePromptInput();
  }, [input]);

  useEffect(() => {
    const promptHubDraft = window.localStorage.getItem(promptHubDraftStorageKey);

    if (promptHubDraft?.trim()) {
      window.localStorage.removeItem(promptHubDraftStorageKey);
      window.setTimeout(() => {
        setInput(promptHubDraft);
        setStatusMessage("Prompt Hub draft loaded. Review it, then send when ready.");
      }, 0);
    }
  }, []);

  async function selectFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const selected = await Promise.all(Array.from(files).map((file) => readAttachment(file)));

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

  function stopAnswering() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
    setStatusMessage("Response stopped.");
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
    setStatusMessage("");
    setLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        signal: abortController.signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          mode: outgoingAttachments.length > 0 ? "Proposal Support" : "Ask Knowledge Base",
          attachments: outgoingAttachments.map(({ id, name, size, type, kind, text, contentBase64 }) => ({
            id,
            name,
            size,
            type,
            kind,
            text,
            contentBase64
          }))
        })
      });

      if (abortController.signal.aborted) {
        return;
      }

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
        needsInput: data.needsInput,
        canExport: data.canExport,
        exportTitle: data.exportTitle
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (caught) {
      if (abortController.signal.aborted) {
        setStatusMessage("Response stopped.");
        return;
      }

      const message = caught instanceof Error ? caught.message : "Chat request failed.";
      setError(message);
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setLoading(false);
    }
  }

  async function exportChatDocx(message: Message) {
    const response = await fetch("/api/chat/export/docx", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: message.exportTitle ?? "Chat Proposal Response",
        content: message.content,
        provider: message.provider,
        intentLabel: message.intentLabel,
        sources: message.sources,
        confirmationItems: message.needsInput
      })
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
    link.download = `${message.id}.docx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  function openChatPrint(message: Message) {
    window.localStorage.setItem(
      "latestChatProposalResponse",
      JSON.stringify({
        title: message.exportTitle ?? "Chat Proposal Response",
        content: message.content,
        provider: message.provider,
        intentLabel: message.intentLabel,
        sources: message.sources ?? [],
        confirmationItems: message.needsInput ?? [],
        createdAt: new Date().toISOString()
      })
    );
    window.open("/chat/print?print=1", "_blank", "noopener,noreferrer");
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
                    "max-w-[860px] rounded-xl border px-4 py-4 text-sm leading-6 shadow-sm",
                    isAssistant
                      ? "border-border bg-card text-foreground"
                      : "border-primary bg-primary text-primary-foreground"
                  )}
                >
                  {isAssistant && (message.intentLabel || message.canExport) ? (
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {message.intentLabel ? (
                          <Badge variant="outline" className="bg-card/90">
                            {message.intentLabel}
                          </Badge>
                        ) : null}
                      </div>
                      {message.canExport ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => {
                              void exportChatDocx(message);
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                            DOCX
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => openChatPrint(message)}
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Print
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {isAssistant ? (
                    <ChatMarkdown content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}

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
                      <p className="font-medium">Sales Review Notes</p>
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
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Reviewing the source material and shaping a client-ready answer...
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
        {statusMessage && !error ? (
          <div className="mb-3 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            {statusMessage}
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

        <div className="relative flex items-end gap-2 overflow-hidden rounded-lg border border-input bg-background p-2 shadow-inner focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15">
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
            onChange={(event) => {
              void selectFiles(event.target.files);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 self-end"
            aria-label="Attach files"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            ref={promptInputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={submitOnEnter}
            placeholder="Ask about services, technical terms, sales messaging, or upload a client brief for a draft proposal."
            rows={1}
            className="min-h-10 max-h-[220px] flex-1 resize-none overflow-y-hidden border-0 bg-transparent px-1 py-2 leading-6 shadow-none focus-visible:ring-0"
          />
          {loading ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-10 w-10 shrink-0 self-end"
              aria-label="Stop Answering"
              title="Stop Answering"
              onClick={stopAnswering}
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 shrink-0 self-end"
              disabled={!input.trim()}
              aria-label="Send message"
              title="Send message"
            >
              <SendHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}

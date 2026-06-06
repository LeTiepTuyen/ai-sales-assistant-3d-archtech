"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMarkdown } from "@/components/chat-markdown";
import type { SourceCitation } from "@/lib/ai/source-citations";

type ChatPrintResponse = {
  title: string;
  content: string;
  provider?: string;
  intentLabel?: string;
  sources: SourceCitation[];
  confirmationItems: string[];
  createdAt: string;
};

export function ChatResponsePrintPage() {
  const [response, setResponse] = useState<ChatPrintResponse | null>(null);

  useEffect(() => {
    window.setTimeout(() => {
      const raw = window.localStorage.getItem("latestChatProposalResponse");
      if (raw) {
        setResponse(JSON.parse(raw) as ChatPrintResponse);
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get("print") === "1") {
        window.setTimeout(() => window.print(), 300);
      }
    }, 0);
  }, []);

  if (!response) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-semibold">No chat proposal response found</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Generate a proposal response in Chatbox first, then open print again.
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
        <h1 className="text-3xl font-semibold">{response.title}</h1>
        <div className="mt-4 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          {response.intentLabel ? <p>Intent: {response.intentLabel}</p> : null}
          {response.provider ? <p>Provider: {response.provider}</p> : null}
          <p>Created: {new Date(response.createdAt).toLocaleString()}</p>
        </div>
      </header>

      <div className="mt-8">
        <ChatMarkdown content={response.content} />
      </div>

      {response.confirmationItems.length > 0 ? (
        <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 print:bg-white">
          <h2 className="font-semibold">Sales Review Notes</h2>
          <ul className="mt-2 list-inside list-disc leading-6">
            {response.confirmationItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {response.sources.length > 0 ? (
        <section className="mt-8 border-t border-border pt-5">
          <h2 className="text-lg font-semibold">Source References</h2>
          <div className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
            {response.sources.slice(0, 8).map((source) => (
              <p key={source.chunkId}>
                {source.documentName}
                {source.pageStart ? `, page ${source.pageStart}` : ""} - {source.chunkId}
              </p>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

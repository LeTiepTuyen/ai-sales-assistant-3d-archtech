import { NextResponse } from "next/server";
import { answerChat, type ChatRequest } from "@/lib/ai/chat-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;

    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const result = await answerChat(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown chat error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

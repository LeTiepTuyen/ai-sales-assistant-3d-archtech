import { NextResponse } from "next/server";
import { generateProposal } from "@/lib/ai/proposal-service";
import type { ProposalInput } from "@/lib/ai/proposal-types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProposalInput;
    const result = await generateProposal(body);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown proposal generation error.";
    const status = message.startsWith("Missing required") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

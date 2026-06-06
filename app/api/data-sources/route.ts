import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const summaryPath = path.join(process.cwd(), "data", "chunks", "ingestion-summary.json");

export async function GET() {
  try {
    const raw = await fs.readFile(summaryPath, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load ingestion summary.";
    return NextResponse.json(
      {
        error: message,
        documentCount: 0,
        chunkCount: 0,
        documents: []
      },
      { status: 500 }
    );
  }
}

import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { NextResponse } from "next/server";
import type { SourceCitation } from "@/lib/ai/source-citations";

type ChatExportRequest = {
  title?: string;
  content: string;
  provider?: string;
  intentLabel?: string;
  sources?: SourceCitation[];
  confirmationItems?: string[];
};

function plainText(value: string) {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function paragraph(text = "") {
  return new Paragraph({
    children: [new TextRun(plainText(text))]
  });
}

function markdownParagraph(line: string) {
  const heading = line.match(/^(#{1,3})\s+(.*)$/);

  if (heading) {
    const level =
      heading[1].length === 1
        ? HeadingLevel.HEADING_1
        : heading[1].length === 2
          ? HeadingLevel.HEADING_2
          : HeadingLevel.HEADING_3;

    return new Paragraph({
      text: plainText(heading[2]),
      heading: level
    });
  }

  return paragraph(line);
}

function fileSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatExportRequest;

    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: "Chat response content is required." },
        { status: 400 }
      );
    }

    const title = body.title?.trim() || "Chat Proposal Response";
    const lines = body.content.replace(/\r\n/g, "\n").split("\n");
    const children = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE
      }),
      ...(body.intentLabel ? [paragraph(`Intent: ${body.intentLabel}`)] : []),
      ...(body.provider ? [paragraph(`Provider: ${body.provider}`)] : []),
      paragraph(`Exported at: ${new Date().toISOString()}`),
      paragraph(""),
      ...lines.map(markdownParagraph),
      ...(body.confirmationItems?.length
        ? [
            paragraph(""),
            new Paragraph({
              text: "Sales Review Notes",
              heading: HeadingLevel.HEADING_1
            }),
            ...body.confirmationItems.map((item) => paragraph(`- ${item}`))
          ]
        : []),
      ...(body.sources?.length
        ? [
            paragraph(""),
            new Paragraph({
              text: "Source References",
              heading: HeadingLevel.HEADING_1
            }),
            ...body.sources.slice(0, 8).map((source) =>
              paragraph(
                `- ${source.documentName}${source.pageStart ? `, page ${source.pageStart}` : ""} - ${source.chunkId}`
              )
            )
          ]
        : [])
    ];

    const document = new Document({
      sections: [
        {
          properties: {},
          children
        }
      ]
    });

    const buffer = await Packer.toBuffer(document);
    const fileName = `${fileSlug(title) || "chat-proposal-response"}.docx`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to export chat response DOCX.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

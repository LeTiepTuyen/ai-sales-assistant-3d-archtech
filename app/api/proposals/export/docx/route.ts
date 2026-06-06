import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { NextResponse } from "next/server";
import type { ProposalDraft } from "@/lib/ai/proposal-types";

function paragraph(text: string) {
  return new Paragraph({
    children: [new TextRun(text)]
  });
}

export async function POST(request: Request) {
  try {
    const proposal = (await request.json()) as ProposalDraft;

    if (!proposal?.clientInput?.clientName || !proposal.sections?.length) {
      return NextResponse.json(
        { error: "Valid proposal draft is required." },
        { status: 400 }
      );
    }

    const children = [
      new Paragraph({
        text: `Draft Proposal for ${proposal.clientInput.clientName}`,
        heading: HeadingLevel.TITLE
      }),
      paragraph(`Industry: ${proposal.clientInput.industry}`),
      paragraph(`Proposed services: ${proposal.clientInput.services}`),
      paragraph(`Generated provider: ${proposal.provider}`),
      paragraph(`Created at: ${proposal.createdAt}`),
      paragraph(""),
      new Paragraph({
        text: "NEEDS_INPUT",
        heading: HeadingLevel.HEADING_1
      }),
      ...proposal.needsInput.map((item) => paragraph(`- ${item}`)),
      paragraph(""),
      ...proposal.sections.flatMap((section) => [
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_1
        }),
        ...section.content.split("\n").map((line) => paragraph(line)),
        ...(section.sources.length
          ? [
              new Paragraph({
                text: "Sources",
                heading: HeadingLevel.HEADING_2
              }),
              ...section.sources.slice(0, 5).map((source) =>
                paragraph(
                  `- ${source.documentName}${source.pageStart ? `, page ${source.pageStart}` : ""} - ${source.chunkId}`
                )
              )
            ]
          : []),
        paragraph("")
      ])
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
    const fileName = `proposal-${proposal.clientInput.clientName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "draft"}.docx`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to export proposal DOCX.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import type { ReactNode } from "react";

type ChatMarkdownProps = {
  content: string;
};

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; language: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <strong key={`${match.index}-${match[1]}`} className="font-semibold text-foreground">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let codeLanguage = "";
  let inCodeFence = false;

  function flushParagraph() {
    if (paragraphLines.length > 0) {
      blocks.push({ type: "paragraph", text: paragraphLines.join(" ").trim() });
      paragraphLines = [];
    }
  }

  function flushList() {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  }

  function flushCode() {
    if (codeLines.length > 0 || inCodeFence) {
      blocks.push({ type: "code", language: codeLanguage, text: codeLines.join("\n") });
      codeLines = [];
      codeLanguage = "";
    }
  }

  function isTableSeparator(value: string) {
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(value);
  }

  function isTableRow(value: string) {
    return value.includes("|") && value.replace(/\|/g, "").trim().length > 0;
  }

  function parseTableRow(value: string) {
    return value
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const rawLine = lines[lineIndex];
    const line = rawLine.trim();

    const fenceMatch = line.match(/^```([A-Za-z0-9_-]*)\s*$/);
    if (fenceMatch) {
      if (inCodeFence) {
        inCodeFence = false;
        flushCode();
      } else {
        flushParagraph();
        flushList();
        inCodeFence = true;
        codeLanguage = fenceMatch[1] ?? "";
        codeLines = [];
      }
      continue;
    }

    if (inCodeFence) {
      codeLines.push(rawLine);
      continue;
    }

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim()
      });
      continue;
    }

    const nextLine = lines[lineIndex + 1]?.trim() ?? "";
    if (isTableRow(rawLine) && isTableSeparator(nextLine)) {
      flushParagraph();
      flushList();

      const headers = parseTableRow(rawLine);
      lineIndex += 2;
      const rows: string[][] = [];

      while (lineIndex < lines.length) {
        const candidate = lines[lineIndex];
        const candidateLine = candidate.trim();

        if (!candidateLine || !isTableRow(candidate)) {
          lineIndex -= 1;
          break;
        }

        rows.push(parseTableRow(candidate));
        lineIndex += 1;
      }

      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const listMatch = line.match(/^(?:[-*]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1].trim());
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushCode();

  return blocks;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const headingClass =
            block.level === 1
              ? "text-xl font-semibold tracking-tight text-foreground"
              : block.level === 2
                ? "text-lg font-semibold tracking-tight text-foreground"
                : "text-base font-semibold tracking-tight text-foreground";

          return (
            <div key={`${block.type}-${index}`} className={headingClass}>
              {renderInlineMarkdown(block.text)}
            </div>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`${block.type}-${index}`} className="space-y-2 pl-5 text-sm leading-7 text-foreground">
              {block.items.map((item, itemIndex) => (
                <li key={`${index}-${itemIndex}`} className="list-disc marker:text-primary">
                  <span>{renderInlineMarkdown(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "code") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="max-w-full overflow-x-auto rounded-md border border-border bg-muted/60"
            >
              <pre className="min-w-max p-3 font-mono text-xs leading-6 text-foreground">
                <code>{block.text}</code>
              </pre>
            </div>
          );
        }

        if (block.type === "table") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="max-w-full overflow-x-auto rounded-md border border-border"
            >
              <table className="w-full min-w-[640px] border-collapse bg-card text-left text-sm">
                <thead className="bg-muted/80">
                  <tr>
                    {block.headers.map((header, headerIndex) => (
                      <th
                        key={`${index}-header-${headerIndex}`}
                        className="border-b border-r border-border px-3 py-2 align-top font-semibold text-foreground last:border-r-0"
                      >
                        {renderInlineMarkdown(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={`${index}-row-${rowIndex}`} className="odd:bg-white even:bg-muted/25">
                      {block.headers.map((_, cellIndex) => (
                        <td
                          key={`${index}-row-${rowIndex}-${cellIndex}`}
                          className="border-b border-r border-border px-3 py-2 align-top text-foreground last:border-r-0"
                        >
                          {renderInlineMarkdown(row[cellIndex] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="text-sm leading-7 text-foreground">
            {renderInlineMarkdown(block.text)}
          </p>
        );
      })}
    </div>
  );
}

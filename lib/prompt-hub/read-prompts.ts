import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

export type PromptHubItem = {
  id: string;
  rowNumber: number;
  category: string;
  useCase: string;
  title: string;
  template: string;
  placeholders: string[];
  source: {
    workbook: string;
    sheet: string;
  };
};

const workbookRelativePath =
  "data/source-pdfs/[3D Archtech] Prompts for AI sales assistant.xlsx";

const categoryRules: Array<{ category: string; terms: string[] }> = [
  {
    category: "Execution",
    terms: ["proposal", "action items", "requirements analysis", "briefs"]
  },
  {
    category: "Client Communication",
    terms: ["explain", "translate", "follow-up", "email", "message"]
  },
  {
    category: "Customer Insight",
    terms: ["persona", "customer needs", "objections", "barriers", "concerns"]
  },
  {
    category: "Strategy",
    terms: [
      "presentation",
      "pitch",
      "competitor",
      "innovation",
      "predict",
      "recommend",
      "positioning"
    ]
  }
];

function slugify(value: string, index: number) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);

  return `${index + 1}-${slug || "prompt"}`;
}

function titleFromUseCase(useCase: string) {
  return useCase.replace(/\s+/g, " ").trim();
}

function deriveCategory(useCase: string) {
  const normalized = useCase.toLowerCase();
  const match = categoryRules.find((rule) =>
    rule.terms.some((term) => normalized.includes(term))
  );

  return match?.category ?? "Sales Workflow";
}

export function extractPlaceholders(template: string) {
  const matches = template.match(/\[[^\][\n]+\]/g) ?? [];
  return Array.from(
    new Set(matches.map((match) => match.replace(/^\[|\]$/g, "").trim()))
  ).sort((a, b) => a.localeCompare(b));
}

function normalizeTemplate(template: string) {
  return template
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/Requirementss:/g, "Requirements:")
    .replace(/\nRequirement:\n/g, "\nRequirements:\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function readPromptLibrary(): PromptHubItem[] {
  const workbookPath = path.join(process.cwd(), workbookRelativePath);

  if (!fs.existsSync(workbookPath)) {
    return [];
  }

  const workbook = XLSX.read(fs.readFileSync(workbookPath), {
    type: "buffer"
  });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: ""
  });

  return rows
    .map((row, rowIndex) => {
      const useCase = String(row[1] ?? "").trim();
      const template = normalizeTemplate(String(row[2] ?? ""));

      if (rowIndex < 3 || !useCase || !template) {
        return null;
      }

      return {
        id: slugify(useCase, rowIndex - 3),
        rowNumber: rowIndex + 1,
        category: deriveCategory(useCase),
        useCase,
        title: titleFromUseCase(useCase),
        template,
        placeholders: extractPlaceholders(template),
        source: {
          workbook: workbookRelativePath,
          sheet: sheetName
        }
      };
    })
    .filter((item): item is PromptHubItem => Boolean(item));
}

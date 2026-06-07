import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const workbookRelativePath =
  "data/source-pdfs/[3D Archtech] Prompts for AI sales assistant.xlsx";
const outputRelativePath = "lib/prompt-hub/generated-prompts.json";

const categoryRules = [
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

function slugify(value, index) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);

  return `${index + 1}-${slug || "prompt"}`;
}

function deriveCategory(useCase) {
  const normalized = useCase.toLowerCase();
  const match = categoryRules.find((rule) =>
    rule.terms.some((term) => normalized.includes(term))
  );

  return match?.category ?? "Sales Workflow";
}

function extractPlaceholders(template) {
  const matches = template.match(/\[[^\][\n]+\]/g) ?? [];
  return Array.from(
    new Set(matches.map((match) => match.replace(/^\[|\]$/g, "").trim()))
  ).sort((a, b) => a.localeCompare(b));
}

function normalizeTemplate(template) {
  return String(template ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/Requirementss:/g, "Requirements:")
    .replace(/\nRequirement:\n/g, "\nRequirements:\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  const workbookPath = path.join(rootDir, workbookRelativePath);
  const outputPath = path.join(rootDir, outputRelativePath);
  const workbook = XLSX.read(await readFile(workbookPath), {
    type: "buffer"
  });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: ""
  });
  const prompts = rows
    .map((row, rowIndex) => {
      const useCase = String(row[1] ?? "").trim();
      const template = normalizeTemplate(row[2]);

      if (rowIndex < 3 || !useCase || !template) {
        return null;
      }

      return {
        id: slugify(useCase, rowIndex - 3),
        rowNumber: rowIndex + 1,
        category: deriveCategory(useCase),
        useCase,
        title: useCase.replace(/\s+/g, " ").trim(),
        template,
        placeholders: extractPlaceholders(template),
        source: {
          workbook: workbookRelativePath,
          sheet: sheetName
        }
      };
    })
    .filter(Boolean);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(prompts, null, 2)}\n`, "utf8");
  process.stdout.write(`Generated ${prompts.length} Prompt Hub prompts at ${outputRelativePath}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

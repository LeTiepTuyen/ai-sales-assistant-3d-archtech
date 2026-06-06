import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "data", "source-pdfs");
const extractedDir = path.join(rootDir, "data", "extracted");
const chunksDir = path.join(rootDir, "data", "chunks");

const CHUNK_SIZE = 3600;
const CHUNK_OVERLAP = 600;
const MIN_REVIEW_CHARS = 500;
const MIN_CHARS_PER_MB = 250;

const inventory = [
  {
    file: "[3D Archtech] Prompts for AI sales assistant.xlsx",
    documentType: "prompt_library",
    serviceCategory: "sales_prompts"
  },
  {
    file: "[3D Archtech] Prompts for AI sales assistant - Prompt cho sales (Eng).pdf",
    documentType: "prompt_library",
    serviceCategory: "sales_prompts"
  },
  {
    file: "Company profile 3D Archtech.pdf",
    documentType: "company_profile",
    serviceCategory: "company_general"
  },
  {
    file: "FarmDiaries_Proposal_3DArchtech.pdf",
    documentType: "proposal",
    serviceCategory: "proposal_template"
  },
  {
    file: "Knowlympic_Proposal.pdf",
    documentType: "proposal",
    serviceCategory: "proposal_template"
  },
  {
    file: "WA_GRAB_Proposal.pdf",
    documentType: "proposal",
    serviceCategory: "proposal_template"
  },
  {
    file: "Portfolio Digital Twin.pdf",
    documentType: "portfolio",
    serviceCategory: "digital_twin"
  },
  {
    file: "Portfolio AR.pdf",
    documentType: "portfolio",
    serviceCategory: "ar_vr"
  },
  {
    file: "Portfolio Visualization.pdf",
    documentType: "portfolio",
    serviceCategory: "visualization"
  },
  {
    file: "Portfolio IOT, ROBOTICs.pdf",
    documentType: "portfolio",
    serviceCategory: "iot_robotics"
  },
  {
    file: "Games Show Case.pdf",
    documentType: "portfolio",
    serviceCategory: "games"
  },
  {
    file: "PORTFOLIO.pdf",
    documentType: "portfolio",
    serviceCategory: "general_portfolio"
  }
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inferMeta(fileName) {
  const known = inventory.find(
    (entry) => entry.file.toLowerCase() === fileName.toLowerCase()
  );

  if (known) {
    return known;
  }

  const lower = fileName.toLowerCase();
  if (lower.includes("proposal")) {
    return {
      file: fileName,
      documentType: "proposal",
      serviceCategory: "proposal_template"
    };
  }
  if (lower.includes("portfolio")) {
    return {
      file: fileName,
      documentType: "portfolio",
      serviceCategory: "unknown_portfolio"
    };
  }
  if (lower.includes("prompt")) {
    return {
      file: fileName,
      documentType: "prompt_library",
      serviceCategory: "sales_prompts"
    };
  }

  return {
    file: fileName,
    documentType: "unknown",
    serviceCategory: "unknown"
  };
}

async function resetOutputDirs() {
  await mkdir(extractedDir, { recursive: true });
  await mkdir(chunksDir, { recursive: true });

  for (const directory of [extractedDir, chunksDir]) {
    const entries = await readdir(directory);
    for (const entry of entries) {
      if (entry === ".gitkeep") {
        continue;
      }
      await rm(path.join(directory, entry), { recursive: true, force: true });
    }
  }
}

function chunkText(text) {
  const clean = normalizeText(text);
  if (!clean) {
    return [];
  }

  if (clean.length <= CHUNK_SIZE) {
    return [clean];
  }

  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + CHUNK_SIZE, clean.length);
    const nextParagraph = clean.lastIndexOf("\n\n", end);
    const nextSentence = clean.lastIndexOf(". ", end);
    const boundary = Math.max(nextParagraph, nextSentence);

    if (boundary > start + CHUNK_SIZE * 0.55) {
      end = boundary + (boundary === nextSentence ? 1 : 0);
    }

    chunks.push(clean.slice(start, end).trim());

    if (end >= clean.length) {
      break;
    }

    start = Math.max(0, end - CHUNK_OVERLAP);
  }

  return chunks.filter(Boolean);
}

function buildChunkRecords(document, extraction) {
  const chunks = [];
  const sections =
    extraction.pages.length > 0
      ? extraction.pages.map((page) => ({
          pageStart: page.pageNumber,
          pageEnd: page.pageNumber,
          sectionTitle: null,
          text: page.text
        }))
      : extraction.sheets.map((sheet) => ({
          pageStart: null,
          pageEnd: null,
          sectionTitle: sheet.sheetName,
          text: sheet.text
        }));

  let chunkNumber = 1;

  for (const section of sections) {
    for (const chunk of chunkText(section.text)) {
      const chunkId = `${document.documentId}-${String(chunkNumber).padStart(4, "0")}`;
      chunks.push({
        chunkId,
        documentId: document.documentId,
        documentName: document.fileName,
        sourcePath: document.sourcePath,
        fileType: document.fileType,
        documentType: document.documentType,
        serviceCategory: document.serviceCategory,
        pageStart: section.pageStart,
        pageEnd: section.pageEnd,
        sectionTitle: section.sectionTitle,
        text: chunk,
        tokenEstimate: Math.ceil(chunk.length / 4),
        extractionStatus: extraction.status,
        createdAt: document.ingestedAt
      });
      chunkNumber += 1;
    }
  }

  return chunks;
}

async function extractPdf(filePath) {
  const data = await readFile(filePath);
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    const pages = (result.pages ?? []).map((page, index) => ({
      pageNumber: index + 1,
      text: normalizeText(page.text)
    }));
    const text = normalizeText(pages.map((page) => page.text).join("\n\n"));

    return {
      extractor: "pdf-parse",
      totalPages: result.total ?? pages.length,
      text,
      pages,
      sheets: []
    };
  } finally {
    await parser.destroy();
  }
}

async function extractXlsx(filePath) {
  const workbook = XLSX.readFile(filePath, {
    cellDates: false,
    cellNF: false,
    cellText: true
  });
  const sheets = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      blankrows: false,
      defval: ""
    });
    const text = rows
      .map((row) => row.map((cell) => String(cell).trim()).filter(Boolean).join(" | "))
      .filter(Boolean)
      .join("\n");

    return {
      sheetName,
      rowCount: rows.length,
      text: normalizeText(text)
    };
  });

  return {
    extractor: "xlsx",
    totalPages: null,
    text: normalizeText(
      sheets.map((sheet) => `# ${sheet.sheetName}\n${sheet.text}`).join("\n\n")
    ),
    pages: [],
    sheets
  };
}

async function extractDocument(fileName) {
  const filePath = path.join(sourceDir, fileName);
  const fileStats = await stat(filePath);
  const extension = path.extname(fileName).toLowerCase();
  const inferred = inferMeta(fileName);
  const documentId = slugify(fileName);
  const ingestedAt = new Date().toISOString();

  const document = {
    documentId,
    fileName,
    sourcePath: path.relative(rootDir, filePath).replace(/\\/g, "/"),
    fileType: extension.replace(".", ""),
    documentType: inferred.documentType,
    serviceCategory: inferred.serviceCategory,
    fileSizeBytes: fileStats.size,
    modifiedAt: fileStats.mtime.toISOString(),
    ingestedAt,
    status: "pending",
    extractedCharacters: 0,
    chunkCount: 0,
    warningCount: 0,
    warnings: [],
    error: null
  };

  try {
    let extractionResult;
    if (extension === ".pdf") {
      extractionResult = await extractPdf(filePath);
    } else if (extension === ".xlsx") {
      extractionResult = await extractXlsx(filePath);
    } else {
      throw new Error(`Unsupported file type: ${extension}`);
    }

    const warnings = [];
    if (!extractionResult.text) {
      warnings.push("No extractable text found. This file may need OCR or manual review.");
    }
    if (extractionResult.text.length > 0 && extractionResult.text.length < MIN_REVIEW_CHARS) {
      warnings.push("Low extracted text length. Review source quality before relying on this document.");
    }
    const fileSizeMb = document.fileSizeBytes / 1024 / 1024;
    if (
      extension === ".pdf" &&
      fileSizeMb >= 2 &&
      extractionResult.text.length / fileSizeMb < MIN_CHARS_PER_MB
    ) {
      warnings.push(
        "Low text density for PDF size. The document may be image-heavy and should be reviewed before citation use."
      );
    }

    const extraction = {
      documentId,
      fileName,
      sourcePath: document.sourcePath,
      fileType: document.fileType,
      documentType: document.documentType,
      serviceCategory: document.serviceCategory,
      extractor: extractionResult.extractor,
      status: warnings.length > 0 ? "needs_review" : "extracted",
      extractedCharacters: extractionResult.text.length,
      totalPages: extractionResult.totalPages,
      text: extractionResult.text,
      pages: extractionResult.pages,
      sheets: extractionResult.sheets,
      warnings,
      extractedAt: ingestedAt
    };

    const chunks = buildChunkRecords(document, extraction);
    document.status = extraction.status;
    document.extractedCharacters = extraction.extractedCharacters;
    document.chunkCount = chunks.length;
    document.warningCount = warnings.length;
    document.warnings = warnings;

    await writeFile(
      path.join(extractedDir, `${documentId}.json`),
      JSON.stringify(extraction, null, 2),
      "utf8"
    );
    await writeFile(path.join(extractedDir, `${documentId}.txt`), extraction.text, "utf8");
    await writeFile(
      path.join(chunksDir, `${documentId}.json`),
      JSON.stringify(chunks, null, 2),
      "utf8"
    );

    return {
      document,
      chunks
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    document.status = "failed";
    document.error = message;
    document.warningCount = 1;
    document.warnings = [`Extraction failed: ${message}`];

    const extraction = {
      documentId,
      fileName,
      sourcePath: document.sourcePath,
      fileType: document.fileType,
      documentType: document.documentType,
      serviceCategory: document.serviceCategory,
      extractor: extension === ".xlsx" ? "xlsx" : "pdf-parse",
      status: "failed",
      extractedCharacters: 0,
      totalPages: null,
      pages: [],
      sheets: [],
      warnings: document.warnings,
      error: message,
      extractedAt: ingestedAt
    };

    await writeFile(
      path.join(extractedDir, `${documentId}.json`),
      JSON.stringify(extraction, null, 2),
      "utf8"
    );
    await writeFile(path.join(extractedDir, `${documentId}.txt`), "", "utf8");
    await writeFile(path.join(chunksDir, `${documentId}.json`), "[]\n", "utf8");

    return {
      document,
      chunks: []
    };
  }
}

function buildRetrievalIndex(chunks) {
  return {
    generatedAt: new Date().toISOString(),
    retrievalMode: "local_lexical_fallback",
    scoring: "token overlap with frequency weighting",
    chunkCount: chunks.length,
    chunks: chunks.map((chunk) => ({
      chunkId: chunk.chunkId,
      documentId: chunk.documentId,
      documentName: chunk.documentName,
      documentType: chunk.documentType,
      serviceCategory: chunk.serviceCategory,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
      sectionTitle: chunk.sectionTitle,
      tokenEstimate: chunk.tokenEstimate,
      text: chunk.text
    }))
  };
}

async function main() {
  await resetOutputDirs();

  const fileNames = (await readdir(sourceDir))
    .filter((fileName) => [".pdf", ".xlsx"].includes(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const documents = [];
  const allChunks = [];

  for (const fileName of fileNames) {
    process.stdout.write(`Extracting ${fileName}... `);
    const result = await extractDocument(fileName);
    documents.push(result.document);
    allChunks.push(...result.chunks);
    process.stdout.write(
      `${result.document.status}, ${result.document.extractedCharacters} chars, ${result.document.chunkCount} chunks\n`
    );
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    sourceDir: path.relative(rootDir, sourceDir).replace(/\\/g, "/"),
    extractedDir: path.relative(rootDir, extractedDir).replace(/\\/g, "/"),
    chunksDir: path.relative(rootDir, chunksDir).replace(/\\/g, "/"),
    documentCount: documents.length,
    extractedCount: documents.filter((document) => document.status === "extracted").length,
    needsReviewCount: documents.filter((document) => document.status === "needs_review").length,
    failedCount: documents.filter((document) => document.status === "failed").length,
    chunkCount: allChunks.length,
    documents
  };

  await writeFile(
    path.join(extractedDir, "documents.json"),
    JSON.stringify(documents, null, 2),
    "utf8"
  );
  await writeFile(
    path.join(extractedDir, "extraction-summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );
  await writeFile(path.join(chunksDir, "chunks.json"), JSON.stringify(allChunks, null, 2), "utf8");
  await writeFile(
    path.join(chunksDir, "retrieval-index.json"),
    JSON.stringify(buildRetrievalIndex(allChunks), null, 2),
    "utf8"
  );
  await writeFile(
    path.join(chunksDir, "ingestion-summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );

  process.stdout.write(
    `Done. ${summary.documentCount} documents, ${summary.chunkCount} chunks, ${summary.failedCount} failures.\n`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

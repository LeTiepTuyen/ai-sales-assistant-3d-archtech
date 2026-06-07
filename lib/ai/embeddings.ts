const DEFAULT_GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_EMBEDDING_DIMENSIONS = 768;
const PLACEHOLDER_API_KEYS = new Set(["", "NEEDS_INPUT", "YOUR_API_KEY", "YOUR_API_KEY_HERE"]);

type GeminiEmbeddingResponse = {
  embedding?: {
    values?: number[];
  };
  error?: {
    message?: string;
  };
};

function getGeminiApiKey() {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    "";

  return PLACEHOLDER_API_KEYS.has(apiKey.trim()) ? null : apiKey;
}

export function getGeminiEmbeddingModel() {
  return process.env.GEMINI_EMBEDDING_MODEL?.trim() || DEFAULT_GEMINI_EMBEDDING_MODEL;
}

export function getEmbeddingDimensions() {
  const configured = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS);

  if (!Number.isFinite(configured)) {
    return DEFAULT_EMBEDDING_DIMENSIONS;
  }

  return Math.max(1, Math.floor(configured));
}

export function isEmbeddingConfigured() {
  return Boolean(getGeminiApiKey());
}

export async function embedWithGemini(text: string) {
  const apiKey = getGeminiApiKey();
  const cleanText = text.trim();

  if (!apiKey || !cleanText) {
    return null;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${getGeminiEmbeddingModel()}:embedContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        content: {
          parts: [{ text: cleanText }]
        },
        outputDimensionality: getEmbeddingDimensions()
      })
    }
  );

  const data = (await response.json()) as GeminiEmbeddingResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Gemini embedding request failed with ${response.status}`);
  }

  const values = data.embedding?.values;

  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Gemini embedding response did not include embedding values.");
  }

  return values;
}

type GeminiGenerateOptions = {
  systemInstruction: string;
  userPrompt: string;
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const PLACEHOLDER_API_KEYS = new Set(["", "NEEDS_INPUT", "YOUR_API_KEY", "YOUR_API_KEY_HERE"]);

function getGeminiApiKey() {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    "";

  return PLACEHOLDER_API_KEYS.has(apiKey.trim()) ? null : apiKey;
}

export function isGeminiConfigured() {
  return Boolean(getGeminiApiKey());
}

export function getGeminiModel() {
  const model = process.env.GEMINI_MODEL?.trim();
  return model || DEFAULT_GEMINI_MODEL;
}

export async function generateWithGemini({
  systemInstruction,
  userPrompt
}: GeminiGenerateOptions) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return null;
  }

  const model = getGeminiModel();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1400
        }
      })
    }
  );

  const data = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Gemini request failed with ${response.status}`);
  }

  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? null
  );
}

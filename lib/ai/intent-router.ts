export type AssistantIntent =
  | "knowledge_qa"
  | "technical_explainer"
  | "service_recommendation"
  | "proposal_support"
  | "sales_response";

export type IntentRoute = {
  intent: AssistantIntent;
  label: string;
  preferredDocumentTypes: string[];
  preferredServiceCategory?: string;
};

const serviceKeywords: Array<[string, string]> = [
  ["digital twin", "digital_twin"],
  ["twin", "digital_twin"],
  ["ar", "ar_vr"],
  ["vr", "ar_vr"],
  ["visualization", "visualization"],
  ["visualisation", "visualization"],
  ["iot", "iot_robotics"],
  ["robotic", "iot_robotics"],
  ["game", "games"]
];

function detectServiceCategory(input: string) {
  const lower = input.toLowerCase();
  return serviceKeywords.find(([keyword]) => lower.includes(keyword))?.[1];
}

export function routeIntent(input: string, selectedMode?: string): IntentRoute {
  const text = `${selectedMode ?? ""} ${input}`.toLowerCase();
  const preferredServiceCategory = detectServiceCategory(text);

  if (
    text.includes("proposal") ||
    text.includes("draft") ||
    text.includes("cover page") ||
    text.includes("challenge vs") ||
    text.includes("scope")
  ) {
    return {
      intent: "proposal_support",
      label: "Proposal Support",
      preferredDocumentTypes: ["proposal", "company_profile", "portfolio", "prompt_library"],
      preferredServiceCategory
    };
  }

  if (
    text.includes("explain") ||
    text.includes("term") ||
    text.includes("business-friendly") ||
    text.includes("business language") ||
    text.includes("technical")
  ) {
    return {
      intent: "technical_explainer",
      label: "Technical Explainer",
      preferredDocumentTypes: ["portfolio", "company_profile", "prompt_library"],
      preferredServiceCategory
    };
  }

  if (
    text.includes("recommend") ||
    text.includes("suitable service") ||
    text.includes("which service") ||
    text.includes("fit")
  ) {
    return {
      intent: "service_recommendation",
      label: "Service Recommendation",
      preferredDocumentTypes: ["portfolio", "company_profile", "prompt_library"],
      preferredServiceCategory
    };
  }

  if (
    text.includes("email") ||
    text.includes("follow up") ||
    text.includes("sales response") ||
    text.includes("message")
  ) {
    return {
      intent: "sales_response",
      label: "Sales Response",
      preferredDocumentTypes: ["prompt_library", "company_profile", "portfolio"],
      preferredServiceCategory
    };
  }

  return {
    intent: "knowledge_qa",
    label: "Knowledge Q&A",
    preferredDocumentTypes: ["company_profile", "portfolio", "proposal", "prompt_library"],
    preferredServiceCategory
  };
}

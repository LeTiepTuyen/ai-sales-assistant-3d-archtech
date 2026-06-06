import { PromptHubPage } from "@/components/prompt-hub-page";
import { readPromptLibrary } from "@/lib/prompt-hub/read-prompts";

export default function PromptsPage() {
  const prompts = readPromptLibrary();

  return <PromptHubPage prompts={prompts} />;
}

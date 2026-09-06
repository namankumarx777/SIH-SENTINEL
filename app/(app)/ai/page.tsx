import { listCasesForSession } from "@/lib/repos/cases";
import { AiChatClient } from "./_components/ai-chat-client";

export const instant = false;

export default async function AiAssistantPage() {
  const cases = await listCasesForSession();
  return <AiChatClient initialCases={cases} />;
}

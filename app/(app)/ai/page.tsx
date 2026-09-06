import { cases } from "@/lib/data";
import { AiChatClient } from "./_components/ai-chat-client";

export const instant = false;

export default function AiAssistantPage() {
  return <AiChatClient initialCases={cases} />;
}

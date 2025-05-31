import { createResource } from "@/shared/lib/resource";
import { SmartCard } from "@/shared/types/smart-card";
import { cardService } from "@/features/card/services/card";
import { chatStore } from "@/features/chat/stores/chat-store";

export const cardResource = createResource<SmartCard[]>(async () => {
  const conversationId = chatStore.getState().currentConversationId;
  const data = await cardService.queryCards({ conversationId: conversationId ?? undefined });
  return data;
});

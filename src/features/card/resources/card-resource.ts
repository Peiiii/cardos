import { createResource } from "@/shared/lib/resource";
import { Card } from "../types/card";
import { cardService } from "@/features/card/services/card-service";
import { chatStore } from "@/features/chat/stores/chat-store";

export const cardResource = createResource<Card[]>(async () => {
  const data = chatStore.getState().currentConversationId
    ? await cardService.list(chatStore.getState().currentConversationId!)
    : [];
  return data;
});

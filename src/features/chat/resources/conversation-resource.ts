import { createResource } from "@/shared/lib/resource";
import { conversationService } from "../services/conversation-service";
import { Conversation } from "../types/conversation";

export const conversationResource = createResource<Conversation[]>(
  () => conversationService.list(),
  {
    minLoadingTime: 500,
    retryTimes: 3,
  }
);

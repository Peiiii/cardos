import { messageService } from "@/features/chat/services/message-service";
import { createResource } from "@/shared/lib/resource";
import { chatStore } from "@/store/chat-store";
import { Message } from "../types/message";

export const messageResource = createResource<Message[]>(
  async () =>
    chatStore.getState().currentConversationId
      ? await messageService.list(chatStore.getState().currentConversationId!)
      : [],
  {
    onCreated: (resource) => {
      chatStore.subscribe(
        (state, prevState) => {
          if (state.currentConversationId !== prevState.currentConversationId) {
            resource.reload();
          }
        },
      );
    },
  }
);


window.messageResource = messageResource;
window.messageService = messageService;
window.chatStore = chatStore;


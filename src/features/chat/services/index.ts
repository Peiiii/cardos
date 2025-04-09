import { ChatService } from './chat-service';
import { messageService } from './message-service';
import { aiService } from '../features/ai/services/ai-service';

// 创建ChatService单例
let chatServiceInstance: ChatService | null = null;

export const getChatService = () => {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService(messageService, aiService);
  }
  return chatServiceInstance;
};

export type { ChatService };
export { messageService, aiService }; 
import {
  Message,
  MessageDataProvider,
  CreateMessageInput,
} from "../types/message";
import { MockHttpProvider } from "@/shared/lib/storage/mock-http";

export class MessageService {
  constructor(private provider: MessageDataProvider) {}

  async list(conversationId?: string): Promise<Message[]> {
    const messages = await this.provider.list();
    return conversationId
      ? messages
          .filter((message) => message.conversationId === conversationId)
          .sort((a, b) => a.timestamp - b.timestamp)
      : messages.sort((a, b) => a.timestamp - b.timestamp);
  }

  async get(id: string): Promise<Message> {
    return this.provider.get(id);
  }

  async create(data: CreateMessageInput): Promise<Message> {
    return  await this.provider.create(data);
  }

  async createMany(
    contents: string[],
    conversationId: string
  ): Promise<Message[]> {
    const messages: CreateMessageInput[] = contents.map((content) => ({
      content,
      isUser: true,
      timestamp: Date.now(),
      conversationId,
    }));
    return this.provider.createMany(messages);
  }

  async update(id: string, data: Partial<Message>): Promise<Message> {
    return this.provider.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.provider.delete(id);
  }
}

// 创建实例
export const messageService = new MessageService(
  new MockHttpProvider<Message>("messages", {
    delay: 200,
  })
);

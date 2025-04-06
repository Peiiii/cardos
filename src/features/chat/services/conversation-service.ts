import { MockHttpProvider } from "@/shared/lib/storage";
import {
  Conversation,
  ConversationDataProvider,
  CreateConversationInput,
} from "../types/conversation";

export class ConversationService {
  constructor(private provider: ConversationDataProvider) {}

  async list(): Promise<Conversation[]> {
    return this.provider.list();
  }

  async get(id: string): Promise<Conversation> {
    return this.provider.get(id);
  }

  async create(data: CreateConversationInput): Promise<Conversation> {
    return this.provider.create(data);
  }

  async createMany(titles: string[]): Promise<Conversation[]> {
    const conversations: CreateConversationInput[] = titles.map(title => ({
      title,
      timestamp: Date.now(),
    }));
    const results = await Promise.all(
      conversations.map(conv => this.provider.create(conv))
    );
    return results;
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation> {
    return this.provider.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.provider.delete(id);
  }
}

export const conversationService = new ConversationService(
  new MockHttpProvider<Conversation>("conversations", {
    delay: 200,
  })
);

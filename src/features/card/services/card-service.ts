import { Card, CardDataProvider, CreateCardInput } from '../types/card';
import { MockHttpProvider } from '@/shared/lib/storage/mock-http';

export class CardService {
  constructor(private provider: CardDataProvider) {}

  async list(conversationId: string): Promise<Card[]> {
    return this.provider.list(conversationId);
  }

  async get(id: string): Promise<Card> {
    return this.provider.get(id);
  }

  async create(data: CreateCardInput, conversationId: string): Promise<Card> {
    const card: CreateCardInput = {
      ...data,
      conversationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.provider.create(card);
  }

  async createMany(items: CreateCardInput[], conversationId: string): Promise<Card[]> {
    const cards = items.map(item => ({
      ...item,
      conversationId,
      timestamp: Date.now()
    }));
    return this.provider.createMany(cards);
  }

  async update(id: string, data: Partial<Card>): Promise<Card> {
    return this.provider.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.provider.delete(id);
  }
}

// 创建实例
export const cardService = new CardService(
  new MockHttpProvider<Card>('cards', {
    delay: 200,
  })
);
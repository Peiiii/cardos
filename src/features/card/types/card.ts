export interface Card {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  conversationId: string;
}

export type CreateCardInput = Omit<Card, 'id'>;

export interface CardDataProvider {
  list(conversationId: string): Promise<Card[]>;
  get(id: string): Promise<Card>;
  create(data: CreateCardInput): Promise<Card>;
  createMany(data: CreateCardInput[]): Promise<Card[]>;
  update(id: string, data: Partial<Card>): Promise<Card>;
  delete(id: string): Promise<void>;
} 
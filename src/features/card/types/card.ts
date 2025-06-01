export interface CardMetadata {
  tags?: string[];
  isFavorite?: boolean;
  author?: string;
  generatedAt?: number;
  [key: string]: unknown;
}

export interface Card {
  id: string;
  title: string;
  htmlContent: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  tags?: string[];
  category?: string;
  status?: 'draft' | 'published' | 'archived';
  metadata?: CardMetadata;
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
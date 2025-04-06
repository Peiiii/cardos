export interface Conversation {
  id: string;
  title: string;
  timestamp: number;
  lastMessage?: string;
}

export type CreateConversationInput = Omit<Conversation, 'id'>;

export interface ConversationDataProvider {
  list(): Promise<Conversation[]>;
  get(id: string): Promise<Conversation>;
  create(data: CreateConversationInput): Promise<Conversation>;
  update(id: string, data: Partial<Conversation>): Promise<Conversation>;
  delete(id: string): Promise<void>;
} 
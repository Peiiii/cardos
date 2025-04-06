export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  conversationId: string;
}

export type CreateMessageInput = Omit<Message, 'id'>;

export interface MessageDataProvider {
  list(): Promise<Message[]>;
  get(id: string): Promise<Message>;
  create(data: CreateMessageInput): Promise<Message>;
  createMany(data: CreateMessageInput[]): Promise<Message[]>;
  update(id: string, data: Partial<Message>): Promise<Message>;
  delete(id: string): Promise<void>;
} 
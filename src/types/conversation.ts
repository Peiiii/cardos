/**
 * 消息角色类型
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 消息类型
 */
export interface Message {
  /**
   * 消息ID
   */
  id: string;
  
  /**
   * 消息角色：用户、助手或系统
   */
  role: MessageRole;
  
  /**
   * 消息内容
   */
  content: string;
  
  /**
   * 消息创建时间戳
   */
  timestamp: number;
}

/**
 * 对话会话类型
 */
export interface Conversation {
  /**
   * 会话ID
   */
  id: string;
  
  /**
   * 会话标题
   */
  title: string;
  
  /**
   * 消息列表
   */
  messages: Message[];
  
  /**
   * 创建时间
   */
  createdAt: number;
  
  /**
   * 更新时间
   */
  updatedAt: number;
  
  /**
   * 会话状态
   */
  status: ConversationStatus;
  
  /**
   * 会话元数据
   */
  metadata: ConversationMetadata;
}

/**
 * 会话状态
 */
export enum ConversationStatus {
  /**
   * 活跃状态，可继续对话
   */
  ACTIVE = 'active',
  
  /**
   * 已完成状态，不再继续对话
   */
  COMPLETED = 'completed',
  
  /**
   * 归档状态
   */
  ARCHIVED = 'archived'
}

/**
 * 会话元数据
 */
export interface ConversationMetadata {
  /**
   * 标签列表
   */
  tags?: string[];
  
  /**
   * 相关卡片ID列表
   */
  relatedCardIds?: string[];
  
  /**
   * 系统提示/指令
   */
  systemPrompt?: string;
  
  /**
   * 自定义属性
   */
  [key: string]: unknown;
}

/**
 * 会话创建参数
 */
export type ConversationCreateParams = Pick<Conversation, 'title'> & {
  initialMessage?: string;
  systemPrompt?: string;
  metadata?: Partial<ConversationMetadata>;
};

/**
 * 会话更新参数
 */
export type ConversationUpdateParams = Partial<Pick<Conversation, 'title' | 'status'>> & {
  metadata?: Partial<ConversationMetadata>;
};

/**
 * 消息创建参数
 */
export type MessageCreateParams = Pick<Message, 'role' | 'content'>; 
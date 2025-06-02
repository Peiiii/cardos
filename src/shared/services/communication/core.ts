/**
 * 通用多方通信核心接口
 * 适用于任何多方通信场景：卡片、微前端、多窗口、WebWorker等
 */

/**
 * 通信消息元数据
 */
export interface MessageMetadata {
  version: string;
  timestamp: number;
  messageId: string;
  correlationId?: string;
}

/**
 * 通信节点到协调器的消息
 */
export interface NodeToCoordinatorMessage<T = unknown> {
  type: 'nodeEvent';
  metadata: MessageMetadata;
  sourceNodeId: string;
  eventType: string;
  payload: T;
}

/**
 * 协调器到通信节点的消息
 */
export interface CoordinatorToNodeMessage<T = unknown> {
  type: 'coordinatorCommand';
  metadata: MessageMetadata;
  commandType: string;
  payload: T;
  originNodeId?: string;
}

/**
 * 消息处理器类型
 */
export type MessageHandler<T = unknown> = (message: T) => void | Promise<void>;

/**
 * 通信节点接口 - 任何能够发送消息的实体
 */
export interface CommunicationNode {
  id: string;
  send(message: CoordinatorToNodeMessage): boolean;
}

/**
 * 通信管理器接口 - 负责消息传输的底层实现
 */
export interface ICommunicationManager {
  /**
   * 启动消息监听
   */
  startListening(onMessage: (message: NodeToCoordinatorMessage) => void): () => void;
  
  /**
   * 注册通信节点
   */
  registerNode(node: CommunicationNode): void;
  
  /**
   * 注销通信节点
   */
  unregisterNode(nodeId: string): void;
  
  /**
   * 发送消息给特定节点
   */
  sendToNode(nodeId: string, message: CoordinatorToNodeMessage): boolean;
  
  /**
   * 广播消息给所有节点
   */
  broadcast(message: CoordinatorToNodeMessage): number;
  
  /**
   * 获取已注册的节点数量
   */
  getNodeCount(): number;
  
  /**
   * 获取所有已注册的节点ID
   */
  getNodeIds(): string[];
}

/**
 * 消息总线 - 负责事件分发和业务逻辑处理
 */
export class MessageBus {
  private handlers: Map<string, Set<MessageHandler<NodeToCoordinatorMessage>>> = new Map();

  /**
   * 注册消息处理器
   */
  registerHandler(eventType: string, handler: MessageHandler<NodeToCoordinatorMessage>) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * 注销消息处理器
   */
  unregisterHandler(eventType: string, handler: MessageHandler<NodeToCoordinatorMessage>) {
    this.handlers.get(eventType)?.delete(handler);
  }

  /**
   * 分发消息到对应的处理器
   */
  async dispatch(eventType: string, message: NodeToCoordinatorMessage) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      await Promise.all(
        Array.from(handlers).map(handler => handler(message))
      );
    }
  }
}

/**
 * 消息构建器 - 创建标准格式的消息
 */
export class MessageBuilder {
  /**
   * 创建节点事件消息
   */
  static createNodeEvent<T>(
    sourceNodeId: string,
    eventType: string,
    payload: T
  ): NodeToCoordinatorMessage<T> {
    return {
      type: 'nodeEvent',
      metadata: {
        version: '1.0',
        timestamp: Date.now(),
        messageId: crypto.randomUUID(),
      },
      sourceNodeId,
      eventType,
      payload,
    };
  }

  /**
   * 创建协调器命令消息
   */
  static createCoordinatorCommand<T>(
    commandType: string,
    payload: T,
    originNodeId?: string
  ): CoordinatorToNodeMessage<T> {
    return {
      type: 'coordinatorCommand',
      metadata: {
        version: '1.0',
        timestamp: Date.now(),
        messageId: crypto.randomUUID(),
      },
      commandType,
      payload,
      originNodeId,
    };
  }
}

/**
 * 类型守卫：检查是否为节点到协调器的消息
 */
export function isNodeToCoordinatorMessage(obj: unknown): obj is NodeToCoordinatorMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj && (obj as { type: string }).type === 'nodeEvent' &&
    'metadata' in obj &&
    'sourceNodeId' in obj && typeof (obj as { sourceNodeId: string }).sourceNodeId === 'string' &&
    'eventType' in obj && typeof (obj as { eventType: string }).eventType === 'string' &&
    'payload' in obj
  );
}

/**
 * 类型守卫：检查是否为协调器到节点的消息
 */
export function isCoordinatorToNodeMessage(obj: unknown): obj is CoordinatorToNodeMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj && (obj as { type: string }).type === 'coordinatorCommand' &&
    'metadata' in obj &&
    'commandType' in obj && typeof (obj as { commandType: string }).commandType === 'string' &&
    'payload' in obj
  );
} 
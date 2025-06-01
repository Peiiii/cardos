/**
 * 卡片事件类型枚举
 */
export enum CardEventType {
  DATA_UPDATE = 'dataUpdate',
  STATE_CHANGE = 'stateChange',
  USER_ACTION = 'userAction',
  ERROR = 'error',
}

/**
 * 父页面命令类型枚举
 */
export enum ParentCommandType {
  UPDATE_DISPLAY = 'updateDisplay',
  TRIGGER_ACTION = 'triggerAction',
  RELAY_EVENT = 'relayEvent',
  HIGHLIGHT = 'highlight',
  ALERT = 'alert',
}

/**
 * 消息元数据
 */
export interface MessageMetadata {
  version: string;
  timestamp: number;
  messageId: string;
  correlationId?: string;
}

/**
 * 从卡片发送到父页面的消息
 */
export interface CardToParentMessage<T = unknown> {
  type: 'cardEvent';
  metadata: MessageMetadata;
  sourceCardId: string;
  eventType: CardEventType;
  payload: T;
}

/**
 * 从父页面发送到卡片的消息
 */
export interface ParentToCardMessage<T = unknown> {
  type: 'parentCommand';
  metadata: MessageMetadata;
  commandType: ParentCommandType;
  payload: T;
  originCardId?: string;
}

/**
 * 消息处理器类型
 */
export type MessageHandler<T = unknown> = (message: T) => void | Promise<void>;

/**
 * 消息总线类
 * 用于管理和分发消息
 */
export class MessageBus {
  private handlers: Map<string, Set<MessageHandler<CardToParentMessage>>> = new Map();

  /**
   * 注册消息处理器
   * @param eventType 事件类型
   * @param handler 处理器函数
   */
  registerHandler(eventType: string, handler: MessageHandler<CardToParentMessage>) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * 注销消息处理器
   * @param eventType 事件类型
   * @param handler 处理器函数
   */
  unregisterHandler(eventType: string, handler: MessageHandler<CardToParentMessage>) {
    this.handlers.get(eventType)?.delete(handler);
  }

  /**
   * 分发消息到对应的处理器
   * @param eventType 事件类型
   * @param message 消息内容
   */
  async dispatch(eventType: string, message: CardToParentMessage) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      await Promise.all(
        Array.from(handlers).map(handler => handler(message))
      );
    }
  }
}

/**
 * 消息构建器
 * 用于创建标准格式的消息
 */
export class MessageBuilder {
  /**
   * 创建卡片事件消息
   */
  static createCardEvent<T>(
    sourceCardId: string,
    eventType: CardEventType,
    payload: T
  ): CardToParentMessage<T> {
    return {
      type: 'cardEvent',
      metadata: {
        version: '1.0',
        timestamp: Date.now(),
        messageId: crypto.randomUUID(),
      },
      sourceCardId,
      eventType,
      payload,
    };
  }

  /**
   * 创建父页面命令消息
   */
  static createParentCommand<T>(
    commandType: ParentCommandType,
    payload: T,
    originCardId?: string
  ): ParentToCardMessage<T> {
    return {
      type: 'parentCommand',
      metadata: {
        version: '1.0',
        timestamp: Date.now(),
        messageId: crypto.randomUUID(),
      },
      commandType,
      payload,
      originCardId,
    };
  }
}

/**
 * 类型守卫：检查是否为卡片到父页面的消息
 */
export function isCardToParentMessage(obj: unknown): obj is CardToParentMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj && (obj as { type: string }).type === 'cardEvent' &&
    'metadata' in obj &&
    'sourceCardId' in obj && typeof (obj as { sourceCardId: string }).sourceCardId === 'string' &&
    'eventType' in obj && typeof (obj as { eventType: string }).eventType === 'string' &&
    'payload' in obj
  );
}

/**
 * 类型守卫：检查是否为父页面到卡片的消息
 */
export function isParentToCardMessage(obj: unknown): obj is ParentToCardMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj && (obj as { type: string }).type === 'parentCommand' &&
    'metadata' in obj &&
    'commandType' in obj && typeof (obj as { commandType: string }).commandType === 'string' &&
    'payload' in obj
  );
} 
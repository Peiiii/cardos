import { CardToParentMessage, ParentToCardMessage, isCardToParentMessage } from "../types/communication";

/**
 * 卡片通信事件类型
 */
export enum CommunicationEventType {
  MESSAGE_RECEIVED = 'messageReceived',
  SEND_FAILED = 'sendFailed',
}

/**
 * 卡片实例接口 - 简化的卡片抽象
 */
export interface CardInstance {
  id: string;
  send(message: ParentToCardMessage): boolean;
}

/**
 * iframe卡片实例实现
 */
export class IFrameCardInstance implements CardInstance {
  constructor(
    public readonly id: string,
    private readonly iframeRef: React.RefObject<HTMLIFrameElement | null>
  ) {}

  send(message: ParentToCardMessage): boolean {
    const iframe = this.iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(message, "*");
      return true;
    }
    return false;
  }
}

/**
 * 通信管理器接口 - 只负责消息的发送和接收
 */
export interface ICommunicationManager {
  /**
   * 启动消息监听
   */
  startListening(onMessage: (message: CardToParentMessage) => void): () => void;
  
  /**
   * 注册卡片实例
   */
  registerCard(card: CardInstance): void;
  
  /**
   * 注销卡片实例
   */
  unregisterCard(cardId: string): void;
  
  /**
   * 发送消息给特定卡片
   */
  sendToCard(cardId: string, message: ParentToCardMessage): boolean;
  
  /**
   * 广播消息给所有卡片
   */
  broadcast(message: ParentToCardMessage): number; // 返回成功发送的数量
  
  /**
   * 获取已注册的卡片数量
   */
  getCardCount(): number;
  
  /**
   * 获取所有已注册的卡片ID
   */
  getCardIds(): string[];
}

/**
 * PostMessage通信管理器实现
 */
export class PostMessageCommunicationManager implements ICommunicationManager {
  private cards = new Map<string, CardInstance>();
  private messageHandler: ((message: CardToParentMessage) => void) | null = null;
  private isListening = false;

  startListening(onMessage: (message: CardToParentMessage) => void): () => void {
    if (this.isListening) {
      throw new Error('Communication manager is already listening');
    }

    this.messageHandler = onMessage;
    this.isListening = true;

    const handleMessage = (event: MessageEvent) => {
      const messageData = event.data;
      if (isCardToParentMessage(messageData) && this.messageHandler) {
        this.messageHandler(messageData);
      }
    };

    window.addEventListener("message", handleMessage);
    
    return () => {
      window.removeEventListener("message", handleMessage);
      this.messageHandler = null;
      this.isListening = false;
    };
  }

  registerCard(card: CardInstance): void {
    this.cards.set(card.id, card);
  }

  unregisterCard(cardId: string): void {
    this.cards.delete(cardId);
  }

  sendToCard(cardId: string, message: ParentToCardMessage): boolean {
    const card = this.cards.get(cardId);
    if (card) {
      const success = card.send(message);
      if (!success) {
        console.warn(`Failed to send message to card ${cardId}: iframe not ready`);
      }
      return success;
    } else {
      console.warn(`Card with ID ${cardId} not found`);
      return false;
    }
  }

  broadcast(message: ParentToCardMessage): number {
    let successCount = 0;
    this.cards.forEach((card) => {
      if (card.send(message)) {
        successCount++;
      }
    });
    return successCount;
  }

  /**
   * 获取已注册的卡片数量
   */
  getCardCount(): number {
    return this.cards.size;
  }

  /**
   * 获取所有已注册的卡片ID
   */
  getCardIds(): string[] {
    return Array.from(this.cards.keys());
  }
} 
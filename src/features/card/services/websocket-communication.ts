import { CardToParentMessage, ParentToCardMessage } from "../types/communication";
import { ICommunicationManager, CardInstance } from "./iframe-communication";

/**
 * WebSocket卡片实例 - 通过WebSocket连接通信的卡片
 */
export class WebSocketCardInstance implements CardInstance {
  constructor(
    public readonly id: string,
    private readonly ws: WebSocket
  ) {}

  send(message: ParentToCardMessage): boolean {
    if (this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          type: 'toCard',
          cardId: this.id,
          message
        }));
        return true;
      } catch (error) {
        console.error(`Failed to send message to card ${this.id}:`, error);
        return false;
      }
    }
    return false;
  }
}

/**
 * WebSocket通信管理器实现
 * 用于演示新抽象的可扩展性
 */
export class WebSocketCommunicationManager implements ICommunicationManager {
  private cards = new Map<string, CardInstance>();
  private messageHandler: ((message: CardToParentMessage) => void) | null = null;
  private ws: WebSocket | null = null;
  private isListening = false;

  constructor(private wsUrl: string) {}

  startListening(onMessage: (message: CardToParentMessage) => void): () => void {
    if (this.isListening) {
      throw new Error('WebSocket communication manager is already listening');
    }

    this.messageHandler = onMessage;
    this.isListening = true;

    // 创建WebSocket连接
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'fromCard' && this.messageHandler) {
          this.messageHandler(data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      this.messageHandler = null;
      this.isListening = false;
    };
  }

  registerCard(card: CardInstance): void {
    this.cards.set(card.id, card);
    
    // 通知服务端有新卡片注册
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'registerCard',
        cardId: card.id
      }));
    }
  }

  unregisterCard(cardId: string): void {
    this.cards.delete(cardId);
    
    // 通知服务端卡片注销
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unregisterCard',
        cardId: cardId
      }));
    }
  }

  sendToCard(cardId: string, message: ParentToCardMessage): boolean {
    const card = this.cards.get(cardId);
    if (card) {
      return card.send(message);
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

  getCardCount(): number {
    return this.cards.size;
  }

  getCardIds(): string[] {
    return Array.from(this.cards.keys());
  }

  /**
   * 获取WebSocket连接状态
   */
  getConnectionState(): string {
    if (!this.ws) return 'CLOSED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

/**
 * Mock通信管理器 - 用于测试
 */
export class MockCommunicationManager implements ICommunicationManager {
  private cards = new Map<string, CardInstance>();
  private messageHandler: ((message: CardToParentMessage) => void) | null = null;
  private isListening = false;
  
  // 测试用的消息队列
  private messageQueue: CardToParentMessage[] = [];

  startListening(onMessage: (message: CardToParentMessage) => void): () => void {
    if (this.isListening) {
      throw new Error('Mock communication manager is already listening');
    }

    this.messageHandler = onMessage;
    this.isListening = true;

    // 模拟处理消息队列
    const interval = setInterval(() => {
      if (this.messageQueue.length > 0 && this.messageHandler) {
        const message = this.messageQueue.shift()!;
        this.messageHandler(message);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      this.messageHandler = null;
      this.isListening = false;
    };
  }

  registerCard(card: CardInstance): void {
    this.cards.set(card.id, card);
    console.log(`Mock: Registered card ${card.id}`);
  }

  unregisterCard(cardId: string): void {
    this.cards.delete(cardId);
    console.log(`Mock: Unregistered card ${cardId}`);
  }

  sendToCard(cardId: string, message: ParentToCardMessage): boolean {
    const card = this.cards.get(cardId);
    if (card) {
      console.log(`Mock: Sending message to card ${cardId}`, message);
      return card.send(message);
    }
    return false;
  }

  broadcast(message: ParentToCardMessage): number {
    console.log(`Mock: Broadcasting message to ${this.cards.size} cards`, message);
    let successCount = 0;
    this.cards.forEach((card) => {
      if (card.send(message)) {
        successCount++;
      }
    });
    return successCount;
  }

  getCardCount(): number {
    return this.cards.size;
  }

  getCardIds(): string[] {
    return Array.from(this.cards.keys());
  }

  /**
   * 测试用方法：模拟接收来自卡片的消息
   */
  simulateMessageFromCard(message: CardToParentMessage): void {
    this.messageQueue.push(message);
  }
} 
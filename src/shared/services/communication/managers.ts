import { 
  ICommunicationManager, 
  CommunicationNode, 
  NodeToCoordinatorMessage, 
  CoordinatorToNodeMessage,
  isNodeToCoordinatorMessage 
} from './core';

/**
 * PostMessage通信管理器 - 使用浏览器原生postMessage API
 */
export class PostMessageCommunicationManager implements ICommunicationManager {
  private nodes = new Map<string, CommunicationNode>();
  private messageHandler: ((message: NodeToCoordinatorMessage) => void) | null = null;
  private isListening = false;

  startListening(onMessage: (message: NodeToCoordinatorMessage) => void): () => void {
    if (this.isListening) {
      throw new Error('Communication manager is already listening');
    }

    this.messageHandler = onMessage;
    this.isListening = true;

    const handleMessage = (event: MessageEvent) => {
      const messageData = event.data;
      if (isNodeToCoordinatorMessage(messageData) && this.messageHandler) {
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

  registerNode(node: CommunicationNode): void {
    this.nodes.set(node.id, node);
  }

  unregisterNode(nodeId: string): void {
    this.nodes.delete(nodeId);
  }

  sendToNode(nodeId: string, message: CoordinatorToNodeMessage): boolean {
    const node = this.nodes.get(nodeId);
    if (node) {
      const success = node.send(message);
      if (!success) {
        console.warn(`Failed to send message to node ${nodeId}: node not ready`);
      }
      return success;
    } else {
      console.warn(`Node with ID ${nodeId} not found`);
      return false;
    }
  }

  broadcast(message: CoordinatorToNodeMessage): number {
    let successCount = 0;
    this.nodes.forEach((node) => {
      if (node.send(message)) {
        successCount++;
      }
    });
    return successCount;
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  getNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }
}

/**
 * WebSocket通信管理器 - 使用WebSocket进行通信
 */
export class WebSocketCommunicationManager implements ICommunicationManager {
  private nodes = new Map<string, CommunicationNode>();
  private messageHandler: ((message: NodeToCoordinatorMessage) => void) | null = null;
  private ws: WebSocket | null = null;
  private isListening = false;

  constructor(private wsUrl: string) {}

  startListening(onMessage: (message: NodeToCoordinatorMessage) => void): () => void {
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
        if (data.type === 'fromNode' && this.messageHandler) {
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

  registerNode(node: CommunicationNode): void {
    this.nodes.set(node.id, node);
    
    // 通知服务端有新节点注册
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'registerNode',
        nodeId: node.id
      }));
    }
  }

  unregisterNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    
    // 通知服务端节点注销
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unregisterNode',
        nodeId: nodeId
      }));
    }
  }

  sendToNode(nodeId: string, message: CoordinatorToNodeMessage): boolean {
    const node = this.nodes.get(nodeId);
    if (node) {
      return node.send(message);
    } else {
      console.warn(`Node with ID ${nodeId} not found`);
      return false;
    }
  }

  broadcast(message: CoordinatorToNodeMessage): number {
    let successCount = 0;
    this.nodes.forEach((node) => {
      if (node.send(message)) {
        successCount++;
      }
    });
    return successCount;
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  getNodeIds(): string[] {
    return Array.from(this.nodes.keys());
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
  private nodes = new Map<string, CommunicationNode>();
  private messageHandler: ((message: NodeToCoordinatorMessage) => void) | null = null;
  private isListening = false;
  
  // 测试用的消息队列
  private messageQueue: NodeToCoordinatorMessage[] = [];

  startListening(onMessage: (message: NodeToCoordinatorMessage) => void): () => void {
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

  registerNode(node: CommunicationNode): void {
    this.nodes.set(node.id, node);
    console.log(`Mock: Registered node ${node.id}`);
  }

  unregisterNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    console.log(`Mock: Unregistered node ${nodeId}`);
  }

  sendToNode(nodeId: string, message: CoordinatorToNodeMessage): boolean {
    const node = this.nodes.get(nodeId);
    if (node) {
      console.log(`Mock: Sending message to node ${nodeId}`, message);
      return node.send(message);
    }
    return false;
  }

  broadcast(message: CoordinatorToNodeMessage): number {
    console.log(`Mock: Broadcasting message to ${this.nodes.size} nodes`, message);
    let successCount = 0;
    this.nodes.forEach((node) => {
      if (node.send(message)) {
        successCount++;
      }
    });
    return successCount;
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  getNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * 测试用方法：模拟接收来自节点的消息
   */
  simulateMessageFromNode(message: NodeToCoordinatorMessage): void {
    this.messageQueue.push(message);
  }
} 
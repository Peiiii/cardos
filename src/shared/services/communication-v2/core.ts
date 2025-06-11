

export interface MessageHandler<T=unknown> {
  (message: T): void;
}

export interface MessageMetadata {
  version: string;
  timestamp: number;
  messageId: string;
  correlationId?: string;
}

export interface IMessage<T=unknown> {
  type: string;
  metadata: MessageMetadata;
  payload: T;
}

export interface ICommunicationNode {
  id: string;
  send: (message: IMessage) => void;
  registerMessageHandler: (handler: MessageHandler) => () => void;
}

export interface ICommunicationManager {
  //=====for registering node=====
  registerNode(node: ICommunicationNode): void;
  unregisterNode(nodeId: string): void;
  getNodeCount(): number;
  getNodeIds(): string[];

  //=====for receiving message from node=====
  startListening(): () => void;
  registerMessageHandler(eventType: string, handler: MessageHandler): () => void;

  //=====for sending message to node=====
  sendToNode(nodeId: string, message: IMessage): void;
  broadcast(message: IMessage): number;
}

export class DisposableManager {
  private disposables: (() => void)[] = [];

  add(disposable: () => void): void {
    this.disposables.push(disposable);
  }

  dispose(): void {
    this.disposables.forEach(disposable => disposable());
  }
}

export class CommunicationManager implements ICommunicationManager {
  private nodes: Map<string, ICommunicationNode> = new Map();
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private eventListeningManager = new DisposableManager();

  //=====for registering node=====
  registerNode(node: ICommunicationNode): void {
    this.nodes.set(node.id, node);
  }

  unregisterNode(nodeId: string): void {
    this.nodes.delete(nodeId);
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  getNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  //=====for receiving message from node=====
  startListening(): () => void {
    // 为所有已注册的节点设置消息处理器
    this.nodes.forEach(node => {
        const handleMessage = (message: unknown) => {
            this.messageHandlers.forEach(handlers => {
              handlers.forEach(handler => handler(message));
        });
      };
      const unregisterHandlerFn = node.registerMessageHandler(handleMessage);
      this.eventListeningManager.add(unregisterHandlerFn);
    });

    // 返回清理函数
    return () => {
      this.eventListeningManager.dispose();
    };
  }

  registerMessageHandler(eventType: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }
    this.messageHandlers.get(eventType)?.add(handler);

    return () => {
      this.messageHandlers.get(eventType)?.delete(handler);
    };
  }
  //=====for sending message to node=====
  sendToNode(nodeId: string, message: IMessage): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return;
    }
    return node.send(message);
  }

  broadcast(message: IMessage): number {
    let successCount = 0;
    this.nodes.forEach(node => {
      node.send(message);
      successCount++;
    });
    return successCount;
  }
}


export class IframeCommunicationNode implements ICommunicationNode {
  constructor(public id: string, private iframe: HTMLIFrameElement) {}

  registerMessageHandler<T>(handler: MessageHandler<T>): () => void {
    const handleMessage = (event: MessageEvent<T>) => {
      handler(event.data as T);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }

  send(message: IMessage): boolean {
    return this.iframe.contentWindow?.postMessage(message, '*') ?? false;
  }
}

export class WorkerCommunicationNode implements ICommunicationNode {
  constructor(public id: string, private worker: Worker) {}

  registerMessageHandler<T>(handler: MessageHandler<T>): () => void {
    const handleMessage = (event: MessageEvent<T>) => {
      handler(event.data as T);
    };
    this.worker.addEventListener('message', handleMessage);
    return () => this.worker.removeEventListener('message', handleMessage);
  }

  send(message: IMessage): void {
    this.worker.postMessage(message);
  }
}

export class WebSocketCommunicationNode implements ICommunicationNode {
  constructor(public id: string, private socket: WebSocket) {}

  registerMessageHandler<T>(handler: MessageHandler<T>): () => void {
    const handleMessage = (event: MessageEvent<T>) => {
      handler(event.data as T);
    };
    this.socket.addEventListener('message', handleMessage);
    return () => this.socket.removeEventListener('message', handleMessage);
  }

  send(message: IMessage): void {
    this.socket.send(JSON.stringify(message));
  }
}

import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { CardToParentMessage, ParentToCardMessage, MessageBus, ParentCommandType } from '../types/communication';
import { ICommunicationManager } from './iframe-communication';

/**
 * 卡片数据接口 - 组件只需要提供这些基本信息
 */
export interface CardData {
  id: string;
  title: string;
  htmlContent: string;
  // 从SmartCard继承的其他字段
  conversationId?: string;
  createdAt?: number;
  updatedAt?: number;
  metadata?: unknown;
}

/**
 * 通信配置接口
 */
export interface CommunicationConfig {
  manager: ICommunicationManager;
  autoRegister?: boolean; // 是否自动注册卡片
  messageBus?: MessageBus; // 可选的自定义消息总线
}

/**
 * 卡片通信上下文值
 */
export interface CardCommunicationContextValue {
  /**
   * 发送消息给特定卡片
   */
  sendToCard: (cardId: string, message: ParentToCardMessage) => boolean;
  
  /**
   * 广播消息给所有卡片
   */
  broadcast: (message: ParentToCardMessage) => number;
  
  /**
   * 注册卡片列表（自动处理iframe ref）
   */
  registerCards: (cards: CardData[]) => void;
  
  /**
   * 监听来自卡片的消息
   */
  onMessage: (eventType: string, handler: (message: CardToParentMessage) => void) => () => void;
  
  /**
   * 获取当前活跃卡片数量
   */
  getActiveCardCount: () => number;
  
  /**
   * 获取iframe ref（用于渲染）
   */
  getIframeRef: (cardId: string) => React.RefObject<HTMLIFrameElement | null> | undefined;
}

const CardCommunicationContext = createContext<CardCommunicationContextValue | null>(null);

/**
 * 卡片通信Provider - 完全封装所有通信逻辑
 */
export interface CardCommunicationProviderProps {
  children: React.ReactNode;
  config: CommunicationConfig;
}

export function CardCommunicationProvider({ children, config }: CardCommunicationProviderProps) {
  const { manager, autoRegister = true, messageBus: customMessageBus } = config;
  
  // 内部状态管理
  const messageBus = useMemo(() => customMessageBus || new MessageBus(), [customMessageBus]);
  const iframeRefs = useRef<Map<string, React.RefObject<HTMLIFrameElement | null>>>(new Map());
  const isListening = useRef(false);
  
  // 启动消息监听 - 只启动一次
  useEffect(() => {
    if (isListening.current) return;
    
    const stopListening = manager.startListening((message: CardToParentMessage) => {
      messageBus.dispatch(message.eventType, message);
    });
    
    isListening.current = true;
    
    return () => {
      stopListening();
      isListening.current = false;
    };
  }, [manager, messageBus]);

  // 创建上下文值
  const contextValue: CardCommunicationContextValue = useMemo(() => ({
    sendToCard: (cardId: string, message: ParentToCardMessage) => {
      return manager.sendToCard(cardId, message);
    },
    
    broadcast: (message: ParentToCardMessage) => {
      return manager.broadcast(message);
    },
    
    registerCards: (cards: CardData[]) => {
      if (!autoRegister) return;
      
      // 清理不存在的卡片
      const currentCardIds = new Set(cards.map(card => card.id));
      manager.getCardIds().forEach(cardId => {
        if (!currentCardIds.has(cardId)) {
          manager.unregisterCard(cardId);
          iframeRefs.current.delete(cardId);
        }
      });
      
      // 注册新卡片
      cards.forEach(card => {
        if (!iframeRefs.current.has(card.id)) {
          const ref = React.createRef<HTMLIFrameElement | null>();
          iframeRefs.current.set(card.id, ref);
          
          // 创建简化的卡片实例
          const cardInstance = {
            id: card.id,
            send: (message: ParentToCardMessage) => {
              const iframe = ref.current;
              if (iframe?.contentWindow) {
                iframe.contentWindow.postMessage(message, "*");
                return true;
              }
              return false;
            }
          };
          
          manager.registerCard(cardInstance);
        }
      });
    },
    
    onMessage: (eventType: string, handler: (message: CardToParentMessage) => void) => {
      messageBus.registerHandler(eventType, handler);
      return () => messageBus.unregisterHandler(eventType, handler);
    },
    
    getActiveCardCount: () => manager.getCardCount(),
    
    getIframeRef: (cardId: string) => iframeRefs.current.get(cardId),
    
  }), [manager, messageBus, autoRegister]);

  return (
    <CardCommunicationContext.Provider value={contextValue}>
      {children}
    </CardCommunicationContext.Provider>
  );
}

/**
 * 使用卡片通信的Hook - 提供极简API
 */
export function useCardCommunication(): CardCommunicationContextValue {
  const context = useContext(CardCommunicationContext);
  if (!context) {
    throw new Error('useCardCommunication must be used within a CardCommunicationProvider');
  }
  return context;
}

/**
 * 高级Hook - 处理常见的卡片操作
 */
export function useCardOperations() {
  const communication = useCardCommunication();
  
  return useMemo(() => ({
    /**
     * 高亮所有卡片
     */
    highlightAllCards: (color = 'yellow') => {
      return communication.broadcast({
        type: 'parentCommand',
        metadata: { version: '1.0', timestamp: Date.now(), messageId: crypto.randomUUID() },
        commandType: ParentCommandType.HIGHLIGHT,
        payload: { color }
      });
    },
    
    /**
     * 向特定卡片发送警告
     */
    alertCard: (cardId: string, message: string) => {
      return communication.sendToCard(cardId, {
        type: 'parentCommand',
        metadata: { version: '1.0', timestamp: Date.now(), messageId: crypto.randomUUID() },
        commandType: ParentCommandType.ALERT,
        payload: { message }
      });
    },
    
    /**
     * 更新卡片显示
     */
    updateCardDisplay: (cardId: string, data: unknown) => {
      return communication.sendToCard(cardId, {
        type: 'parentCommand',
        metadata: { version: '1.0', timestamp: Date.now(), messageId: crypto.randomUUID() },
        commandType: ParentCommandType.UPDATE_DISPLAY,
        payload: data
      });
    },
    
    ...communication
  }), [communication]);
} 
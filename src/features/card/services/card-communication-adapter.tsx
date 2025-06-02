import React, { useEffect, useMemo } from 'react';
import { 
  CommunicationProvider, 
  useCommunication, 
  NodeData,
  NodeInstance
} from '@/shared/services/communication/react-provider';
import { 
  PostMessageCommunicationManager 
} from '@/shared/services/communication/managers';
import { 
  MessageBuilder, 
  CoordinatorToNodeMessage 
} from '@/shared/services/communication/core';
import { 
  CardEventType, 
  ParentCommandType 
} from '../types/communication';

/**
 * 卡片数据接口 - 扩展自通用NodeData
 */
export interface CardData extends NodeData {
  title: string;
  htmlContent: string;
  conversationId?: string;
  createdAt?: number;
  updatedAt?: number;
  metadata?: unknown;
}

/**
 * iframe卡片节点实现
 */
export function createIFrameCardNode(cardData: CardData): NodeInstance {
  const iframeRef = React.createRef<HTMLIFrameElement | null>();
  
  return {
    communicationNode: {
      id: cardData.id,
      send: (message: CoordinatorToNodeMessage) => {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(message, "*");
          return true;
        }
        return false;
      }
    },
    resource: iframeRef
  };
}

/**
 * 卡片通信Provider - 基于通用通信框架的卡片特化
 */
export interface CardCommunicationProviderProps {
  children: React.ReactNode;
}

export function CardCommunicationProvider({ children }: CardCommunicationProviderProps) {
  const communicationManager = useMemo(() => new PostMessageCommunicationManager(), []);

  return (
    <CommunicationProvider 
      config={{ 
        manager: communicationManager,
        autoRegister: true 
      }}
    >
      {children}
    </CommunicationProvider>
  );
}

/**
 * 卡片通信Hook - 提供卡片特定的API
 */
export function useCardCommunication() {
  const communication = useCommunication();
  
  return useMemo(() => ({
    /**
     * 注册卡片列表
     */
    registerCards: (cards: CardData[]) => {
      communication.registerNodes(cards, (nodeData) => createIFrameCardNode(nodeData as CardData));
    },
    
    /**
     * 发送消息给特定卡片
     */
    sendToCard: (cardId: string, message: CoordinatorToNodeMessage) => {
      return communication.sendToNode(cardId, message);
    },
    
    /**
     * 广播消息给所有卡片
     */
    broadcast: (message: CoordinatorToNodeMessage) => {
      return communication.broadcast(message);
    },
    
    /**
     * 监听来自卡片的消息
     */
    onMessage: communication.onMessage,
    
    /**
     * 获取活跃卡片数量
     */
    getActiveCardCount: communication.getActiveNodeCount,
    
    /**
     * 获取卡片的iframe引用
     */
    getIframeRef: (cardId: string): React.RefObject<HTMLIFrameElement | null> | undefined => {
      return communication.getNodeResource(cardId) as React.RefObject<HTMLIFrameElement | null> | undefined;
    }
  }), [communication]);
}

/**
 * 卡片操作Hook - 提供常见的卡片操作
 */
export function useCardOperations() {
  const cardCommunication = useCardCommunication();
  
  return useMemo(() => ({
    /**
     * 高亮所有卡片
     */
    highlightAllCards: (color = 'yellow') => {
      return cardCommunication.broadcast(
        MessageBuilder.createCoordinatorCommand(
          ParentCommandType.HIGHLIGHT,
          { color }
        )
      );
    },
    
    /**
     * 向特定卡片发送警告
     */
    alertCard: (cardId: string, message: string) => {
      return cardCommunication.sendToCard(
        cardId,
        MessageBuilder.createCoordinatorCommand(
          ParentCommandType.ALERT,
          { message }
        )
      );
    },
    
    /**
     * 更新卡片显示
     */
    updateCardDisplay: (cardId: string, data: unknown) => {
      return cardCommunication.sendToCard(
        cardId,
        MessageBuilder.createCoordinatorCommand(
          ParentCommandType.UPDATE_DISPLAY,
          data
        )
      );
    },
    
    /**
     * 转发数据更新事件
     */
    relayDataUpdate: (sourceCardId: string, payload: unknown) => {
      return cardCommunication.broadcast(
        MessageBuilder.createCoordinatorCommand(
          ParentCommandType.RELAY_EVENT,
          payload,
          sourceCardId
        )
      );
    },
    
    // 包含所有基础通信方法
    ...cardCommunication
  }), [cardCommunication]);
}

/**
 * 卡片渲染组件 - 使用通用通信框架
 */
export function CardRenderer({ card }: { card: CardData }) {
  const { getIframeRef } = useCardCommunication();
  const iframeRef = getIframeRef(card.id);

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden">
      <h3 className="p-3 bg-gray-100 dark:bg-gray-800 text-sm font-semibold border-b">
        {card.title} (ID: {card.id})
      </h3>
      <iframe
        ref={iframeRef}
        srcDoc={card.htmlContent}
        title={card.title}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-64 border-0"
      />
    </div>
  );
}

/**
 * 卡片消息监听Hook - 自动设置消息处理
 */
export function useCardMessageHandlers() {
  const { onMessage } = useCardCommunication();
  const { relayDataUpdate } = useCardOperations();

  useEffect(() => {
    // 监听数据更新事件，自动转发给其他卡片
    const unsubscribeDataUpdate = onMessage(CardEventType.DATA_UPDATE, (message) => {
      console.log('Data update from card:', message);
      relayDataUpdate(message.sourceNodeId, message.payload);
    });

    const unsubscribeStateChange = onMessage(CardEventType.STATE_CHANGE, (message) => {
      console.log('Card state changed:', message);
    });

    const unsubscribeUserAction = onMessage(CardEventType.USER_ACTION, (message) => {
      console.log('User action:', message);
    });

    const unsubscribeError = onMessage(CardEventType.ERROR, (message) => {
      console.error('Card error:', message);
    });

    return () => {
      unsubscribeDataUpdate();
      unsubscribeStateChange();
      unsubscribeUserAction();
      unsubscribeError();
    };
  }, [onMessage, relayDataUpdate]);
} 
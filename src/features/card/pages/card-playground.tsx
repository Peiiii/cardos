import { useCards } from '@/features/card/hooks/use-cards';
import { PageLayout } from '@/shared/components/layout/page/page-layout';
import { SmartCard } from '@/shared/types/smart-card';
import React, { useEffect, useState } from 'react';
import { ParentToCardMessage, isCardToParentMessage } from '../types/communication';

interface CardFrame extends SmartCard {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export default function CardPlaygroundPage() {
  const { data: cardsData, isLoading, error } = useCards(undefined, { reload: true });
  const [activeCards, setActiveCards] = useState<CardFrame[]>([]);

  // Initialize activeCards with iframe refs
  useEffect(() => {
    if (cardsData) {
      setActiveCards(
        cardsData.map(card => ({
          ...card,
          iframeRef: React.createRef<HTMLIFrameElement | null>(),
        }))
      );
    }
  }, [cardsData]);

  // Message listener for messages from iframes
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: check origin if your cards are hosted on a different domain
      // if (event.origin !== 'expected-origin') return;
      
      const messageData = event.data;
      if (isCardToParentMessage(messageData)) {
        console.log('Message from card:', messageData);
        // Relay message to other cards or handle specific events
        broadcastToCards({
          type: 'parentCommand',
          commandType: 'cardRelayEvent',
          payload: messageData.payload,
          originCardId: messageData.sourceCardId,
        });
      } else {
        // console.warn('Received unknown message format:', messageData);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeCards]); // Dependency on activeCards to re-bind if refs change, though refs are stable

  // Function to broadcast messages to all cards
  const broadcastToCards = (message: ParentToCardMessage) => {
    activeCards.forEach(card => {
      card.iframeRef.current?.contentWindow?.postMessage(message, '*'); // Use targetOrigin for security in production
    });
  };

  // Function to send a message to a specific card
  const sendToCard = (cardId: string, message: ParentToCardMessage) => {
    const targetCard = activeCards.find(card => card.id === cardId);
    targetCard?.iframeRef.current?.contentWindow?.postMessage(message, '*'); // Use targetOrigin for security
  };

  if (isLoading) return <PageLayout title="加载中..." loading={true}><p>正在努力加载卡片...</p></PageLayout>;
  if (error) return <PageLayout title="错误" error={error.message}><p>加载卡片时发生错误。</p></PageLayout>;
  if (!cardsData || cardsData.length === 0) return <PageLayout title="卡片演练场"><p>没有可用的卡片来开始演练。</p></PageLayout>;

  return (
    <PageLayout title="卡片演练场 - 跨卡片通信" className="p-6 flex flex-col h-full">
      <div className="mb-4 p-4 border rounded-lg bg-muted">
        <h2 className="text-lg font-semibold mb-2">控制面板</h2>
        <p className="text-sm text-muted-foreground mb-2">
          从这里向所有卡片或特定卡片发送命令。
        </p>
        <button 
          onClick={() => broadcastToCards({ type: 'parentCommand', commandType: 'highlight', payload: { color: 'yellow' } })}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          高亮所有卡片
        </button>
        <button 
          onClick={() => activeCards[0] && sendToCard(activeCards[0].id, { type: 'parentCommand', commandType: 'alertMessage', payload: { message: '你好，第一张卡片！' } })}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={activeCards.length === 0}
        >
          向第一张卡片发送消息
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCards.map(card => (
          <div key={card.id} className="border rounded-lg shadow-lg overflow-hidden">
            <h3 className="p-3 bg-gray-100 dark:bg-gray-800 text-sm font-semibold border-b">
              {card.title} (ID: {card.id})
            </h3>
            <iframe
              ref={card.iframeRef}
              srcDoc={card.htmlContent}
              title={card.title}
              sandbox="allow-scripts allow-same-origin" // allow-popups for window.open, etc.
              className="w-full h-64 border-0"
            />
          </div>
        ))}
      </div>
    </PageLayout>
  );
} 
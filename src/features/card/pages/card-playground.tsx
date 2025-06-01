import { useCards } from "@/features/card/hooks/use-cards";
import { PageLayout } from "@/shared/components/layout/page/page-layout";
import { SmartCard } from "@/shared/types/smart-card";
import React, { useEffect, useMemo, useState } from "react";
import {
  CardEventType,
  CardToParentMessage,
  MessageBuilder,
  MessageBus,
  ParentCommandType,
  isCardToParentMessage,
} from "../types/communication";

interface CardFrame extends SmartCard {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export default function CardPlaygroundPage() {
  const {
    data: cardsData,
    isLoading,
    error,
  } = useCards(undefined, { reload: true });
  const [activeCards, setActiveCards] = useState<CardFrame[]>([]);
  const messageBus = useMemo(() => new MessageBus(), []);

  // Initialize activeCards with iframe refs
  useEffect(() => {
    if (cardsData) {
      setActiveCards(
        cardsData.map((card) => ({
          ...card,
          iframeRef: React.createRef<HTMLIFrameElement | null>(),
        }))
      );
    }
  }, [cardsData]);

  // Initialize message handlers
  useEffect(() => {
    // 注册数据更新处理器
    messageBus.registerHandler(CardEventType.DATA_UPDATE, (message: CardToParentMessage) => {
      broadcastToCards(
        MessageBuilder.createParentCommand(
          ParentCommandType.RELAY_EVENT,
          message.payload,
          message.sourceCardId
        )
      );
    });

    // 注册状态变更处理器
    messageBus.registerHandler(CardEventType.STATE_CHANGE, (message: CardToParentMessage) => {
      console.log('Card state changed:', message);
    });

    // 注册用户操作处理器
    messageBus.registerHandler(CardEventType.USER_ACTION, (message: CardToParentMessage) => {
      console.log('User action:', message);
    });

    // 注册错误处理器
    messageBus.registerHandler(CardEventType.ERROR, (message: CardToParentMessage) => {
      console.error('Card error:', message);
    });

    const handleMessage = (event: MessageEvent) => {
      const messageData = event.data;
      if (isCardToParentMessage(messageData)) {
        messageBus.dispatch(messageData.eventType, messageData);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [messageBus]);

  // Function to broadcast messages to all cards
  const broadcastToCards = (message: ReturnType<typeof MessageBuilder.createParentCommand>) => {
    activeCards.forEach((card) => {
      card.iframeRef.current?.contentWindow?.postMessage(message, "*");
    });
  };

  // Function to send a message to a specific card
  const sendToCard = (cardId: string, message: ReturnType<typeof MessageBuilder.createParentCommand>) => {
    const targetCard = activeCards.find((card) => card.id === cardId);
    targetCard?.iframeRef.current?.contentWindow?.postMessage(message, "*");
  };

  if (isLoading)
    return (
      <PageLayout title="加载中..." loading={true}>
        <p>正在努力加载卡片...</p>
      </PageLayout>
    );
  if (error)
    return (
      <PageLayout title="错误" error={error.message}>
        <p>加载卡片时发生错误。</p>
      </PageLayout>
    );
  if (!cardsData || cardsData.length === 0)
    return (
      <PageLayout title="卡片演练场">
        <p>没有可用的卡片来开始演练。</p>
      </PageLayout>
    );

  return (
    <PageLayout
      title="卡片演练场 - 跨卡片通信"
      className="p-6 flex flex-col h-full"
    >
      <div className="mb-4 p-4 border rounded-lg bg-muted">
        <h2 className="text-lg font-semibold mb-2">控制面板</h2>
        <p className="text-sm text-muted-foreground mb-2">
          从这里向所有卡片或特定卡片发送命令。
        </p>
        <button
          onClick={() =>
            broadcastToCards(
              MessageBuilder.createParentCommand(
                ParentCommandType.HIGHLIGHT,
                { color: "yellow" }
              )
            )
          }
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          高亮所有卡片
        </button>
        <button
          onClick={() =>
            activeCards[0] &&
            sendToCard(
              activeCards[0].id,
              MessageBuilder.createParentCommand(
                ParentCommandType.ALERT,
                { message: "你好，第一张卡片！" }
              )
            )
          }
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={activeCards.length === 0}
        >
          向第一张卡片发送消息
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCards.map((card) => (
          <div
            key={card.id}
            className="border rounded-lg shadow-lg overflow-hidden"
          >
            <h3 className="p-3 bg-gray-100 dark:bg-gray-800 text-sm font-semibold border-b">
              {card.title} (ID: {card.id})
            </h3>
            <iframe
              ref={card.iframeRef}
              srcDoc={card.htmlContent}
              title={card.title}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-64 border-0"
            />
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
 
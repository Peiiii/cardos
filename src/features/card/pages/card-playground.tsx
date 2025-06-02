import { useCards } from "@/features/card/hooks/use-cards";
import { PageLayout } from "@/shared/components/layout/page/page-layout";
import { useEffect } from "react";
import { 
  CardCommunicationProvider, 
  useCardCommunication, 
  useCardOperations,
  useCardMessageHandlers,
  CardRenderer,
  CardData 
} from "../services/card-communication-adapter";

// 控制面板组件
function CardControlPanel({ cards }: { cards: CardData[] }) {
  const { getActiveCardCount } = useCardCommunication();
  const { highlightAllCards, alertCard } = useCardOperations();
  
  // 自动设置消息处理
  useCardMessageHandlers();

  return (
    <div className="mb-4 p-4 border rounded-lg bg-muted">
      <h2 className="text-lg font-semibold mb-2">控制面板</h2>
      <p className="text-sm text-muted-foreground mb-2">
        从这里向所有卡片或特定卡片发送命令。当前活跃卡片数量: {getActiveCardCount()}
      </p>
      <button
        onClick={() => highlightAllCards('yellow')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
      >
        高亮所有卡片
      </button>
      <button
        onClick={() => cards[0] && alertCard(cards[0].id, "你好，第一张卡片！")}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        disabled={cards.length === 0}
      >
        向第一张卡片发送消息
      </button>
    </div>
  );
}

// 主要的卡片展示组件
function CardPlaygroundContent() {
  const { data: cardsData, isLoading, error } = useCards(undefined, { reload: true });
  const { registerCards } = useCardCommunication();

  // 自动注册卡片
  useEffect(() => {
    if (cardsData) {
      // SmartCard已经兼容CardData
      registerCards(cardsData as CardData[]);
    }
  }, [cardsData, registerCards]);

  if (isLoading) {
    return (
      <PageLayout title="加载中..." loading={true}>
        <p>正在努力加载卡片...</p>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="错误" error={error.message}>
        <p>加载卡片时发生错误。</p>
      </PageLayout>
    );
  }

  if (!cardsData || cardsData.length === 0) {
    return (
      <PageLayout title="卡片演练场">
        <p>没有可用的卡片来开始演练。</p>
      </PageLayout>
    );
  }

  // SmartCard类型已经兼容CardData
  const cards = cardsData as CardData[];

  return (
    <PageLayout
      title="卡片演练场 - 通用多方通信"
      className="p-6 flex flex-col h-full"
    >
      <CardControlPanel cards={cards} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <CardRenderer key={card.id} card={card} />
        ))}
      </div>
    </PageLayout>
  );
}

// 根组件 - 提供通信上下文
export default function CardPlaygroundPage() {
  return (
    <CardCommunicationProvider>
      <CardPlaygroundContent />
    </CardCommunicationProvider>
  );
}
 
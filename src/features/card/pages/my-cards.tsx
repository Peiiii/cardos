import { useNavigate } from 'react-router-dom';
import { useCards } from '@/features/card/hooks/use-cards';
import { PageLayout } from '@/shared/components/layout/page/page-layout';
import { linkUtilService } from '@/core/services/link-util.service';
import { CardItem } from '../components/card-item';
import { EmptyCardList } from '../components/empty-card-list';

export default function MyCardsPage() {
  const navigate = useNavigate();
  const { data: cards, isLoading, error } = useCards(undefined, { reload: true });

  const handleViewCard = (cardId: string) => {
    navigate(linkUtilService.pathOfCard(cardId));
  };

  const handleEditCard = (cardId: string) => {
    navigate(linkUtilService.pathOfCardEdit(cardId));
  };

  const handleDeleteCard = (cardId: string) => {
    // TODO: 实现删除卡片功能
    console.log('Delete card:', cardId);
  };

  return (
    <PageLayout 
      title="我的卡片" 
      error={error?.message} 
      loading={isLoading}
      className="p-6"
    >
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              id={card.id}
              title={card.title}
              htmlContent={card.htmlContent}
              createdAt={new Date(card.createdAt).toISOString()}
              onView={handleViewCard}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          ))}
        </div>
      ) : (
        <EmptyCardList />
      )}
    </PageLayout>
  );
} 
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CardPreviewItem } from '@/features/card/components/card-preview-item';
import { cardService } from '@/features/card/services/card';
import { SmartCard } from '@/shared/types/smart-card';
import { PageLayout } from '@/shared/components/layout/page/page-layout';
import { Button } from '@/shared/components/ui/button';

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<SmartCard | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      if (!cardId) {
        setError('卡片ID不存在');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const cardData = await cardService.getCard(cardId);
        
        if (!cardData) {
          setError('未找到卡片');
          return;
        }
        
        setCard(cardData);
      } catch (err) {
        console.error('加载卡片失败:', err);
        setError('加载卡片失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCard();
  }, [cardId]);

  const handleBack = () => {
    navigate('/my-cards');
  };

  return (
    <PageLayout
      title="卡片详情"
      error={error}
      loading={loading}
      className="p-6"
    >
      {card && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Button variant="outline" onClick={handleBack}>
              返回列表
            </Button>
          </div>
          <CardPreviewItem
            title={card.title}
            content={card.htmlContent}
            timestamp={card.createdAt}
            onShare={() => alert('已复制分享链接！')}
            onExport={() => alert('已导出为PDF！')}
            onCopy={() => alert('已复制内容到剪贴板！')}
          />
        </div>
      )}
    </PageLayout>
  );
} 
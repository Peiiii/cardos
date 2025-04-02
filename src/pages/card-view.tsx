import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CardPreviewItem } from '@/components/card/card-preview-item';
import { cardService } from '@/services/card';
import { SmartCard } from '@/types/smart-card';
import { Card } from '@/components/ui/card';

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<SmartCard | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      if (!cardId) return;
      
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-6 space-y-4">
        <div className="h-10 w-3/4 rounded-md bg-gray-200 animate-pulse"></div>
        <div className="h-40 w-5/6 rounded-md bg-gray-200 animate-pulse"></div>
        <div className="flex justify-between w-full">
          <div className="h-8 w-20 rounded-md bg-gray-200 animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="flex items-center justify-center w-full h-full p-6">
        <Card className="p-4 max-w-md bg-red-50 border-red-200">
          <div className="flex items-start space-x-2">
            <div className="text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-red-800">错误</h4>
              <p className="text-red-600">{error || '卡片加载失败'}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <CardPreviewItem
          title={card.title}
          content={card.htmlContent}
          timestamp={card.createdAt}
          onShare={() => alert('已复制分享链接！')}
          onExport={() => alert('已导出为PDF！')}
          onCopy={() => alert('已复制内容到剪贴板！')}
        />
      </div>
    </div>
  );
} 
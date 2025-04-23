import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cardService } from '@/features/card/services/card';
import { SmartCard } from '@/shared/types/smart-card';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { PageLayout } from '@/shared/components/layout/page/page-layout';

export default function MyCardsPage() {
  const [cards, setCards] = useState<SmartCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载卡片数据
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const fetchedCards = await cardService.queryCards();
        setCards(fetchedCards);
        setError(null);
      } catch (err) {
        console.error('加载卡片失败:', err);
        setError('加载卡片失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCards();
  }, []);

  return (
    <PageLayout 
      title="我的卡片" 
      error={error} 
      loading={loading}
      className="p-6"
    >
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Card key={card.id}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="max-h-36 overflow-hidden" 
                  dangerouslySetInnerHTML={{ __html: card.htmlContent }} 
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(card.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">编辑</Button>
                  <Button variant="destructive" size="sm">删除</Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardHeader>
            <CardTitle>没有卡片</CardTitle>
            <CardDescription>开始创建您的第一张智能卡片</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/create">创建卡片</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </PageLayout>
  );
} 
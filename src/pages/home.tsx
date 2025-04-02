import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cardService } from '../services/card';
import { SmartCard } from '../types/smart-card';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export default function HomePage() {
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
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-foreground mb-6">我的卡片</h2>
      
      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">正在加载卡片...</p>
        </div>
      )}
      
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 卡片列表 */}
      {!loading && !error && (
        <>
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
        </>
      )}
    </div>
  );
} 
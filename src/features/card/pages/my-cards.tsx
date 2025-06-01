import { Link, useNavigate } from 'react-router-dom';
import { useCards } from '@/features/card/hooks/use-cards';
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
import { linkUtilService } from '@/core/services/link-util.service';

export default function MyCardsPage() {
  const navigate = useNavigate();
  const { data: cards, isLoading, error } = useCards();

  const handleViewCard = (cardId: string) => {
    navigate(linkUtilService.pathOfCard(cardId));
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
            <Card key={card.id}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  srcDoc={card.htmlContent}
                  title={card.title}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin" // Adjust sandbox as needed
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(card.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewCard(card.id)}
                  >
                    查看
                  </Button>
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
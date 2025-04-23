import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardService } from '@/features/card/services/card';
import { SmartCardCreateParams } from '@/shared/types/smart-card';
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

export default function CreateCardPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('请输入卡片标题');
      return;
    }

    if (!content.trim()) {
      setError('请输入卡片内容');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const cardData: SmartCardCreateParams = {
        title,
        htmlContent: content,
        metadata: {
          tags: [],
          isFavorite: false,
          author: '当前用户',
          generatedAt: Date.now()
        }
      };
      
      await cardService.createCard(cardData);
      navigate('/');
    } catch (err) {
      console.error('创建卡片失败:', err);
      setError('创建卡片失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout 
      title="创建卡片" 
      error={error} 
      loading={loading}
      className="p-6"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>创建新卡片</CardTitle>
          <CardDescription>填写信息创建一张新的智能卡片</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                卡片标题
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="输入卡片标题"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="content" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                卡片内容
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="输入卡片内容或HTML代码"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? '创建中...' : '创建卡片'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageLayout>
  );
} 
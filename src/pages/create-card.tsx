import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardService } from '@/features/card/services/card';
import { SmartCardCreateParams } from '@/types/smart-card';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

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
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">创建卡片</h2>
      
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
      
      <Card>
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
          <CardFooter className="flex justify-end space-x-2">
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
    </>
  );
} 
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { PageLayout } from '@/shared/components/layout/page/page-layout';

export default function HomePage() {
  return (
    <PageLayout 
      title="欢迎使用 CardOS" 
      className="p-6"
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>开始使用</CardTitle>
            <CardDescription>创建您的第一张智能卡片，开始您的知识管理之旅</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium">创建新卡片</h3>
                  <p className="text-sm text-muted-foreground">
                    创建一张新的智能卡片，记录您的想法和知识
                  </p>
                </div>
                <Button asChild>
                  <Link to="/create">创建卡片</Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium">查看我的卡片</h3>
                  <p className="text-sm text-muted-foreground">
                    浏览和管理您创建的所有卡片
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/my-cards">查看卡片</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>功能介绍</CardTitle>
            <CardDescription>了解 CardOS 的主要功能</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-medium">智能卡片</h3>
                <p className="text-sm text-muted-foreground">
                  使用 Markdown 和 HTML 创建丰富的卡片内容，支持代码高亮、数学公式等
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">知识管理</h3>
                <p className="text-sm text-muted-foreground">
                  通过标签和分类管理您的知识，快速找到需要的内容
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">分享协作</h3>
                <p className="text-sm text-muted-foreground">
                  分享您的卡片，与团队成员协作，共同构建知识库
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 
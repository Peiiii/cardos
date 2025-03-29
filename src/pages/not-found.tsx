import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">页面未找到</p>
      <p className="text-md text-gray-500 mb-8">您访问的页面不存在或已被移除</p>
      <Button asChild>
        <Link to="/">返回首页</Link>
      </Button>
    </div>
  );
} 
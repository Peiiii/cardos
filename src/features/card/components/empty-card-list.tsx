import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export function EmptyCardList() {
  return (
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
  );
} 
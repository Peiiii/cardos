import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { CardPreview } from './card-preview';

interface CardItemProps {
  id: string;
  title: string;
  htmlContent: string;
  createdAt: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CardItem({
  id,
  title,
  htmlContent,
  createdAt,
  onView,
  onEdit,
  onDelete,
}: CardItemProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardPreview htmlContent={htmlContent} title={title} />
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-muted-foreground">
          {new Date(createdAt).toLocaleDateString()}
        </span>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onView(id)}>
            查看
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(id)}>
            编辑
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
            删除
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 
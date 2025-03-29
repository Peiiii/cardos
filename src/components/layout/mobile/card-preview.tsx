import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CardPreviewProps {
  className?: string;
  children?: ReactNode;
}

export function CardPreview({ className, children }: CardPreviewProps) {
  const navigate = useNavigate();
  
  return (
    <div className={cn(
      "flex flex-col h-screen w-full bg-[#F8F9FC]",
      className
    )}>
      {/* 移动端返回按钮 */}
      <div className="flex items-center px-4 py-2 border-b border-b-gray-100">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-medium text-blue-800/80">卡片预览</h2>
      </div>

      <ScrollArea className="flex-1 pr-2">
        <div className="flex items-start justify-center p-4">
          <div className="w-full max-w-2xl mx-auto transform transition-all duration-300">
            {children}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 
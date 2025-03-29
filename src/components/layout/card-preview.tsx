import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResponsive } from '@/hooks/use-responsive';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CardPreviewProps {
  className?: string;
  children?: ReactNode;
}

export function CardPreview({ className, children }: CardPreviewProps) {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-[#F8F9FC]",
      isMobile ? "w-full" : "flex-1 min-w-[600px] border-l border-l-gray-100",
      className
    )}>
      {/* 移动端返回按钮 */}
      {isMobile && (
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
      )}

      {/* 桌面端标题 */}
      {!isMobile && (
        <h2 className="text-sm font-medium text-blue-800/80 mb-4 pl-1 pt-8 px-8">卡片预览</h2>
      )}

      <ScrollArea className="flex-1 pr-2">
        <div className={cn(
          "flex items-start justify-center",
          isMobile ? "px-4 py-4" : "pt-8 px-8 pb-6"
        )}>
          <div className="w-full max-w-2xl mx-auto transform transition-all duration-300">
            {children}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 
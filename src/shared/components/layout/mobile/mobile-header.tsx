import { Menu } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/utils';
import { useEffect, useState } from 'react';

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
  className?: string;
}

export function MobileHeader({ 
  title, 
  onMenuClick,
  className 
}: MobileHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动事件，用于添加阴影效果
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn(
      "sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      isScrolled && "shadow-sm",
      className
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">打开菜单</span>
      </Button>
      
      <h1 className="text-lg font-semibold truncate">
        {title}
      </h1>
    </div>
  );
} 
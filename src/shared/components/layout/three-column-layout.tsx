import { useResponsive } from "@/shared/hooks/use-responsive";
import { cn } from "@/shared/utils/utils";

interface ThreeColumnLayoutProps {
  children: React.ReactNode;
  leftPanel?: React.ReactNode;    // 左侧面板
  rightPanel?: React.ReactNode;   // 右侧面板
  className?: string;
}

export function ThreeColumnLayout({ 
  children, 
  leftPanel, 
  rightPanel,
  className 
}: ThreeColumnLayoutProps) {
  const { isMobile } = useResponsive();
  
  if (isMobile) {
    return (
      <div className={cn("flex flex-col h-screen", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen", className)}>
      {/* 左侧面板 */}
      {leftPanel && (
        <div className="w-[250px] border-r border-border">
          {leftPanel}
        </div>
      )}
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      
      {/* 右侧面板 */}
      {rightPanel && (
        <div className="w-[400px] border-l border-border">
          {rightPanel}
        </div>
      )}
    </div>
  );
} 
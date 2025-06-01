import { useRef, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Maximize, Minimize, RefreshCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface CardPreviewPanelProps {
  htmlContent: string;
  onRefresh?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  className?: string;
}

export function CardPreviewPanel({
  htmlContent,
  onRefresh,
  onToggleFullscreen,
  isFullscreen = false,
  className = '',
}: CardPreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const handleRefresh = () => {
    setPreviewKey(prev => prev + 1);
    onRefresh?.();
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}>
      <div className="p-2 border-b flex justify-between items-center bg-background">
        <p className="text-sm font-medium">实时预览</p>
        <div className="flex space-x-1">
          {onRefresh && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleRefresh}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>刷新预览</TooltipContent>
            </Tooltip>
          )}
          {onToggleFullscreen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onToggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? '退出全屏' : '全屏预览'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <iframe
        ref={iframeRef}
        key={previewKey}
        srcDoc={htmlContent}
        title="Card Preview"
        className="w-full h-full border-0 flex-grow bg-white dark:bg-gray-900"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
} 
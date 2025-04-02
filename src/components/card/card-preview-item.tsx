import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share, Download, Copy, Check, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardPreviewItemProps {
  title: string;
  content: string;
  timestamp?: number;
  onShare?: () => void;
  onExport?: () => void;
  onCopy?: () => void;
}

export function CardPreviewItem({ 
  title, 
  content, 
  timestamp,
  onShare,
  onExport,
  onCopy
}: CardPreviewItemProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        if (onCopy) onCopy();
      });
  };

  const handleShare = () => {
    // 模拟分享功能
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
    if (onShare) onShare();
  };

  const handleExport = () => {
    // 模拟导出功能
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
    if (onExport) onExport();
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <Card className="w-full max-h-[calc(100vh-9rem)] flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl rounded-xl overflow-hidden border-border bg-card">
      <CardHeader className="p-6 pb-2 flex-shrink-0 flex flex-row items-center justify-between border-b border-border bg-gradient-to-r from-accent/10 to-card">
        <CardTitle className="text-xl font-semibold text-card-foreground truncate pr-2">{title}</CardTitle>
        <div className="flex flex-shrink-0 space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLike} 
            title={isLiked ? "取消喜欢" : "喜欢"}
            className={cn(
              "transition-all hover:bg-destructive/10 rounded-full",
              isLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked ? "fill-destructive" : "")} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare} 
            title="分享"
            className="transition-all hover:bg-accent hover:text-accent-foreground relative rounded-full"
          >
            {shareSuccess ? <Check className="h-4 w-4 text-success" /> : <Share className="h-4 w-4" />}
            {shareSuccess && (
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-popover text-popover-foreground py-1 px-2 rounded whitespace-nowrap">
                已复制链接
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleExport} 
            title="导出"
            className="transition-all hover:bg-accent hover:text-accent-foreground relative rounded-full"
          >
            {exportSuccess ? <Check className="h-4 w-4 text-success" /> : <Download className="h-4 w-4" />}
            {exportSuccess && (
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-popover text-popover-foreground py-1 px-2 rounded whitespace-nowrap">
                已导出
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCopy} 
            title="复制"
            className="transition-all hover:bg-accent hover:text-accent-foreground relative rounded-full"
          >
            {copySuccess ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            {copySuccess && (
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-popover text-popover-foreground py-1 px-2 rounded whitespace-nowrap">
                已复制
              </span>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4 flex-1 overflow-auto scrollbar-thin transition-colors duration-300 hover:bg-accent/5">
        <div className="text-base leading-relaxed whitespace-pre-line break-words text-card-foreground">{content}</div>
      </CardContent>
      {timestamp && (
        <CardFooter className="p-6 pt-3 flex-shrink-0 border-t border-border text-xs text-muted-foreground bg-gradient-to-r from-card to-accent/5">
          创建于 {new Date(timestamp).toLocaleString()}
        </CardFooter>
      )}
    </Card>
  );
} 
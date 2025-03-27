import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share, Download, Copy, Check, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardPreviewItemProps {
  title: string;
  content: string;
  timestamp?: string;
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
    <Card className="w-full max-h-[calc(100vh-9rem)] flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl rounded-xl overflow-hidden border-blue-200 bg-white">
      <CardHeader className="p-6 pb-2 flex-shrink-0 flex flex-row items-center justify-between border-b border-blue-100 bg-gradient-to-r from-blue-100/50 to-white">
        <CardTitle className="text-xl font-semibold text-blue-900 truncate pr-2">{title}</CardTitle>
        <div className="flex flex-shrink-0 space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLike} 
            title={isLiked ? "取消喜欢" : "喜欢"}
            className={cn(
              "transition-all hover:bg-red-50 rounded-full",
              isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked ? "fill-red-500" : "")} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare} 
            title="分享"
            className="transition-all hover:bg-blue-50 hover:text-blue-600 relative rounded-full"
          >
            {shareSuccess ? <Check className="h-4 w-4 text-green-500" /> : <Share className="h-4 w-4" />}
            {shareSuccess && (
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-black/80 text-white py-1 px-2 rounded whitespace-nowrap">
                已复制链接
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleExport} 
            title="导出"
            className="transition-all hover:bg-blue-50 hover:text-blue-600 relative rounded-full"
          >
            {exportSuccess ? <Check className="h-4 w-4 text-green-500" /> : <Download className="h-4 w-4" />}
            {exportSuccess && (
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-black/80 text-white py-1 px-2 rounded whitespace-nowrap">
                已导出
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCopy} 
            title="复制"
            className="transition-all hover:bg-blue-50 hover:text-blue-600 relative rounded-full"
          >
            {copySuccess ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copySuccess && (
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-black/80 text-white py-1 px-2 rounded whitespace-nowrap">
                已复制
              </span>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4 flex-1 overflow-auto scrollbar-thin transition-colors duration-300 hover:bg-blue-50/10">
        <div className="text-base leading-relaxed whitespace-pre-line break-words">{content}</div>
      </CardContent>
      {timestamp && (
        <CardFooter className="p-6 pt-3 flex-shrink-0 border-t border-blue-100 text-xs text-blue-500 bg-gradient-to-r from-white to-blue-50/40">
          创建于 {timestamp}
        </CardFooter>
      )}
    </Card>
  );
} 
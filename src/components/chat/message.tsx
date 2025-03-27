import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check, ThumbsUp, MoreHorizontal, Reply } from 'lucide-react';

export interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

export function Message({ content, isUser, timestamp }: MessageProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div 
      className={cn(
        "flex mb-4 group",
        isUser ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "rounded-2xl py-2 px-3 max-w-[80%] relative transition-all duration-200 shadow-sm",
        isUser 
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
          : "bg-white border border-gray-100 hover:border-blue-100 text-foreground",
        isHovered && !isUser && "shadow-md"
      )}>
        <div className="text-sm whitespace-pre-line">{content}</div>
        {timestamp && (
          <div className="text-xs opacity-70 mt-1">{timestamp}</div>
        )}
        
        {isHovered && !isUser && (
          <div className="absolute -right-2 top-0 transform -translate-y-1/2 flex items-center gap-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-blue-50"
              onClick={toggleLike}
              title={isLiked ? "取消点赞" : "点赞"}
            >
              <ThumbsUp className={cn("h-3 w-3", isLiked ? "text-blue-500 fill-blue-500" : "")} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-blue-50 relative"
              onClick={handleCopy}
              title="复制"
            >
              {isCopied ? 
                <Check className="h-3 w-3 text-green-500" /> : 
                <Copy className="h-3 w-3" />
              }
              {isCopied && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs bg-black/80 text-white py-1 px-2 rounded shadow-md z-20">
                  已复制
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-blue-50"
              title="回复"
            >
              <Reply className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-blue-50"
              title="更多"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 
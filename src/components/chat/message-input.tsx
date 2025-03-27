import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';

interface MessageInputProps {
  className?: string;
  onSend: (message: string) => void;
  placeholder?: string;
}

export function MessageInput({ className, onSend, placeholder = "输入消息..." }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 处理发送消息
  const handleSendMessage = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      
      // 重置高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // 处理回车键发送
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 动态调整高度
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  };

  // 当消息变化时调整高度
  useEffect(() => {
    adjustHeight();
  }, [message]);

  return (
    <div 
      className={cn(
        "p-4 border-t bg-background sticky bottom-0 z-10 transition-all duration-300",
        isFocused ? "bg-blue-50/30 shadow-md" : "",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        {/* 功能图标区 */}
        <div className="flex items-center gap-2 px-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-100"
            title="附件"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-100"
            title="表情"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-100"
            title="语音"
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 输入区域 */}
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            className={cn(
              "min-h-[48px] max-h-[120px] resize-none transition-all duration-200 border-blue-200 focus:border-blue-400 rounded-2xl",
              isFocused ? "shadow-sm" : ""
            )}
            rows={1}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setIsTyping(e.target.value.trim().length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <Button 
            size="icon" 
            className={cn(
              "shrink-0 transition-all duration-300 h-10 w-10 rounded-full",
              isTyping ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-500"
            )}
            onClick={handleSendMessage}
            disabled={!isTyping}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 
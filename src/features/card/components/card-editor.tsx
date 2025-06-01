import { useRef } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

interface CardEditorProps {
  title: string;
  htmlContent: string;
  onTitleChange: (title: string) => void;
  onHtmlContentChange: (content: string) => void;
  className?: string;
}

export function CardEditor({
  title,
  htmlContent,
  onTitleChange,
  onHtmlContentChange,
  className = '',
}: CardEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={editorRef} className={`flex flex-col h-full ${className} overflow-hidden`}>
      <div className="p-4 border-b bg-background">
        <label htmlFor="cardTitle" className="block text-sm font-medium mb-1">
          卡片标题
        </label>
        <Input
          id="cardTitle"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="输入卡片标题"
          className="w-full"
        />
      </div>
      <div className="flex-grow flex flex-col   p-4 overflow-hidden">
        <label htmlFor="cardHtmlContent" className="block text-sm font-medium mb-1">
          HTML 内容
        </label>
        <Textarea
          id="cardHtmlContent"
          value={htmlContent}
          onChange={(e) => onHtmlContentChange(e.target.value)}
          placeholder="输入或粘贴 HTML 代码"
          className="w-full flex-grow  font-mono text-sm resize-none border rounded-md overflow-y-auto"
        />
      </div>
    </div>
  );
} 
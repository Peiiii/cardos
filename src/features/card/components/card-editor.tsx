import React, { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Editor } from '@/shared/components/editor';
import { TitleSuggestion } from './title-suggestion';

export interface CardEditorProps {
  initialTitle?: string;
  initialHtmlContent?: string;
  lastUpdatedAt?: string;
  isLoading?: boolean;
  onTitleChange?: (title: string) => void;
  onHtmlContentChange?: (content: string) => void;
  showLastUpdated?: boolean;
  className?: string;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  initialTitle = '',
  initialHtmlContent = '',
  lastUpdatedAt,
  isLoading = false,
  onTitleChange,
  onHtmlContentChange,
  showLastUpdated = false,
  className = ''
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [htmlContent, setHtmlContent] = useState(initialHtmlContent);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    setHtmlContent(initialHtmlContent);
  }, [initialHtmlContent]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  const handleTitleSelect = (title: string) => {
    setTitle(title);
    onTitleChange?.(title);
  };  

  const handleHtmlContentChange = (content: string) => {
    setHtmlContent(content);
    onHtmlContentChange?.(content);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex flex-col p-4 border-b">
        <div className="flex flex-col gap-1">
          <Input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="输入卡片标题..."
            className="w-full"
            disabled={isLoading}
          />
          <TitleSuggestion
            htmlContent={htmlContent}
            onSelect={handleTitleSelect}
            maxSuggestions={3}
            currentTitle={title}
          />
        </div>
        {showLastUpdated && lastUpdatedAt && (
          <div className="text-xs text-muted-foreground mt-2">
            最后更新：{new Date(lastUpdatedAt).toLocaleString()}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          initialContent={htmlContent}
          onChange={handleHtmlContentChange}
          disabled={isLoading}
          className="h-full"
        />
      </div>
    </div>
  );
}; 
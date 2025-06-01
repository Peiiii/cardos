import React from 'react';
import { Textarea } from '../ui/textarea';

export interface EditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  className?: string;
}

export const Editor: React.FC<EditorProps> = ({
  initialContent = '',
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-grow flex flex-col p-4 overflow-hidden">
        <label htmlFor="editor" className="block text-sm font-medium mb-1">
          HTML 内容
        </label>
        <Textarea
          id="editor"
          value={initialContent}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入或粘贴 HTML 代码"
          className="w-full flex-grow font-mono text-sm resize-none border rounded-md overflow-y-auto"
          disabled={disabled}
        />
      </div>
    </div>
  );
}; 
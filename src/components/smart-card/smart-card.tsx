import { useState } from 'react';
import { cn } from '../../lib/utils';

// SmartCard类型定义
export interface SmartCardProps {
  id: string;
  title: string;
  content: string;
  html?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * SmartCard组件 - 展示AI生成的卡片内容
 */
export function SmartCard({
  title,
  content,
  html,
  tags = [],
  createdAt,
  updatedAt,
  className,
  onEdit,
  onDelete
}: SmartCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className={cn(
        "rounded-lg shadow-md overflow-hidden", 
        "border border-zinc-200 dark:border-zinc-800", // 避免使用border-border
        "bg-white dark:bg-zinc-950", // 避免使用bg-background
        isExpanded ? "col-span-2 row-span-2" : "",
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">{title}</h3> {/* 避免使用text-foreground */}
          <div className="flex space-x-2">
            {onEdit && (
              <button 
                onClick={onEdit}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                <span className="sr-only">编辑</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                </svg>
              </button>
            )}
            {onDelete && (
              <button 
                onClick={onDelete}
                className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
              >
                <span className="sr-only">删除</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            )}
            <button 
              onClick={toggleExpand}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              <span className="sr-only">{isExpanded ? "收起" : "展开"}</span>
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20"></polyline>
                  <polyline points="20 10 14 10 14 4"></polyline>
                  <line x1="14" y1="10" x2="21" y2="3"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* 卡片内容 */}
        <div className={cn("mt-2", isExpanded ? "" : "line-clamp-3")}>
          {html ? (
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          ) : (
            <p className="text-zinc-700 dark:text-zinc-300">{content}</p>
          )}
        </div>
        
        {/* 标签和日期 */}
        <div className="mt-4 flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span 
                key={i} 
                className="px-2 py-1 rounded-full text-xs bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            {updatedAt ? `更新于 ${formatDate(updatedAt)}` : `创建于 ${formatDate(createdAt)}`}
          </div>
        </div>
      </div>
    </div>
  );
}
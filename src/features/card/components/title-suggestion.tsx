import React, { useEffect, useState } from 'react';
import { titleSuggestionService } from '../services/title-suggestion.service';
import { cn } from '@/shared/lib/utils';

interface TitleSuggestionProps {
  htmlContent: string;
  onSelect: (title: string) => void;
  maxSuggestions?: number;
  className?: string;
  currentTitle?: string;
}

export const TitleSuggestion: React.FC<TitleSuggestionProps> = ({
  htmlContent,
  onSelect,
  maxSuggestions = 3,
  className,
  currentTitle = ''
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!htmlContent) return;
      
      setLoading(true);
      try {
        const results = await titleSuggestionService.getSuggestions(htmlContent, maxSuggestions);
        setSuggestions(results);
        
        if (results.length > 0 && !currentTitle.trim()) {
          onSelect(results[0]);
        }
      } catch (error) {
        console.error('获取标题建议失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [htmlContent, maxSuggestions, onSelect, currentTitle]);

  if (loading || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn("mt-1", className)}>
      <div className="text-xs text-muted-foreground mb-1">推荐标题：</div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="px-2 py-0.5 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}; 
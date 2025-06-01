import { TitleSuggestionStrategy } from "@/features/card/types/title-suggestion";

/**
 * 基于内容分析的标题推荐策略
 * 从HTML内容中提取有意义的文本作为标题
 */
export class ContentAnalysisStrategy implements TitleSuggestionStrategy {
  name = 'content-analysis';

  async suggest(htmlContent: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    // 创建临时DOM解析HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // 获取所有文本内容
    const textContent = doc.body.textContent || '';
    
    // 提取第一段有意义的文本
    const firstParagraph = textContent
      .split('\n')
      .map(line => line.trim())
      .find(line => line.length > 10 && line.length < 100);
      
    if (firstParagraph) {
      // 如果段落太长，截取合适长度
      const title = firstParagraph.length > 50 
        ? firstParagraph.substring(0, 50) + '...'
        : firstParagraph;
      suggestions.push(title);
    }
    
    // 从h1-h3标签中提取标题
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3'))
      .map(h => h.textContent?.trim())
      .filter((text): text is string => !!text && text.length > 0);
      
    suggestions.push(...headings);
    
    return suggestions;
  }
} 
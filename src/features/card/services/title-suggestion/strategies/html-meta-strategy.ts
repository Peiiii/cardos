import { TitleSuggestionStrategy } from "@/features/card/types/title-suggestion";

/**
 * 基于HTML元数据的标题推荐策略
 * 从HTML的title标签和meta标签中提取标题
 */
export class HtmlMetaStrategy implements TitleSuggestionStrategy {
  name = 'html-meta';

  async suggest(htmlContent: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    // 创建临时DOM解析HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // 从title标签获取标题
    const title = doc.querySelector('title')?.textContent?.trim();
    if (title) {
      suggestions.push(title);
    }
    
    // 从meta标签获取标题
    const metaTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim();
    if (metaTitle && !suggestions.includes(metaTitle)) {
      suggestions.push(metaTitle);
    }
    
    return suggestions;
  }
} 
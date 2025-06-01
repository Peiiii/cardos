/**
 * 标题推荐策略接口
 */
export interface TitleSuggestionStrategy {
  /**
   * 策略名称
   */
  name: string;
  
  /**
   * 获取标题推荐
   * @param htmlContent HTML内容
   * @returns 标题推荐列表
   */
  suggest(htmlContent: string): Promise<string[]>;
} 
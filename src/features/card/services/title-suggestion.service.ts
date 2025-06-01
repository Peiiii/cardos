import { TitleSuggestionStrategy } from "../types/title-suggestion";

/**
 * 标题推荐服务
 * 支持多种推荐策略，可以动态添加和移除策略
 */
export class TitleSuggestionService {
  private strategies: TitleSuggestionStrategy[] = [];

  /**
   * 注册推荐策略
   */
  registerStrategy(strategy: TitleSuggestionStrategy) {
    this.strategies.push(strategy);
  }

  /**
   * 移除推荐策略
   */
  unregisterStrategy(strategyName: string) {
    this.strategies = this.strategies.filter((s) => s.name !== strategyName);
  }

  /**
   * 获取标题推荐
   * @param htmlContent HTML内容
   * @param maxSuggestions 最大推荐数量
   * @returns 标题推荐列表
   */
  async getSuggestions(
    htmlContent: string,
    maxSuggestions: number = 3
  ): Promise<string[]> {
    const suggestions = new Set<string>();

    // 并行执行所有策略
    const results = await Promise.all(
      this.strategies.map((strategy) => strategy.suggest(htmlContent))
    );

    // 合并所有策略的结果
    results.forEach((result) => {
      result.forEach((suggestion) => {
        if (suggestions.size < maxSuggestions) {
          suggestions.add(suggestion);
        }
      });
    });

    return Array.from(suggestions);
  }
}

// 创建单例实例
export const titleSuggestionService = new TitleSuggestionService();

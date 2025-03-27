/**
 * SmartCard类型定义
 * 表示AI生成的HTML卡片，存储在数据库中
 */

/**
 * SmartCard类型
 */
export interface SmartCard {
  /**
   * 卡片唯一ID
   */
  id: string;
  
  /**
   * 卡片标题
   */
  title: string;
  
  /**
   * 卡片HTML内容
   */
  htmlContent: string;
  
  /**
   * 关联的对话ID
   */
  conversationId?: string;
  
  /**
   * 创建时间
   */
  createdAt: number;
  
  /**
   * 更新时间
   */
  updatedAt: number;
  
  /**
   * 卡片元数据
   */
  metadata: SmartCardMetadata;
}

/**
 * SmartCard元数据
 */
export interface SmartCardMetadata {
  /**
   * 标签列表
   */
  tags?: string[];
  
  /**
   * 收藏状态
   */
  isFavorite?: boolean;
  
  /**
   * 卡片作者
   */
  author?: string;
  
  /**
   * 原始提示/指令
   */
  originalPrompt?: string;
  
  /**
   * 生成的时间戳
   */
  generatedAt?: number;
  
  /**
   * 分享URL
   */
  shareUrl?: string;
  
  /**
   * 关联卡片ID列表
   */
  relatedCardIds?: string[];
  
  /**
   * 卡片样式相关设置
   */
  style?: SmartCardStyle;
  
  /**
   * 自定义属性
   */
  [key: string]: unknown;
}

/**
 * SmartCard样式设置
 */
export interface SmartCardStyle {
  /**
   * 宽度
   */
  width?: string;
  
  /**
   * 高度
   */
  height?: string;
  
  /**
   * 背景色
   */
  backgroundColor?: string;
  
  /**
   * 文本颜色
   */
  textColor?: string;
  
  /**
   * 自定义CSS类名
   */
  className?: string;
  
  /**
   * 其他样式设置
   */
  [key: string]: unknown;
}

/**
 * SmartCard创建参数
 */
export type SmartCardCreateParams = Omit<SmartCard, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * SmartCard更新参数
 */
export type SmartCardUpdateParams = Partial<Omit<SmartCard, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * SmartCard查询参数
 */
export interface SmartCardQueryParams {
  /**
   * 标题关键词
   */
  title?: string;
  
  /**
   * 内容关键词
   */
  content?: string;
  
  /**
   * 会话ID
   */
  conversationId?: string;
  
  /**
   * 标签列表
   */
  tags?: string[];
  
  /**
   * 是否仅包含收藏
   */
  onlyFavorites?: boolean;
  
  /**
   * 排序字段
   */
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  
  /**
   * 排序方向
   */
  sortDirection?: 'asc' | 'desc';
  
  /**
   * 分页限制
   */
  limit?: number;
  
  /**
   * 分页偏移
   */
  offset?: number;
} 
/**
 * AI 模型接口类型定义
 */

/**
 * 生成选项接口
 */
export interface GenerationOptions {
  prompt: string;                // 提示词
  maxTokens?: number;            // 最大令牌数
  temperature?: number;          // 温度参数，控制创造性
  topP?: number;                 // 控制采样范围
  frequencyPenalty?: number;     // 频率惩罚
  presencePenalty?: number;      // 存在惩罚
  stop?: string[];               // 停止序列
}

/**
 * 生成结果接口
 */
export interface GenerationResult {
  text: string;                  // 生成的文本
  usage?: {                      // 使用情况
    promptTokens: number;        // 提示词令牌数
    completionTokens: number;    // 补全令牌数
    totalTokens: number;         // 总令牌数
  };
}

/**
 * 流式生成结果接口
 */
export interface StreamGenerationResult {
  text: string;                  // 当前片段的文本
  isComplete: boolean;           // 是否完成生成
}

/**
 * 大语言模型适配器接口
 */
export interface LLMAdapter {
  /** 生成文本 */
  generateText(options: GenerationOptions): Promise<GenerationResult>;
  
  /** 流式生成文本 */
  generateStream?(options: GenerationOptions): AsyncGenerator<string, void, unknown>;
}

/**
 * 通义千问适配器选项
 */
export interface QwenAdapterOptions {
  apiKey: string;                // API 密钥
  endpoint: string;              // 端点 URL
  model: string;                 // 模型标识符
}

/**
 * 图片生成选项
 */
export interface ImageGenerationOptions {
  prompt: string;                // 图片描述提示词
  negativePrompt?: string;       // 负面提示词
  size?: string;                 // 图片尺寸，例如 "1024x1024"
  style?: string;                // 图片风格
  count?: number;                // 生成图片数量
  seed?: number;                 // 随机种子
}

/**
 * 图片生成结果
 */
export interface ImageGenerationResult {
  images: string[];              // 图片 URL 或 Base64 字符串数组
  usage?: {                      // 使用情况
    promptTokens: number;        // 提示词令牌数
    totalTokens: number;         // 总令牌数
  };
}

/**
 * 图像模型适配器接口
 */
export interface ImageModelAdapter {
  /** 生成图像 */
  generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult>;
}

/**
 * 内容分析选项
 */
export interface ContentAnalysisOptions {
  content: string;               // 要分析的内容
  type?: string;                 // 内容类型
  tasks?: string[];              // 分析任务类型
}

/**
 * 内容分析结果
 */
export interface ContentAnalysisResult {
  categories?: string[];         // 内容分类
  summary?: string;              // 内容摘要
  keywords?: string[];           // 关键词
  sentiment?: {                  // 情感分析
    positive: number;            // 积极度
    negative: number;            // 消极度
    neutral: number;             // 中性度
  };
  structure?: {                  // 内容结构
    headings: string[];          // 标题列表
    paragraphs: number;          // 段落数量
  };
  customResults?: Record<string, unknown>; // 自定义分析结果
}

/**
 * 内容分析适配器接口
 */
export interface ContentAnalysisAdapter {
  /** 分析内容 */
  analyzeContent(options: ContentAnalysisOptions): Promise<ContentAnalysisResult>;
}

/**
 * 模型配置
 */
export interface ModelConfig {
  provider: string;              // 提供商
  apiKey: string;                // API 密钥
  endpoint?: string;             // API 端点
  model: string;                 // 模型名称
  extraHeaders?: Record<string, string>; // 额外的请求头
  timeout?: number;              // 超时时间（毫秒）
  retries?: number;              // 重试次数
}

/**
 * 适配器工厂接口
 */
export interface LLMAdapterFactory {
  createAdapter(config: ModelConfig): LLMAdapter;
  createImageAdapter?(config: ModelConfig): ImageModelAdapter;
  createAnalysisAdapter?(config: ModelConfig): ContentAnalysisAdapter;
} 
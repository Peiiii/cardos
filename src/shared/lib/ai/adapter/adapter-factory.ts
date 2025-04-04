/**
 * 模型适配器工厂实现
 */
import { 
  LLMAdapter, 
  ModelConfig, 
  ImageModelAdapter, 
  ContentAnalysisAdapter 
} from '../types';
import { QwenAdapter } from './qwen-adapter';
import { getEnv } from '../../../utils/env';


/**
 * 模型适配器工厂类
 * 负责根据配置创建适当的模型适配器
 */
export class ModelAdapterFactory {
  /**
   * 创建大语言模型适配器
   * @param config 模型配置
   * @returns LLMAdapter 模型适配器实例
   */
  static createAdapter(config: ModelConfig): LLMAdapter {
    switch (config.provider.toLowerCase()) {
      case 'qwen':
      case 'dashscope':
        return new QwenAdapter({
          apiKey: config.apiKey,
          endpoint: config.endpoint || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
          model: config.model || 'qwen-max-latest',
        });
      
      case 'azure':
        // 用于将来扩展，实现 Azure 适配器
        throw new Error('Azure adapter not implemented yet');
      
      case 'custom':
        // 用于将来扩展，实现自定义适配器
        throw new Error('Custom adapter not implemented yet');
      
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  /**
   * 创建图像模型适配器
   * @param config 模型配置
   * @returns ImageModelAdapter 图像模型适配器实例
   */
  static createImageAdapter(config: ModelConfig): ImageModelAdapter {
    switch (config.provider.toLowerCase()) {
      case 'qwen':
      case 'dashscope':
        // 这里将来实现通义千问图像模型适配器
        throw new Error('Qwen image adapter not implemented yet');
      
      default:
        throw new Error(`Unsupported image provider: ${config.provider}`);
    }
  }

  /**
   * 创建内容分析适配器
   * @param config 模型配置
   * @returns ContentAnalysisAdapter 内容分析适配器实例
   */
  static createAnalysisAdapter(config: ModelConfig): ContentAnalysisAdapter {
    switch (config.provider.toLowerCase()) {
      case 'qwen':
      case 'dashscope':
        // 这里将来实现通义千问内容分析适配器
        throw new Error('Qwen analysis adapter not implemented yet');
      
      default:
        throw new Error(`Unsupported analysis provider: ${config.provider}`);
    }
  }
}

// 导出默认配置
export const defaultModelConfig: ModelConfig = {
  provider: getEnv('LLM_PROVIDER', 'qwen'),
  apiKey: getEnv('QWEN_API_KEY', ''),
  endpoint: getEnv('QWEN_API_ENDPOINT', 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'),
  model: getEnv('QWEN_MODEL', 'qwen-max-latest'),
  timeout: 30000,  // 30 秒超时
  retries: 3       // 3 次重试
};

/**
 * 创建默认适配器实例的便捷函数
 * @returns LLMAdapter 默认模型适配器实例
 */
export function createDefaultAdapter(): LLMAdapter {
  return ModelAdapterFactory.createAdapter(defaultModelConfig);
} 
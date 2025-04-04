/**
 * 通义千问模型适配器实现
 */
import { 
  LLMAdapter, 
  GenerationOptions, 
  GenerationResult,
  QwenAdapterOptions 
} from '../types';

/**
 * 通义千问模型适配器
 * 实现通义千问 API 的调用
 */
export class QwenAdapter implements LLMAdapter {
  private apiKey: string;
  private endpoint: string;
  private model: string;
  
  /**
   * 创建通义千问适配器
   * @param options 适配器选项
   */
  constructor(options: QwenAdapterOptions) {
    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint;
    this.model = options.model;
  }
  
  /**
   * 生成文本
   * @param options 生成选项
   * @returns Promise<GenerationResult> 生成结果
   */
  async generateText(options: GenerationOptions): Promise<GenerationResult> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [
              {
                role: 'user',
                content: options.prompt,
              },
            ],
          },
          parameters: {
            max_tokens: options.maxTokens || 1500,
            temperature: options.temperature || 0.7,
            top_p: options.topP || 0.8,
            stop: options.stop,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        text: data.output.text,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('Error generating text with Qwen:', error);
      throw error;
    }
  }
  
  /**
   * 流式生成文本
   * @param options 生成选项
   * @returns AsyncGenerator<string, void, unknown> 流式生成的文本片段
   */
  async *generateStream(options: GenerationOptions): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-DashScope-SSE': 'enable', // 启用流式响应
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            messages: [
              {
                role: 'user',
                content: options.prompt,
              },
            ],
          },
          parameters: {
            max_tokens: options.maxTokens || 1500,
            temperature: options.temperature || 0.7,
            top_p: options.topP || 0.8,
            stop: options.stop,
            incremental_output: true,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('Response body is null');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5).trim();
            if (jsonStr === '[DONE]') break;
            
            try {
              const data = JSON.parse(jsonStr);
              if (data.output && data.output.text) {
                yield data.output.text;
              }
            } catch (e) {
              console.error('Error parsing SSE message:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating stream with Qwen:', error);
      throw error;
    }
  }
  
  /**
   * 获取模型信息
   * @returns 模型信息对象
   */
  getModelInfo() {
    return {
      provider: 'Qwen',
      model: this.model,
      endpoint: this.endpoint,
    };
  }
} 
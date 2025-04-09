import { AIService } from './ai-service';

export interface StreamChunk {
  content: string;
  done: boolean;
}

export class StreamWrapper {
  constructor(private aiService: AIService) {}

  /**
   * 将普通响应转换为模拟的流式响应
   * @param content 用户输入内容
   * @param chunkSize 每个分片的大小（字符数）
   * @param delay 每个分片的延迟（毫秒）
   */
  async *createStreamResponse(
    content: string,
    chunkSize: number = 4,
    delay: number = 50
  ): AsyncGenerator<StreamChunk> {
    try {
      // 1. 获取完整的AI响应
      const fullResponse = await this.aiService.chat(content);
      
      // 2. 将响应分片
      const chunks = this.splitIntoChunks(fullResponse, chunkSize);
      
      // 3. 模拟流式输出
      for (let i = 0; i < chunks.length; i++) {
        await this.sleep(delay);
        yield {
          content: chunks[i],
          done: i === chunks.length - 1
        };
      }
    } catch (error) {
      console.error('Error in stream response:', error);
      throw error;
    }
  }

  /**
   * 将文本分割成小块
   */
  private splitIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    let index = 0;
    
    while (index < text.length) {
      // 查找最近的标点符号或空格
      let endIndex = Math.min(index + chunkSize, text.length);
      if (endIndex < text.length) {
        const punctuationIndex = this.findNearestBreakPoint(
          text,
          index + 1,
          endIndex
        );
        if (punctuationIndex > index) {
          endIndex = punctuationIndex;
        }
      }
      
      chunks.push(text.slice(index, endIndex));
      index = endIndex;
    }
    
    return chunks;
  }

  /**
   * 查找最近的断句点（标点符号或空格）
   */
  private findNearestBreakPoint(
    text: string,
    start: number,
    end: number
  ): number {
    const punctuations = new Set(['。', '，', '！', '？', '；', '：', '.', ',', '!', '?', ';', ':', ' ']);
    for (let i = end; i > start; i--) {
      if (punctuations.has(text[i])) {
        return i + 1;
      }
    }
    return -1;
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 
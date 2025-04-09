import { MessageService } from './message-service';
import { AIService } from '../features/ai/services/ai-service';
import { StreamWrapper } from '../features/ai/services/stream-wrapper';
import { Message } from '../types/message';

export class ChatService {
  private streamWrapper: StreamWrapper;

  constructor(
    private messageService: MessageService,
    private aiService: AIService
  ) {
    this.streamWrapper = new StreamWrapper(this.aiService);
  }

  /**
   * 发送消息并获取AI响应
   * @param content 用户消息内容
   * @param conversationId 会话ID
   * @param onProgress 进度回调函数
   */
  async sendMessage(
    content: string,
    conversationId: string,
    onProgress?: (message: Message) => void
  ): Promise<void> {
    // 1. 创建用户消息
    await this.messageService.create({
      content,
      conversationId,
      isUser: true,
      timestamp: Date.now()
    });

    // 2. 创建AI响应消息占位
    const aiMessage = await this.messageService.create({
      content: '',
      conversationId,
      isUser: false,
      timestamp: Date.now()
    });

    try {
      // 3. 使用StreamWrapper获取模拟流式响应
      let fullContent = '';
      const stream = this.streamWrapper.createStreamResponse(content);
      
      for await (const chunk of stream) {
        fullContent += chunk.content;
        
        // 更新消息内容
        const updatedMessage = await this.messageService.update(
          aiMessage.id,
          { content: fullContent }
        );
        
        // 调用进度回调
        onProgress?.(updatedMessage);
      }
    } catch (error) {
      console.error('Error in chat service:', error);
      // 更新消息状态为错误
      await this.messageService.update(aiMessage.id, {
        content: '抱歉，处理您的消息时出现错误。'
      });
      throw error;
    }
  }
} 
import { AISystem, Plugin } from "@agentkai/browser";
import { createTool } from "./utils";
import { cardService } from "@/features/card/services/card";
import { kernel } from "@/shared/core";

// 定义事件类型
export const CARD_EVENTS = {
  PREVIEW: 'card:preview',
  CREATED: 'card:created',
  UPDATED: 'card:updated',
} as const;

export interface CardPreviewData {
  title: string;
  content: string;
  isPreview: boolean;
}

export class CreateEditCardPlugin implements Plugin {
  constructor(readonly aiSystem: AISystem) {}

  getName() {
    return "edit-card-plugin";
  }

  private emitPreview(data: CardPreviewData) {
    kernel.eventBus.emit(CARD_EVENTS.PREVIEW, data);
  }

  getTools() {
    return [
      createTool({
        name: "create-card",
        description: "创建一个新的卡片，包含标题和HTML格式的内容。创建过程中会实时预览。",
        parameters: {
          type: "object",
          properties: {
            title: { 
              type: "string",
              description: "卡片标题，简短且具有描述性，建议不超过50个字符"
            },
            content: { 
              type: "string",
              description: "卡片的HTML格式内容，支持所有标准HTML标签和样式。可以包含文本、列表、表格、图片等元素。例如：'<div><h1>标题</h1><p>段落内容</p><ul><li>列表项</li></ul></div>'"
            },
          },
          required: ["title", "content"],
        },
        handler: async (args: { title: string; content: string }) => {
          console.log("[tool][create-card] args", args)
          try {
            // 1. 发送预览事件
            this.emitPreview({
              title: args.title,
              content: args.content,
              isPreview: true
            });

            // 2. 创建卡片
            const card = await cardService.createCard({
              title: args.title,
              htmlContent: args.content,
              metadata: {
                tags: [],
                isFavorite: false,
                author: 'AI助手',
                generatedAt: Date.now()
              }
            });

            // 3. 发送创建成功事件
            kernel.eventBus.emit(CARD_EVENTS.CREATED, card);

            return card.id;
          } catch (error: unknown) {
            console.error('创建卡片失败:', error);
            throw new Error(`创建卡片失败: ${error instanceof Error ? error.message : '未知错误'}`);
          }
        },
      }),
      createTool({
        name: "edit-card",
        description: "编辑现有卡片的标题和HTML内容。编辑过程中会实时预览。",
        parameters: {
          type: "object",
          properties: {
            cardId: { 
              type: "string",
              description: "要编辑的卡片ID"
            },
            title: {
              type: "string",
              description: "新的卡片标题，简短且具有描述性，建议不超过50个字符"
            },
            content: {
              type: "string",
              description: "新的HTML格式内容，支持所有标准HTML标签和样式。可以包含文本、列表、表格、图片等元素。例如：'<div><h1>标题</h1><p>段落内容</p><ul><li>列表项</li></ul></div>'"
            },
          },
          required: ["cardId", "title", "content"],
        },
        handler: async (args: { cardId: string; title: string; content: string }) => {
          try {
            // 1. 发送预览事件
            this.emitPreview({
              title: args.title,
              content: args.content,
              isPreview: true
            });

            // 2. 更新卡片
            const card = await cardService.updateCard(args.cardId, {
              title: args.title,
              htmlContent: args.content,
              metadata: {
                lastModified: Date.now(),
                lastModifiedBy: 'AI助手'
              }
            });

            // 3. 发送更新成功事件
            kernel.eventBus.emit(CARD_EVENTS.UPDATED, card);

            return args.cardId;
          } catch (error: unknown) {
            console.error('更新卡片失败:', error);
            throw new Error(`更新卡片失败: ${error instanceof Error ? error.message : '未知错误'}`);
          }
        },
      }),
    ];
  }
}

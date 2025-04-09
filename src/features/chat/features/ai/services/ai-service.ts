import { CreateEditCardPlugin } from "@/features/chat/features/ai/plugins/create-edit-card-plugin";
import {
  AgentKaiConfig,
  AISystem,
  BasicToolsPlugin,
  GoalsPlugin,
  MemoryPlugin,
  OpenAIModel,
} from "@agentkai/browser";

const config: AgentKaiConfig = {
  modelConfig: {
    model: import.meta.env.VITE_AI_MODEL_NAME || '',
    apiKey: import.meta.env.VITE_AI_API_KEY || '',
    modelName: import.meta.env.VITE_AI_MODEL_NAME || '',
    maxTokens: 1000,
    temperature: 0.5,
    apiBaseUrl: import.meta.env.VITE_AI_BASE_URL || '',
    embeddingModel: import.meta.env.VITE_AI_EMBEDDING_MODEL || '',
    embeddingBaseUrl: import.meta.env.VITE_AI_EMBEDDING_BASE_URL || '',
    embeddingDimensions: 1024,
  },
  memoryConfig: {
    vectorDimensions: 1024,
    maxMemories: 1000,
    similarityThreshold: 0.3,
    shortTermCapacity: 100,
    importanceThreshold: 0.5,
  },
  appConfig: {
    name: "cardos",
    version: "1.0.0",
    defaultLanguage: "zh-CN",
    dataPath: "data",
  },
};

// AI服务接口
export interface AIService {
  chat(content: string): Promise<string>;
}

// AI服务实现
class RealAIService implements AIService {
  private aiSystem: AISystem | null = null;

  async initialize() {
    if (!this.aiSystem) {
      const model = new OpenAIModel(config.modelConfig);
      const aiSystem = new AISystem(config, model);
      
      // 创建并添加插件
      const goalsPlugin = new GoalsPlugin(aiSystem);
      const memoryPlugin = new MemoryPlugin(aiSystem.getMemorySystem());
      const basicToolsPlugin = new BasicToolsPlugin(aiSystem);

      const pluginManager = aiSystem["pluginManager"];
      pluginManager.addPlugin(goalsPlugin);
      pluginManager.addPlugin(memoryPlugin);
      pluginManager.addPlugin(basicToolsPlugin);
      pluginManager.addPlugin(new CreateEditCardPlugin(aiSystem));
      await aiSystem.initialize();
      this.aiSystem = aiSystem;
    }
  }

  async chat(content: string): Promise<string> {
    if (!this.aiSystem) {
      await this.initialize();
    }

    try {
      const response = await this.aiSystem!.processInput(content);
      return response.output || '抱歉，AI 没有生成有效响应';
    } catch (error) {
      console.error('AI处理错误:', error);
      throw error;
    }
  }
}

// 创建服务实例
export const aiService = new RealAIService();
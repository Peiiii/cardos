# CardOS 实现方案

## 1. 项目架构

### 1.1 目录结构
```
cardos/
├── public/                 # 静态资源
│   ├── fonts/              # 字体文件
│   └── images/             # 图片资源
├── src/
│   ├── assets/             # 项目资源文件
│   ├── components/         # 组件
│   │   ├── ui/             # 基础UI组件
│   │   ├── cards/          # 卡片相关组件
│   │   ├── editor/         # 编辑器组件
│   │   └── shared/         # 共享组件
│   ├── hooks/              # 自定义Hooks
│   ├── lib/                # 工具库
│   │   ├── ai/             # AI模型适配器
│   │   ├── storage/        # 存储适配器
│   │   └── utils/          # 通用工具函数
│   ├── pages/              # 页面组件
│   ├── routes/             # 路由配置
│   ├── services/           # 业务服务层
│   │   ├── cardService.ts  # 卡片服务
│   │   ├── aiService.ts    # AI服务
│   │   └── userService.ts  # 用户服务
│   ├── store/              # 状态管理
│   ├── styles/             # 样式文件
│   └── types/              # 类型定义
├── scripts/                # 构建脚本
└── tests/                  # 测试文件
```

### 1.2 技术栈选择
- **框架**: React 18 + Vite
- **路由**: React Router DOM
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: Zustand
- **编辑器**: Tiptap
- **AI集成**: 阿里云通义千问 API
- **存储**: IndexedDB + 可选云存储
- **构建工具**: Vite
- **测试**: Vitest + React Testing Library
- **类型检查**: TypeScript
- **代码规范**: ESLint + Prettier

## 2. 核心组件设计

### 2.1 视觉系统实现

#### 设计系统
```typescript
// src/styles/theme.ts
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ...其他色阶
    600: '#0284c7',
    // ...其他色阶
  },
  // ...其他颜色
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  // ...其他间距
};

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    // ...其他字号
  },
  // ...其他排版设置
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  // ...其他阴影
};

// 导出主题配置
export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  // ...其他主题配置
};
```

#### 组件设计
```typescript
// src/components/ui/Card.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        primary: 'border-primary-200 bg-primary-50',
        secondary: 'border-secondary-200 bg-secondary-50',
        destructive: 'border-destructive-200 bg-destructive-50',
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

export function Card({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// 还有 CardHeader, CardTitle, CardDescription, CardContent, CardFooter 等组件
```

### 2.2 卡片系统实现

#### 卡片数据模型
```typescript
// src/types/card.ts
export interface Card {
  id: string;
  type: CardType;
  title: string;
  content: CardContent;
  tags: string[];
  style: CardStyle;
  metadata: CardMetadata;
  createdAt: string;
  updatedAt: string;
}

export type CardType = 
  | 'text' 
  | 'image' 
  | 'code' 
  | 'math' 
  | 'table' 
  | 'list'
  | 'embed'
  | 'custom';

export interface CardContent {
  text?: string;
  html?: string;
  imageUrl?: string;
  code?: {
    language: string;
    value: string;
  };
  // ...其他内容类型
}

export interface CardStyle {
  theme: string;
  customColors?: {
    background?: string;
    text?: string;
    border?: string;
  };
  layout?: 'default' | 'compact' | 'expanded';
  animation?: 'none' | 'fade' | 'slide' | 'zoom';
  // ...其他样式属性
}

export interface CardMetadata {
  author?: string;
  source?: string;
  isPublic: boolean;
  shareUrl?: string;
  version: number;
  // ...其他元数据
}
```

#### 卡片存储实现
```typescript
// src/lib/storage/indexedDB.ts
import { Card } from '@/types/card';

export class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;
  private stores: string[];

  constructor(dbName: string, version: number = 1, stores: string[] = ['cards']) {
    this.dbName = dbName;
    this.version = version;
    this.stores = stores;
  }
  
  async init(): Promise<void> {
    // 初始化数据库连接
  }
  
  async get<T>(storeName: string, id: string): Promise<T | null> {
    // 获取单个项
  }
  
  async getAll<T>(storeName: string): Promise<T[]> {
    // 获取所有项
  }
  
  async put<T>(storeName: string, item: T): Promise<T> {
    // 添加或更新项
  }
  
  async delete(storeName: string, id: string): Promise<void> {
    // 删除项
  }
  
  // 其他数据库操作方法
}

export const indexedDBStorage = new IndexedDBStorage('cardos-storage');
```

#### 卡片服务实现
```typescript
// src/services/cardService.ts
import { Card, CardType, CardQueryOptions } from '@/types/card';
import { v4 as uuidv4 } from 'uuid';
import { indexedDBStorage } from '@/lib/storage/indexedDB';

export class CardService {
  private storage;
  
  constructor() {
    this.storage = indexedDBStorage;
  }
  
  async init() {
    await this.storage.init();
  }
  
  async createCard(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    const now = new Date().toISOString();
    const newCard: Card = {
      id: uuidv4(),
      ...card,
      createdAt: now,
      updatedAt: now,
    };
    
    await this.storage.put('cards', newCard);
    return newCard;
  }
  
  async getCard(id: string): Promise<Card | null> {
    return this.storage.get('cards', id);
  }
  
  async updateCard(id: string, updates: Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Card> {
    const card = await this.getCard(id);
    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }
    
    const updatedCard: Card = {
      ...card,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await this.storage.put('cards', updatedCard);
    return updatedCard;
  }
  
  async deleteCard(id: string): Promise<void> {
    await this.storage.delete('cards', id);
  }
  
  async getAllCards(): Promise<Card[]> {
    return this.storage.getAll('cards');
  }
  
  async searchCards(options: CardQueryOptions): Promise<Card[]> {
    const allCards = await this.getAllCards();
    
    // 实现搜索逻辑，根据 options 过滤卡片
    return allCards.filter(card => {
      let matches = true;
      
      if (options.type && card.type !== options.type) {
        matches = false;
      }
      
      if (options.tags && options.tags.length > 0) {
        if (!options.tags.some(tag => card.tags.includes(tag))) {
          matches = false;
        }
      }
      
      if (options.query) {
        const query = options.query.toLowerCase();
        const matchesQuery = 
          card.title.toLowerCase().includes(query) || 
          (card.content.text?.toLowerCase().includes(query));
          
        if (!matchesQuery) {
          matches = false;
        }
      }
      
      return matches;
    });
  }
}

export const cardService = new CardService();
```

### 2.3 AI 生成系统实现

#### 模型适配器
```typescript
// src/lib/ai/types.ts
export interface GenerationOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface GenerationResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMAdapter {
  generateText(options: GenerationOptions): Promise<GenerationResult>;
  generateStream?(options: GenerationOptions): AsyncGenerator<string, void, unknown>;
}
```

```typescript
// src/lib/ai/qwenAdapter.ts
import { LLMAdapter, GenerationOptions, GenerationResult } from './types';

export interface QwenAdapterOptions {
  apiKey: string;
  endpoint: string;
  model: string;
}

export class QwenAdapter implements LLMAdapter {
  private apiKey: string;
  private endpoint: string;
  private model: string;
  
  constructor(options: QwenAdapterOptions) {
    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint;
    this.model = options.model;
  }
  
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
  
  async *generateStream(options: GenerationOptions): AsyncGenerator<string, void, unknown> {
    // 流式生成实现
  }
}
```

#### AI 服务实现
```typescript
// src/services/aiService.ts
import { Card, CardType, CardContent, CardStyle } from '@/types/card';
import { LLMAdapter, GenerationOptions } from '@/lib/ai/types';
import { QwenAdapter } from '@/lib/ai/qwenAdapter';
import { cardService } from './cardService';
import { getEnv } from '@/lib/utils/env';

export interface CardGenerationOptions {
  prompt: string;
  type?: CardType;
  style?: Partial<CardStyle>;
  tags?: string[];
}

export class AIService {
  private llm: LLMAdapter;
  
  constructor() {
    this.llm = new QwenAdapter({
      apiKey: getEnv('QWEN_API_KEY', ''),
      endpoint: getEnv('QWEN_API_ENDPOINT', 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'),
      model: getEnv('QWEN_MODEL', 'qwen-max-latest'),
    });
  }
  
  async generateCard(options: CardGenerationOptions): Promise<Card> {
    const { prompt, type = 'text', style = {}, tags = [] } = options;
    
    const systemPrompt = `
你是一个卡片内容生成专家。请根据用户的提示，生成一张卡片的内容。
卡片类型: ${type}
内容要求:
- 简洁明了，信息密度高
- 视觉效果精美，吸引人
- 内容准确有价值
- 适合在卡片中展示

请以 JSON 格式返回结果，包含 title 和 content 字段。
格式：
{
  "title": "卡片标题",
  "content": "卡片内容"
}
`;
    
    const userPrompt = `根据以下提示生成一张卡片：${prompt}`;
    
    try {
      const result = await this.llm.generateText({
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      // 从结果中提取 JSON
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse generated card content');
      }
      
      const cardData = JSON.parse(jsonMatch[0]);
      
      // 创建卡片内容
      const cardContent: CardContent = {};
      
      if (type === 'text') {
        cardContent.text = cardData.content;
        cardContent.html = `<p>${cardData.content.replace(/\n/g, '</p><p>')}</p>`;
      } else if (type === 'code') {
        cardContent.text = cardData.content;
        // 处理代码卡片
      } else if (type === 'image') {
        // 处理图片卡片
      }
      
      // 创建并保存卡片
      const card = await cardService.createCard({
        type,
        title: cardData.title,
        content: cardContent,
        tags,
        style: {
          theme: 'default',
          ...style,
        },
        metadata: {
          isPublic: false,
          version: 1,
        },
      });
      
      return card;
    } catch (error) {
      console.error('Error generating card:', error);
      throw error;
    }
  }
  
  async improveCardStyle(card: Card): Promise<Card> {
    // 实现卡片样式优化逻辑
    return card;
  }
  
  async generateCardFromTemplate(template: string, data: Record<string, any>): Promise<Card> {
    // 实现从模板生成卡片的逻辑
    return {} as Card;
  }
}

export const aiService = new AIService();
```

### 2.4 状态管理实现

```typescript
// src/store/cardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card } from '@/types/card';
import { cardService } from '@/services/cardService';

interface CardState {
  cards: Card[];
  selectedCardId: string | null;
  isLoading: boolean;
  error: string | null;
  // 操作
  loadCards: () => Promise<void>;
  addCard: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Card>;
  updateCard: (id: string, updates: Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  selectCard: (id: string | null) => void;
  searchCards: (query: string) => Promise<void>;
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      cards: [],
      selectedCardId: null,
      isLoading: false,
      error: null,
      
      loadCards: async () => {
        set({ isLoading: true, error: null });
        try {
          await cardService.init();
          const cards = await cardService.getAllCards();
          set({ cards, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load cards', 
            isLoading: false 
          });
        }
      },
      
      addCard: async (cardData) => {
        set({ isLoading: true, error: null });
        try {
          const newCard = await cardService.createCard(cardData);
          set(state => ({ 
            cards: [...state.cards, newCard], 
            isLoading: false 
          }));
          return newCard;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add card', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateCard: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedCard = await cardService.updateCard(id, updates);
          set(state => ({ 
            cards: state.cards.map(card => card.id === id ? updatedCard : card), 
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update card', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      deleteCard: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await cardService.deleteCard(id);
          set(state => ({ 
            cards: state.cards.filter(card => card.id !== id),
            selectedCardId: state.selectedCardId === id ? null : state.selectedCardId,
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete card', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      selectCard: (id) => {
        set({ selectedCardId: id });
      },
      
      searchCards: async (query) => {
        set({ isLoading: true, error: null });
        try {
          if (!query.trim()) {
            const cards = await cardService.getAllCards();
            set({ cards, isLoading: false });
            return;
          }
          
          const results = await cardService.searchCards({ query });
          set({ cards: results, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to search cards', 
            isLoading: false 
          });
          throw error;
        }
      },
    }),
    {
      name: 'cardos-storage',
      partialize: (state) => ({ selectedCardId: state.selectedCardId }),
    }
  )
);
```

### 2.5 UI 组件实现示例

```tsx
// src/components/cards/CardItem.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Card as CardType } from '@/types/card';
import { cn } from '@/lib/utils';

interface CardItemProps {
  card: CardType;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onEdit,
  onDelete,
  onClick,
  className,
}) => {
  const { title, content, style, tags } = card;
  
  // 计算卡片样式
  const cardStyle = {
    backgroundColor: style.customColors?.background,
    color: style.customColors?.text,
    borderColor: style.customColors?.border,
  };
  
  // 处理卡片内容根据类型
  const renderContent = () => {
    switch (card.type) {
      case 'text':
        return <div dangerouslySetInnerHTML={{ __html: content.html || '' }} />;
      case 'image':
        return (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <img 
              src={content.imageUrl} 
              alt={title} 
              className="object-cover w-full h-full"
            />
          </div>
        );
      case 'code':
        return (
          <pre className="p-4 bg-gray-800 text-gray-100 rounded-md overflow-x-auto">
            <code>{content.code?.value}</code>
          </pre>
        );
      default:
        return <div>{content.text}</div>;
    }
  };
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        style.layout === 'compact' ? 'p-3' : 'p-4',
        className
      )}
      style={cardStyle}
      onClick={onClick}
    >
      <CardHeader className="p-0 pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {renderContent()}
      </CardContent>
      
      <CardFooter className="p-0 pt-3 flex justify-between items-center">
        <div className="flex gap-1">
          {tags.map(tag => (
            <span 
              key={tag} 
              className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}>
              编辑
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" className="text-red-500" onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}>
              删除
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
```

```tsx
// src/components/cards/CardGrid.tsx
import React from 'react';
import { CardItem } from './CardItem';
import { Card } from '@/types/card';
import { useCardStore } from '@/store/cardStore';

interface CardGridProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onCardClick,
}) => {
  const { updateCard, deleteCard, selectCard } = useCardStore();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onClick={() => {
            selectCard(card.id);
            onCardClick?.(card);
          }}
          onEdit={() => {
            // 处理编辑逻辑
          }}
          onDelete={() => {
            if (confirm('确定要删除这张卡片吗？')) {
              deleteCard(card.id);
            }
          }}
        />
      ))}
    </div>
  );
};
```

## 3. 实现计划

### 3.1 MVP 阶段功能清单
1. **基础 UI 设计系统**
   - 实现基础组件库
   - 实现主题系统
   - 实现卡片视觉样式

2. **卡片管理功能**
   - 卡片创建、编辑、删除
   - 卡片组织和分类
   - 卡片搜索和筛选

3. **AI 生成功能**
   - 通义千问 API 集成
   - 卡片内容生成
   - 样式美化推荐

4. **存储功能**
   - IndexedDB 实现
   - 数据导入导出
   - 云同步准备

### 3.2 优先级实施顺序
1. 搭建基础项目框架（1天）
2. 实现设计系统和基础组件（2天）
3. 实现卡片数据模型和本地存储（2天）
4. 实现卡片展示和管理界面（3天）
5. 集成通义千问 API（2天）
6. 实现卡片生成功能（3天）
7. 实现数据导入导出（1天）
8. 基本测试和体验优化（2天）

### 3.3 后续迭代方向
1. **扩展卡片类型**
   - 更丰富的卡片模板
   - 多媒体支持增强
   - 交互卡片实现

2. **增强 AI 能力**
   - 多模型支持
   - 批量生成功能
   - 内容优化和转换

3. **协作功能**
   - 卡片分享
   - 卡片导出为图片
   - 轻量级协作机制

4. **市场功能**
   - 模板市场
   - 个人作品展示
   - 用户互动

## 文档更新记录

| 日期 | 更新内容 | 更新人 |
|------|----------|--------|
| 2024-03-26 | 创建实现方案文档 | - | 
| 2024-03-30 | 修改技术栈，移除Next.js，增加服务层 | - | 
# CardOS 组件文档

## 1. 组件设计原则

### 1.1 视觉美学原则

- **精美简约**：每个组件都应注重视觉美感，采用现代化的设计语言，简约而不简单。
- **一致性**：所有组件在视觉上应保持统一的设计语言，如圆角、阴影、间距等。
- **响应式**：组件应在各种屏幕尺寸下优雅展示，从移动设备到桌面。
- **动效适度**：适当使用微动效提升用户体验，但避免过度使用造成视觉疲劳。
- **色彩协调**：遵循主题色系，保持整体色彩和谐，重点突出。

### 1.2 组件设计规范

- **模块化**：每个组件应有明确的单一职责，便于组合和复用。
- **可配置性**：组件应支持通过属性配置不同的外观和行为。
- **无障碍性**：符合 WCAG 标准，确保所有用户都能使用。
- **性能优化**：组件应轻量化，避免不必要的渲染和计算。
- **可扩展性**：考虑到未来的功能扩展，留出适当的扩展点。

### 1.3 代码规范

- **TypeScript 类型定义**：所有组件都使用 TypeScript 进行严格类型定义。
- **函数式组件**：优先使用 React 函数式组件和 Hooks。
- **样式封装**：使用 Tailwind CSS 和组件变体模式管理样式。
- **命名规范**：组件采用 PascalCase，属性和方法采用 camelCase。
- **注释规范**：关键逻辑和复杂组件应有清晰的注释说明。

## 2. 核心组件概览

### 2.1 基础 UI 组件

| 组件名称 | 描述 | 用途 |
|----------|------|------|
| Button | 按钮组件 | 用户交互触发点 |
| Card | 卡片容器 | 内容展示的基础容器 |
| Input | 输入框 | 文本输入 |
| Dropdown | 下拉菜单 | 选项菜单 |
| Modal | 模态框 | 弹出式内容展示 |
| Tooltip | 工具提示 | 辅助信息展示 |
| Icon | 图标 | 视觉提示和装饰 |
| Avatar | 头像 | 用户标识 |
| Tag | 标签 | 分类和状态标记 |

### 2.2 卡片系统组件

| 组件名称 | 描述 | 用途 |
|----------|------|------|
| CardItem | 卡片项 | 单个卡片的展示 |
| CardGrid | 卡片网格 | 卡片列表展示 |
| CardEditor | 卡片编辑器 | 创建和编辑卡片 |
| CardViewer | 卡片查看器 | 全屏查看卡片细节 |
| CardPreview | 卡片预览 | 生成前的卡片预览 |
| CardFilter | 卡片筛选器 | 根据标签和属性筛选卡片 |
| CardExport | 卡片导出 | 导出卡片为图片或其他格式 |

### 2.3 编辑器组件

| 组件名称 | 描述 | 用途 |
|----------|------|------|
| RichTextEditor | 富文本编辑器 | 编辑文本内容 |
| CodeEditor | 代码编辑器 | 编辑代码卡片 |
| MathEditor | 数学公式编辑器 | 编辑数学公式 |
| TableEditor | 表格编辑器 | 创建和编辑表格 |
| ImageUploader | 图片上传器 | 上传和编辑图片 |
| StyleEditor | 样式编辑器 | 自定义卡片样式 |

### 2.4 AI 相关组件

| 组件名称 | 描述 | 用途 |
|----------|------|------|
| AIPromptInput | AI 提示输入 | 输入生成卡片的提示 |
| AIGenerationResult | AI 生成结果 | 展示 AI 生成的结果 |
| AIStyleSuggestion | AI 样式建议 | 展示 AI 推荐的样式选项 |
| AIFeedback | AI 反馈 | 收集用户对 AI 生成结果的反馈 |
| PromptTemplates | 提示词模板 | 预设的提示词模板选择 |

### 2.5 布局组件

| 组件名称 | 描述 | 用途 |
|----------|------|------|
| Layout | 整体布局 | 应用的主体结构 |
| Header | 头部 | 应用顶部导航和操作区 |
| Sidebar | 侧边栏 | 主导航和过滤器 |
| Footer | 底部 | 版权和次要导航 |
| Workspace | 工作区 | 主内容区域 |
| SplitPane | 分割面板 | 可调整大小的内容区域 |

## 3. 主要组件详解

### 3.1 Card 基础组件

Card 组件是整个应用的核心视觉元素，用于展示各种类型的内容。

#### 组件结构

```tsx
// Card 组件结构
<Card variant="primary" size="md">
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片描述</CardDescription>
  </CardHeader>
  
  <CardContent>
    卡片内容区域
  </CardContent>
  
  <CardFooter>
    底部操作区域
  </CardFooter>
</Card>
```

#### 主要属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| variant | 'default' \| 'primary' \| 'secondary' \| 'destructive' | 'default' | 卡片风格变体 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | 卡片尺寸 |
| asChild | boolean | false | 是否将样式应用到子元素 |
| className | string | - | 额外的 CSS 类 |

#### 使用示例

```tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

export function ExampleCard() {
  return (
    <Card variant="primary" size="md" className="max-w-md">
      <CardHeader>
        <CardTitle>React 基础知识</CardTitle>
      </CardHeader>
      <CardContent>
        <p>React 是一个用于构建用户界面的 JavaScript 库。它使用组件化的方式来构建 UI，并通过虚拟 DOM 提高渲染性能。</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm text-muted-foreground">前端开发</span>
        <Button variant="outline" size="sm">查看详情</Button>
      </CardFooter>
    </Card>
  );
}
```

### 3.2 CardItem 组件

CardItem 是对基础 Card 组件的业务封装，用于在卡片网格中展示单个卡片。

#### 组件结构

```tsx
// CardItem 组件结构
<CardItem
  card={cardData}
  onClick={handleCardClick}
  onEdit={handleEditCard}
  onDelete={handleDeleteCard}
/>
```

#### 主要属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| card | Card | 必填 | 卡片数据对象 |
| onClick | () => void | - | 点击卡片的回调 |
| onEdit | () => void | - | 编辑卡片的回调 |
| onDelete | () => void | - | 删除卡片的回调 |
| className | string | - | 额外的 CSS 类 |

#### 使用示例

```tsx
import { CardItem } from "@/components/cards/CardItem";
import { useRouter } from "next/navigation";
import { useCardStore } from "@/store/cardStore";

export function ExampleCardItem() {
  const router = useRouter();
  const { deleteCard } = useCardStore();
  
  const cardData = {
    id: "1",
    type: "text",
    title: "React Hooks 简介",
    content: {
      text: "Hooks 是 React 16.8 引入的新特性，它允许你在不编写 class 的情况下使用 state 和其他 React 特性。",
      html: "<p>Hooks 是 React 16.8 引入的新特性，它允许你在不编写 class 的情况下使用 state 和其他 React 特性。</p>"
    },
    tags: ["React", "前端"],
    style: {
      theme: "default",
    },
    metadata: {
      isPublic: true,
      version: 1,
    },
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  };
  
  return (
    <CardItem
      card={cardData}
      onClick={() => router.push(`/cards/${cardData.id}`)}
      onEdit={() => router.push(`/cards/${cardData.id}/edit`)}
      onDelete={() => {
        if (confirm("确定要删除这张卡片吗？")) {
          deleteCard(cardData.id);
        }
      }}
    />
  );
}
```

### 3.3 CardEditor 组件

CardEditor 用于创建和编辑卡片，包含多种编辑器来处理不同类型的内容。

#### 组件结构

```tsx
// CardEditor 组件结构
<CardEditor
  cardData={initialCardData}
  onSave={handleSaveCard}
  onCancel={handleCancel}
/>
```

#### 主要属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| cardData | Partial<Card> | {} | 初始卡片数据 |
| onSave | (card: Card) => void | 必填 | 保存卡片的回调 |
| onCancel | () => void | 必填 | 取消编辑的回调 |
| allowTypeChange | boolean | true | 是否允许改变卡片类型 |

#### 使用示例

```tsx
import { CardEditor } from "@/components/cards/CardEditor";
import { useCardStore } from "@/store/cardStore";
import { useRouter } from "next/navigation";

export function ExampleCardEditor() {
  const router = useRouter();
  const { addCard } = useCardStore();
  
  const initialData = {
    type: "text",
    title: "新卡片",
    content: {
      text: "",
    },
    tags: [],
    style: {
      theme: "default",
    },
  };
  
  const handleSave = async (cardData) => {
    try {
      const newCard = await addCard(cardData);
      router.push(`/cards/${newCard.id}`);
    } catch (error) {
      console.error("保存卡片失败:", error);
      alert("保存卡片失败，请重试");
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">创建新卡片</h1>
      <CardEditor
        cardData={initialData}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </div>
  );
}
```

### 3.4 AIPromptInput 组件

AIPromptInput 组件用于输入 AI 生成卡片的提示词，并展示相关的模板和建议。

#### 组件结构

```tsx
// AIPromptInput 组件结构
<AIPromptInput
  value={prompt}
  onChange={setPrompt}
  onSubmit={handleGenerate}
  templates={promptTemplates}
  isLoading={isGenerating}
/>
```

#### 主要属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| value | string | '' | 提示词内容 |
| onChange | (value: string) => void | 必填 | 提示词变化的回调 |
| onSubmit | () => void | 必填 | 提交生成的回调 |
| templates | Array<{name: string, prompt: string}> | [] | 提示词模板列表 |
| isLoading | boolean | false | 是否正在生成 |
| placeholder | string | '输入提示词...' | 占位文本 |

#### 使用示例

```tsx
import { AIPromptInput } from "@/components/ai/AIPromptInput";
import { useState } from "react";
import { cardGenerator } from "@/lib/ai/cardGenerator";
import { useCardStore } from "@/store/cardStore";

export function ExampleAIPromptInput() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { addCard } = useCardStore();
  
  const promptTemplates = [
    { name: "概念解释", prompt: "解释以下概念: " },
    { name: "代码示例", prompt: "提供以下功能的代码示例: " },
    { name: "步骤指南", prompt: "如何一步步实现: " },
  ];
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const generatedCard = await cardGenerator.generateCard({
        prompt,
        type: 'text',
        tags: ['AI生成'],
      });
      
      await addCard(generatedCard);
      setPrompt('');
      alert('卡片生成成功!');
    } catch (error) {
      console.error('生成卡片失败:', error);
      alert('生成卡片失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI 卡片生成</h1>
      <AIPromptInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleGenerate}
        templates={promptTemplates}
        isLoading={isGenerating}
        placeholder="例如：解释React中的虚拟DOM概念"
      />
    </div>
  );
}
```

## 4. 组件状态管理

### 4.1 组件内状态管理

对于简单的UI组件，我们使用 React 的 `useState` 和 `useReducer` 管理本地状态。

```tsx
function SimpleCounter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>增加</Button>
    </div>
  );
}
```

### 4.2 跨组件状态管理

对于需要在多个组件间共享的状态，我们使用 Zustand 进行管理。

```tsx
// 使用 Zustand store
import { useCardStore } from "@/store/cardStore";

function CardCounter() {
  const { cards } = useCardStore();
  
  return (
    <div>
      <p>卡片总数: {cards.length}</p>
    </div>
  );
}
```

### 4.3 组件通信模式

- **父子组件通信**：通过 props 和回调函数
- **远亲组件通信**：通过全局状态或 Context API
- **组件库通信**：通过事件总线或 Pub/Sub 模式

## 5. 组件开发指南

### 5.1 创建新组件

1. 在适当的目录创建组件文件（例如 `src/components/ui/NewComponent.tsx`）
2. 定义组件接口（Props 类型）
3. 实现组件逻辑和渲染
4. 添加必要的单元测试
5. 在组件文档中更新相关信息

### 5.2 组件测试

```tsx
// 组件测试示例
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 5.3 组件样式指南

- 使用 Tailwind CSS 类进行样式设计
- 对复杂样式使用 `cva` 创建变体
- 使用 CSS 变量定义主题样式
- 确保组件在不同屏幕尺寸下的响应式设计

```tsx
// 使用 cva 创建变体示例
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        // ... 其他变体
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## 6. 组件最佳实践

### 6.1 性能优化

- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useCallback` 和 `useMemo` 缓存函数和计算结果
- 实现虚拟滚动处理大量数据
- 懒加载组件和图片
- 代码分割减小包体积

### 6.2 可访问性

- 所有组件应支持键盘导航
- 使用适当的 ARIA 属性
- 确保足够的颜色对比度
- 提供替代文本和屏幕阅读器支持
- 遵循 W3C WAI-ARIA 实践

### 6.3 国际化支持

- 所有文本应使用 i18n 工具，不硬编码
- 确保组件支持从右到左（RTL）文本方向
- 考虑不同语言中文本长度的变化

## 文档更新记录

| 日期 | 更新内容 | 更新人 |
|------|----------|--------|
| 2024-03-26 | 创建组件文档 | - | 
# 助手服务笔记

> **重要说明**: 本文档是AI助手服务的参考资料，包含项目关键信息。请在每次对话开始时主动查阅此文档，及时更新发现的新信息，并基于此文档内容提供服务。文档中的信息优先级高于训练数据。

> **使用指南**: 
> 1. 在回答用户问题前，先查阅此文档了解项目背景
> 2. 发现项目新信息时，立即更新此文档相关部分
> 3. 按照文档中的用户偏好和技术决策提供服务
> 4. 主动关注并解决文档中提到的待解决问题
> 5. 发现文档与实际情况不符时，以实际情况为准并更新文档

## 项目概览
- **项目名称**：CardOS
- **项目定位**：智能卡片操作系统，专注于信息卡片的创建、管理和分享
- **核心价值**：通过智能卡片重组信息，降低创作门槛，提高信息获取效率
- **产品标语**："记录、演讲、教学、分享，AI 帮你把内容变成惊艳的卡片。"

## 技术栈决策
- ~~Next.js~~ -> **React 18 + Vite**（用户明确不想使用Next.js）
- **shadcn/ui** 保留（对卡片系统UI组件有价值）
- 添加 **services** 文件夹（业务逻辑与基础设施分离）
- 使用 **React Router DOM** 代替Next.js路由
- 存储方案：**IndexedDB** 作为本地存储
- AI集成：**阿里云通义千问API**
- 包管理器：**pnpm**（项目已有pnpm-lock.yaml）

## 项目环境状态
- **Vite** 已配置好基本项目结构
- 已有 **package.json** 但缺少关键依赖(zustand, react-router-dom, tailwindcss等)
- 目录结构已初始化(src/components/ui, src/lib/ai, src/lib/storage等)
- 已实现 **Card.tsx** UI组件, **IndexedDB存储适配器**, **AI模型适配器**
- 已使用Vite+React初始化项目
- 已安装的关键依赖:
  - react@19.0.0
  - react-dom@19.0.0
  - zustand@5.0.3
  - tailwindcss@4.0.17
  - postcss@8.5.3
  - autoprefixer@10.4.21
  - uuid@11.1.0
  - react-router-dom@7.4.0
  - class-variance-authority@0.7.1
  - clsx@2.1.1
  - tailwind-merge@3.0.2
  - @tailwindcss/typography@0.5.16
  - @tailwindcss/postcss@4.0.17
- 已配置Tailwind CSS
  - 创建了`tailwind.config.js`
  - 更新了`postcss.config.js`以使用`@tailwindcss/postcss`
  - 修改了全局CSS文件以包含Tailwind指令和设计系统变量
- 已实现的组件和功能:
  - 类型系统: Card、CardType、CardMetadata等
  - 工具函数: cn()、debounce()、throttle()等
  - 服务层: CardService、IndexedDBCardStorage
  - UI组件: Card、CardGrid
  - 应用主文件: App.tsx，展示卡片列表

## 文档结构 (README.md)

### 1. 项目概述
- [项目愿景](./overview/vision.md) - 项目的整体愿景和目标
- [项目规划](./overview/roadmap.md) - 项目的发展路线图
- [项目范围](./overview/scope.md) - 项目的范围和边界定义

### 2. 产品设计
- [产品定位](./product/positioning.md) - 产品定位和目标用户
- [用户价值](./product/value.md) - 核心价值主张
- [功能规划](./product/features.md) - 功能列表和优先级
- [商业模式](./product/business.md) - 商业模式设计

### 3. 技术设计
- [系统架构](./technical/architecture.md) - 系统整体架构
- [AI生成系统](./technical/ai-generation.md) - AI生成相关设计
- [卡片系统](./technical/card-system.md) - 卡片系统设计
- [通信机制](./technical/communication.md) - 卡片间通信设计
- [安全设计](./technical/security.md) - 安全相关设计
- [数据层设计](./technical/data-layer.md) - 数据层抽象设计

### 4. 开发文档
- [开发指南](./development/guide.md) - 开发环境搭建和规范
- [API文档](./development/api.md) - API接口文档
- [组件文档](./development/components.md) - 组件使用文档
- [部署文档](./development/deployment.md) - 部署相关文档
- [实现方案](./development/implementation.md) - 详细实现方案

### 5. 项目管理
- [里程碑](./project/milestones.md) - 项目里程碑
- [任务追踪](./project/tasks.md) - 任务追踪
- [风险管理](./project/risks.md) - 风险管理和应对策略

## 核心需求变更记录
1. [2024-03-30] 不使用Next.js，转为Vite + React方案
2. [2024-03-30] 调整项目结构，加入services层
3. [2024-03-30] 保留shadcn/ui组件库
4. [2024-03-31] 调整卡片实现方式，从JSON模型改为AI生成HTML卡片
5. [2024-03-31] 将项目定位调整为支持多轮对话的AI应用，通过对话生成卡片

## 当前开发状态
- 已完成文档架构设计
- 已实现部分基础组件和类型定义
- 已创建IndexedDB存储适配器
- 已实现AI模型适配器基础结构
- 需要重新设计卡片系统，改为基于AI对话生成HTML卡片

## 项目定位更新
- 从"卡片管理系统"转向"多轮对话AI应用"
- 通过与AI的对话来生成精美的HTML卡片
- 不限制卡片为固定类型，而是让AI根据内容自动生成最优展示形式
- 保留卡片管理功能，但核心变为AI对话体验

## 命名约定更新
- **Card**: 指UI组件层面的卡片组件，来自shadcn/ui
- **SmartCard**: 指产品业务层面的AI生成卡片，存储在数据库中
- 将相关类型、接口和服务相应重命名，以保持一致性

## 文件命名规则
- **文件命名**: 使用 kebab-case（如 `card.tsx`、`format-date.ts`、`card-types.ts`）
- **测试文件**: 使用 `*.test.ts` 或 `*.spec.ts`
- **目录命名**: 使用 kebab-case（如 `card-components`、`api-services`）

## 新系统架构
- 对话界面：支持多轮对话历史，带有上下文记忆
- AI生成器：将对话内容转化为HTML卡片
- 卡片渲染器：安全地渲染AI生成的HTML内容
- 卡片管理系统：保存、分类、搜索和分享卡片

## 待开发功能
- 多轮对话界面和历史记录管理
- AI模型集成（阿里云通义千问API）
- HTML卡片生成和渲染系统
- 卡片存储和管理功能

## 待解决问题
- 项目初始化和依赖安装
- 构建pipeline设置
- 组件库与Tailwind配置整合
- 数据层与AI服务整合测试
- ~~文件命名约定不一致（部分文件使用PascalCase或camelCase，而非kebab-case）~~

## 用户偏好
- 偏好简洁明了的实现方案
- 重视架构设计和关注点分离
- 需要中文交流
- 希望有独立思考和分析能力
- 希望专注用户原始诉求，不偏离重点
- 注重实际行动胜于空谈
- **不要使用后台运行(`is_background: true`)启动开发服务器**，避免弹出额外窗口
- 避免反复执行相同命令，尤其是长时间运行的命令

## 笔记更新规则
需要更新笔记的情况：
1. **技术决策变更**：当项目技术栈、架构设计有调整时
2. **新需求确认**：用户明确提出新需求或修改现有需求时
3. **重要讨论结论**：对项目方向有影响的讨论结论
4. **工作进度更新**：当开发状态有显著变化时
5. **发现新文档**：找到新的项目文档或资源时
6. **发现问题**：识别出新的待解决问题时

更新频率：
- **会话内实时更新**：对关键决策立即记录
- **会话结束总结更新**：每次对话结束时复盘并更新关键信息
- **定期清理**：保持文档简洁，移除过时信息，确保不超过500行

笔记更新原则：
- 优先记录影响项目走向的关键信息
- 保持简洁，避免冗余
- 使用时间标记跟踪变更
- 确保更新内容在上下文窗口内可见

## 已解决的问题
- 修复了Tailwind CSS v4的PostCSS插件配置问题
- 修复了TypeScript配置警告，创建了缺失的tsconfig.base.json文件
- 修复了Tailwind CSS v4中无效的`border-border`类名问题
- 修复了Tailwind CSS v4中无效的`bg-background`和`text-foreground`类名问题
- 修复了错误添加的文件命名约定，参照了项目开发指南中的正确约定
- 统一了文件命名约定，将关键组件和类型重构为kebab-case命名风格
  - 创建了`src/components/ui/card/card.tsx`替代`Card.tsx`
  - 创建了`src/components/smart-card/smart-card.tsx`使用正确命名约定
  - 创建了`src/types/smart-card/smart-card.ts`替代`smartCard.ts`
  - 创建了`src/components/card-grid/card-grid.tsx`替代`CardGrid.tsx`
  - 创建了`src/types/card/card.ts`替代`card.ts`
  - 创建了`src/lib/ai/adapter/qwen-adapter.ts`替代`qwenAdapter.ts`
  - 创建了`src/lib/ai/adapter/adapter-factory.ts`替代`adapterFactory.ts`
  - 为所有重构的目录添加了索引文件，以便于导入
  - 删除了所有旧的、不符合命名约定的文件和空目录

## 当前进度
1. ✅ 项目基础搭建和配置
2. ✅ 数据模型定义
3. ✅ 存储服务实现
4. ✅ 基础UI组件开发
5. ✅ 示例页面实现
6. ⬜ AI功能集成
7. ⬜ 卡片编辑功能
8. ⬜ 更多视图模式(网格、列表、看板)
9. ⬜ 用户认证和云同步

## 最近完成的工作

- 重构了卡片相关类型，将 `Card` 类型改为 `SmartCard` 类型，并更新了所有相关文件：
  - 修改 `src/services/card/index.ts` 引用路径和类型名称
  - 在 `src/types/smart-card/smart-card.ts` 中添加 `relatedCardIds` 字段
  - 更新 `src/services/card/storage.ts` 以使用 `SmartCard` 类型和相关字段
  - 修复了所有类型错误和引用问题
- 创建了详细的界面设计规范文档:
  - 在 `docs/product/interface-design.md` 中添加了完整的界面设计规范
  - 包含设计理念、布局系统、色彩系统、排版系统、组件样式等内容
  - 在文档README中添加了界面设计文档的引用

---
*注意：本文档仅供助手服务使用，长度控制在500行以内，确保关键信息可被上下文捕获* 
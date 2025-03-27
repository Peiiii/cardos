# CardOS 开发指南

## 开发环境

### 1. 基础环境
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git >= 2.0.0
- VS Code（推荐）

### 2. 开发工具
- **编辑器插件**
  - ESLint
  - Prettier
  - TypeScript
  - GitLens
  - Error Lens
- **浏览器插件**
  - React Developer Tools
  - Redux DevTools
  - Network Panel
  - Console Panel

### 3. 环境配置
```bash
# 安装 Node.js
brew install node

# 安装 pnpm
npm install -g pnpm

# 安装 Git
brew install git

# 克隆项目
git clone https://github.com/your-org/cardos.git
cd cardos

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 项目结构

### 1. 目录结构
```
cardos/
├── src/                # 源代码
│   ├── components/    # 组件
│   ├── hooks/        # 自定义 Hooks
│   ├── services/     # 服务
│   ├── stores/       # 状态管理
│   ├── types/        # 类型定义
│   ├── utils/        # 工具函数
│   └── pages/        # 页面
├── public/           # 静态资源
├── tests/            # 测试文件
├── docs/             # 文档
└── scripts/          # 脚本
```

### 2. 文件命名
- 所有文件统一使用 kebab-case（如 `card.tsx`、`format-date.ts`、`card-types.ts`）
- 测试文件：`*.test.ts` 或 `*.spec.ts`
- 目录名：kebab-case（如 `card-components`、`api-services`）

## 开发规范

### 1. 代码规范
- **TypeScript**
  ```typescript
  // 类型定义
  interface CardProps {
    id: string;
    title: string;
    content: string;
    onAction?: (action: CardAction) => void;
  }

  // 组件定义
  const Card: React.FC<CardProps> = ({ id, title, content, onAction }) => {
    return (
      <div className="card">
        <h3>{title}</h3>
        <p>{content}</p>
        {onAction && <button onClick={() => onAction({ type: 'click', id })}>Action</button>}
      </div>
    );
  };
  ```

- **样式规范**
  ```scss
  // 使用 CSS Modules
  .card {
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &__title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    &__content {
      font-size: 14px;
      color: #666;
    }
  }
  ```

### 2. Git 规范
- **分支管理**
  - main：主分支
  - develop：开发分支
  - feature/*：功能分支
  - bugfix/*：修复分支
  - release/*：发布分支

- **提交规范**
  ```
  feat: 新功能
  fix: 修复问题
  docs: 文档修改
  style: 代码格式修改
  refactor: 代码重构
  test: 测试用例修改
  chore: 其他修改
  ```

- **PR 规范**
  - 标题：使用 commit message 规范
  - 描述：详细说明改动内容和原因
  - 关联：关联相关 issue
  - 审查：至少一个审查者通过

### 3. 测试规范
- **单元测试**
  ```typescript
  describe('Card Component', () => {
    it('should render correctly', () => {
      const props = {
        id: '1',
        title: 'Test Card',
        content: 'Test Content'
      };
      render(<Card {...props} />);
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });
  });
  ```

- **集成测试**
  ```typescript
  describe('Card System', () => {
    it('should handle card interactions', async () => {
      const onAction = jest.fn();
      render(<CardSystem onAction={onAction} />);
      await userEvent.click(screen.getByText('Action'));
      expect(onAction).toHaveBeenCalled();
    });
  });
  ```

### 4. 文档规范
- **组件文档**
  ```typescript
  /**
   * Card 组件
   * @component
   * @example
   * ```tsx
   * <Card
   *   id="1"
   *   title="Example Card"
   *   content="This is an example card"
   *   onAction={(action) => console.log(action)}
   * />
   * ```
   */
  ```

- **API 文档**
  ```typescript
  /**
   * 创建卡片
   * @param {CreateCardParams} params - 创建卡片参数
   * @returns {Promise<Card>} 创建的卡片
   * @throws {Error} 创建失败时抛出错误
   */
  ```

## 开发流程

### 1. 功能开发
1. 创建功能分支
2. 编写代码和测试
3. 提交代码
4. 创建 PR
5. 代码审查
6. 合并代码

### 2. 问题修复
1. 创建修复分支
2. 编写修复代码
3. 编写测试用例
4. 提交代码
5. 创建 PR
6. 代码审查
7. 合并代码

### 3. 发布流程
1. 创建发布分支
2. 版本号更新
3. 更新文档
4. 运行测试
5. 构建代码
6. 部署代码
7. 合并到主分支

## 调试指南

### 1. 开发调试
- **控制台调试**
  ```typescript
  // 使用 console 调试
  console.log('Debug info');
  console.error('Error info');
  console.warn('Warning info');
  ```

- **断点调试**
  ```typescript
  // 使用 debugger 断点
  function processData(data: any) {
    debugger; // 断点
    return data.map(item => item.id);
  }
  ```

### 2. 性能调试
- **性能分析**
  - 使用 React DevTools Profiler
  - 使用 Chrome DevTools Performance
  - 使用 Lighthouse

- **内存分析**
  - 使用 Chrome DevTools Memory
  - 使用 React DevTools Components

### 3. 网络调试
- **请求调试**
  - 使用 Chrome DevTools Network
  - 使用 Postman
  - 使用 curl

- **API 调试**
  - 使用 Swagger UI
  - 使用 Postman
  - 使用 curl

## 常见问题

### 1. 环境问题
- **依赖安装失败**
  ```bash
  # 清除缓存
  pnpm store prune
  
  # 重新安装
  pnpm install
  ```

- **构建失败**
  ```bash
  # 清除构建缓存
  pnpm clean
  
  # 重新构建
  pnpm build
  ```

### 2. 开发问题
- **类型错误**
  - 检查类型定义
  - 使用类型断言
  - 更新类型声明

- **运行时错误**
  - 检查控制台错误
  - 使用错误边界
  - 添加错误日志

### 3. 部署问题
- **部署失败**
  - 检查构建日志
  - 检查环境变量
  - 检查部署配置

- **性能问题**
  - 检查网络请求
  - 检查资源加载
  - 检查代码优化

## 文档更新记录

| 日期 | 更新内容 | 更新人 |
|------|----------|--------|
| 2024-03-26 | 创建开发指南文档 | - | 
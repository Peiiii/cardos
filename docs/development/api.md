# CardOS API 文档

## 接口规范

### 1. 基础规范
- **请求格式**
  - 请求方法：GET、POST、PUT、DELETE
  - 请求头：Content-Type: application/json
  - 认证头：Authorization: Bearer <token>
  - 请求体：JSON 格式

- **响应格式**
  ```typescript
  interface ApiResponse<T> {
    code: number;      // 状态码
    message: string;   // 状态信息
    data: T;          // 响应数据
  }
  ```

- **错误处理**
  ```typescript
  interface ApiError {
    code: number;      // 错误码
    message: string;   // 错误信息
    details?: any;     // 错误详情
  }
  ```

### 2. 认证规范
- **获取令牌**
  ```typescript
  POST /api/auth/token
  Request: {
    username: string;
    password: string;
  }
  Response: {
    token: string;
    expires: number;
  }
  ```

- **刷新令牌**
  ```typescript
  POST /api/auth/refresh
  Request: {
    refreshToken: string;
  }
  Response: {
    token: string;
    expires: number;
  }
  ```

## 卡片接口

### 1. 卡片管理
- **创建卡片**
  ```typescript
  POST /api/cards
  Request: {
    title: string;
    content: string;
    type: string;
    config: CardConfig;
  }
  Response: Card
  ```

- **获取卡片**
  ```typescript
  GET /api/cards/:id
  Response: Card
  ```

- **更新卡片**
  ```typescript
  PUT /api/cards/:id
  Request: {
    title?: string;
    content?: string;
    config?: CardConfig;
  }
  Response: Card
  ```

- **删除卡片**
  ```typescript
  DELETE /api/cards/:id
  Response: void
  ```

### 2. 卡片列表
- **获取卡片列表**
  ```typescript
  GET /api/cards
  Query: {
    page?: number;
    size?: number;
    type?: string;
    search?: string;
  }
  Response: {
    items: Card[];
    total: number;
    page: number;
    size: number;
  }
  ```

- **批量操作**
  ```typescript
  POST /api/cards/batch
  Request: {
    operation: 'delete' | 'update' | 'move';
    ids: string[];
    data?: any;
  }
  Response: {
    success: boolean;
    results: {
      id: string;
      success: boolean;
      error?: string;
    }[];
  }
  ```

## AI 生成接口

### 1. 卡片生成
- **生成卡片**
  ```typescript
  POST /api/ai/generate
  Request: {
    prompt: string;
    type: string;
    options?: GenerationOptions;
  }
  Response: {
    card: Card;
    metadata: GenerationMetadata;
  }
  ```

- **优化卡片**
  ```typescript
  POST /api/ai/optimize
  Request: {
    cardId: string;
    aspect: 'style' | 'content' | 'performance';
    options?: OptimizationOptions;
  }
  Response: {
    card: Card;
    improvements: string[];
  }
  ```

### 2. 内容生成
- **生成内容**
  ```typescript
  POST /api/ai/content
  Request: {
    type: string;
    prompt: string;
    constraints?: ContentConstraints;
  }
  Response: {
    content: string;
    metadata: ContentMetadata;
  }
  ```

- **内容优化**
  ```typescript
  POST /api/ai/content/optimize
  Request: {
    content: string;
    aspect: 'grammar' | 'style' | 'tone';
    options?: OptimizationOptions;
  }
  Response: {
    content: string;
    suggestions: string[];
  }
  ```

## 用户接口

### 1. 用户管理
- **用户注册**
  ```typescript
  POST /api/users
  Request: {
    username: string;
    email: string;
    password: string;
  }
  Response: User
  ```

- **用户登录**
  ```typescript
  POST /api/users/login
  Request: {
    username: string;
    password: string;
  }
  Response: {
    user: User;
    token: string;
  }
  ```

- **用户信息**
  ```typescript
  GET /api/users/me
  Response: User
  ```

### 2. 用户设置
- **更新设置**
  ```typescript
  PUT /api/users/settings
  Request: {
    theme?: string;
    language?: string;
    notifications?: NotificationSettings;
  }
  Response: UserSettings
  ```

- **获取设置**
  ```typescript
  GET /api/users/settings
  Response: UserSettings
  ```

## 市场接口

### 1. 卡片市场
- **获取市场列表**
  ```typescript
  GET /api/market/cards
  Query: {
    category?: string;
    sort?: string;
    page?: number;
    size?: number;
  }
  Response: {
    items: MarketCard[];
    total: number;
    page: number;
    size: number;
  }
  ```

- **发布卡片**
  ```typescript
  POST /api/market/cards
  Request: {
    cardId: string;
    title: string;
    description: string;
    price?: number;
    tags: string[];
  }
  Response: MarketCard
  ```

### 2. 交易管理
- **购买卡片**
  ```typescript
  POST /api/market/transactions
  Request: {
    cardId: string;
    paymentMethod: string;
  }
  Response: Transaction
  ```

- **交易历史**
  ```typescript
  GET /api/market/transactions
  Query: {
    type?: 'purchase' | 'sale';
    page?: number;
    size?: number;
  }
  Response: {
    items: Transaction[];
    total: number;
    page: number;
    size: number;
  }
  ```

## 协作接口

### 1. 团队管理
- **创建团队**
  ```typescript
  POST /api/teams
  Request: {
    name: string;
    description?: string;
    members?: string[];
  }
  Response: Team
  ```

- **团队信息**
  ```typescript
  GET /api/teams/:id
  Response: Team
  ```

### 2. 协作功能
- **共享卡片**
  ```typescript
  POST /api/teams/:id/cards
  Request: {
    cardId: string;
    permission: 'view' | 'edit' | 'admin';
  }
  Response: SharedCard
  ```

- **协作编辑**
  ```typescript
  POST /api/cards/:id/collaboration
  Request: {
    userId: string;
    action: 'join' | 'leave' | 'lock' | 'unlock';
  }
  Response: CollaborationStatus
  ```

## 文档更新记录

| 日期 | 更新内容 | 更新人 |
|------|----------|--------|
| 2024-03-26 | 创建 API 文档 | - | 
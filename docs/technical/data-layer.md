# CardOS 数据层设计

## 系统概述

数据层是 CardOS 的核心抽象层，负责统一管理数据访问和存储。系统采用 Provider 模式，支持多种数据源，包括本地存储、后端 API 等，同时提供统一的数据访问接口。

## 系统架构

### 1. 核心接口

#### 1.1 数据提供者接口
```typescript
interface DataProvider<T> {
  // 基础操作
  get(id: string): Promise<T>;
  list(query?: QueryParams): Promise<PaginatedResponse<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  
  // 批量操作
  batchGet(ids: string[]): Promise<T[]>;
  batchCreate(data: Partial<T>[]): Promise<T[]>;
  batchUpdate(updates: { id: string; data: Partial<T> }[]): Promise<T[]>;
  batchDelete(ids: string[]): Promise<void>;
  
  // 同步操作
  sync(): Promise<SyncResult>;
  getSyncStatus(): Promise<SyncStatus>;
}
```

#### 1.2 数据管理器接口
```typescript
interface DataManager<T> {
  // 提供者管理
  registerProvider(name: string, provider: DataProvider<T>): void;
  setActiveProvider(name: string): void;
  getActiveProvider(): DataProvider<T>;
  
  // 数据操作
  get(id: string): Promise<T>;
  list(query?: QueryParams): Promise<PaginatedResponse<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  
  // 缓存管理
  invalidateCache(id?: string): void;
  clearCache(): void;
}
```

### 2. 提供者实现

#### 2.1 本地存储提供者
```typescript
class LocalStorageProvider<T> implements DataProvider<T> {
  private storage: Storage;
  private prefix: string;
  
  constructor(storage: Storage, prefix: string) {
    this.storage = storage;
    this.prefix = prefix;
  }
  
  async get(id: string): Promise<T> {
    const data = this.storage.getItem(this.getKey(id));
    return data ? JSON.parse(data) : null;
  }
  
  async list(query?: QueryParams): Promise<PaginatedResponse<T>> {
    const items = await this.getAllItems();
    return this.applyQuery(items, query);
  }
  
  private getKey(id: string): string {
    return `${this.prefix}:${id}`;
  }
  
  private async getAllItems(): Promise<T[]> {
    const items: T[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        const data = this.storage.getItem(key);
        if (data) {
          items.push(JSON.parse(data));
        }
      }
    }
    return items;
  }
}
```

#### 2.2 IndexedDB 提供者
```typescript
class IndexedDBProvider<T> implements DataProvider<T> {
  private db: IDBDatabase;
  private storeName: string;
  
  constructor(db: IDBDatabase, storeName: string) {
    this.db = db;
    this.storeName = storeName;
  }
  
  async get(id: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async list(query?: QueryParams): Promise<PaginatedResponse<T>> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const items = request.result;
        resolve(this.applyQuery(items, query));
      };
      request.onerror = () => reject(request.error);
    });
  }
}
```

#### 2.3 API 提供者
```typescript
class ApiProvider<T> implements DataProvider<T> {
  private baseUrl: string;
  private endpoint: string;
  private client: ApiClient;
  
  constructor(baseUrl: string, endpoint: string, client: ApiClient) {
    this.baseUrl = baseUrl;
    this.endpoint = endpoint;
    this.client = client;
  }
  
  async get(id: string): Promise<T> {
    const response = await this.client.get(`${this.baseUrl}/${this.endpoint}/${id}`);
    return response.data;
  }
  
  async list(query?: QueryParams): Promise<PaginatedResponse<T>> {
    const response = await this.client.get(`${this.baseUrl}/${this.endpoint}`, { params: query });
    return response.data;
  }
}
```

### 3. 数据管理器实现

```typescript
class DataManagerImpl<T> implements DataManager<T> {
  private providers: Map<string, DataProvider<T>>;
  private activeProvider: string;
  private cache: Map<string, T>;
  
  constructor() {
    this.providers = new Map();
    this.cache = new Map();
  }
  
  registerProvider(name: string, provider: DataProvider<T>): void {
    this.providers.set(name, provider);
  }
  
  setActiveProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not found`);
    }
    this.activeProvider = name;
  }
  
  getActiveProvider(): DataProvider<T> {
    const provider = this.providers.get(this.activeProvider);
    if (!provider) {
      throw new Error('No active provider');
    }
    return provider;
  }
  
  async get(id: string): Promise<T> {
    // 检查缓存
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    
    // 从提供者获取
    const provider = this.getActiveProvider();
    const data = await provider.get(id);
    
    // 更新缓存
    this.cache.set(id, data);
    return data;
  }
  
  invalidateCache(id?: string): void {
    if (id) {
      this.cache.delete(id);
    } else {
      this.cache.clear();
    }
  }
}
```

## 使用示例

### 1. 初始化
```typescript
// 创建数据管理器
const cardManager = new DataManagerImpl<Card>();

// 注册本地存储提供者
const localStorageProvider = new LocalStorageProvider<Card>(
  window.localStorage,
  'cards'
);
cardManager.registerProvider('local', localStorageProvider);

// 注册 API 提供者
const apiProvider = new ApiProvider<Card>(
  'https://api.cardos.com',
  'cards',
  apiClient
);
cardManager.registerProvider('api', apiProvider);

// 设置默认提供者
cardManager.setActiveProvider('local');
```

### 2. 数据操作
```typescript
// 创建卡片
const card = await cardManager.create({
  title: 'New Card',
  content: 'Card content'
});

// 获取卡片
const card = await cardManager.get('card-1');

// 更新卡片
await cardManager.update('card-1', {
  title: 'Updated Title'
});

// 删除卡片
await cardManager.delete('card-1');
```

### 3. 数据同步
```typescript
// 切换到 API 提供者
cardManager.setActiveProvider('api');

// 同步数据
const apiProvider = cardManager.getActiveProvider();
await apiProvider.sync();

// 检查同步状态
const status = await apiProvider.getSyncStatus();
```

## 性能优化

### 1. 缓存策略
- 内存缓存
- 持久化缓存
- 缓存失效
- 缓存更新

### 2. 批量操作
- 批量读取
- 批量写入
- 批量更新
- 批量删除

### 3. 同步策略
- 增量同步
- 全量同步
- 冲突处理
- 离线支持

## 错误处理

### 1. 错误类型
```typescript
interface DataError extends Error {
  code: string;
  details?: any;
}

class ProviderError extends Error implements DataError {
  code: string;
  details?: any;
  
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
```

### 2. 错误处理
```typescript
try {
  const card = await cardManager.get('card-1');
} catch (error) {
  if (error instanceof ProviderError) {
    switch (error.code) {
      case 'NOT_FOUND':
        // 处理未找到错误
        break;
      case 'NETWORK_ERROR':
        // 处理网络错误
        break;
      default:
        // 处理其他错误
    }
  }
}
```

## 文档更新记录

| 日期 | 更新内容 | 更新人 |
|------|----------|--------|
| 2024-03-26 | 创建数据层设计文档 | - | 
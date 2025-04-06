# Storage Module

这是一个数据存储抽象层，提供了统一的接口来操作数据，支持本地存储和 HTTP 接口两种实现方式。

## 功能特点

- 统一的 CRUD 操作接口
- 支持本地存储和 HTTP 接口两种实现
- 类型安全的操作
- 灵活的排序功能
- 支持批量操作
- 完整的错误处理

## 核心接口

```typescript
interface DataProvider<T> {
  list(): Promise<T[]>;
  get(id: string): Promise<T>;
  create(data: Omit<T, "id">): Promise<T>;
  createMany(data: Omit<T, "id">[]): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

## 实现方式

### 1. LocalStorageProvider

基于 `localStorage` 的实现，提供本地数据存储功能。

#### 特点
- 支持自定义排序
- 支持多字段排序
- 支持最大条目限制
- 自动生成唯一 ID
- 完整的事务性操作

#### 使用示例

```typescript
interface User {
  id: string;
  name: string;
  age: number;
}

const userStorage = new LocalStorageProvider<User>('users', {
  maxItems: 100,
  sortFields: [
    { field: 'age', direction: 'desc' },
    { field: 'name', direction: 'asc' }
  ]
});

// 创建用户
const user = await userStorage.create({ name: 'John', age: 30 });

// 获取用户列表
const users = await userStorage.list();

// 更新用户
const updatedUser = await userStorage.update(user.id, { age: 31 });

// 删除用户
await userStorage.delete(user.id);
```

### 2. MockHttpProvider

基于 `LocalStorageProvider` 的实现，模拟 HTTP 接口。

#### 特点
- 模拟网络延迟
- 模拟 HTTP 错误处理
- 适用于开发和测试环境

#### 使用示例

```typescript
const mockUserStorage = new MockHttpProvider<User>('users', {
  delay: 500, // 500ms 延迟
  maxItems: 100
});

// 使用方式与 LocalStorageProvider 相同
```

### 3. IndexedDBProvider

基于 IndexedDB 的实现，提供更强大的本地存储功能。

#### 特点
- 支持更大的存储空间（通常为 50MB 以上）
- 支持事务操作
- 支持索引查询
- 异步操作，不会阻塞主线程
- 支持结构化数据存储

#### 使用示例

```typescript
const indexedDBStorage = new IndexedDBProvider<User>('users', {
  dbName: 'my-app-db',
  version: 1,
  storeName: 'users'
});

// 使用方式与其他 Provider 相同
const user = await indexedDBStorage.create({ name: 'John', age: 30 });
```

## 配置选项

### LocalStorageOptions

```typescript
interface LocalStorageOptions<T> {
  maxItems?: number;
  comparator?: CompareFn<T>;
  sortFields?: SortField<T, keyof T>[];
}
```

### MockHttpProvider 额外选项

```typescript
interface MockHttpOptions<T> extends LocalStorageOptions<T> {
  delay?: number;
}
```

### IndexedDBOptions

```typescript
interface IndexedDBOptions {
  dbName?: string;    // 数据库名称
  version?: number;   // 数据库版本
  storeName?: string; // 对象存储名称
}
```

## 最佳实践

1. 在开发环境使用 `MockHttpProvider` 模拟后端接口
2. 在生产环境根据需求选择合适的存储实现：
   - 小数据量：使用 `LocalStorageProvider`
   - 大数据量：使用 `IndexedDBProvider`
   - 远程数据：使用实际的 HTTP 实现
3. 合理使用排序功能提高数据访问效率
4. 注意处理可能的错误情况
5. 对于 IndexedDB，注意处理数据库版本升级的情况

## 注意事项

- 本地存储有大小限制：
  - localStorage: 通常为 5-10MB
  - IndexedDB: 通常为 50MB 以上
- 敏感数据不建议存储在本地
- 批量操作时注意性能影响
- 确保数据模型实现 `id` 字段
- IndexedDB 操作是异步的，需要注意错误处理
- 不同浏览器对 IndexedDB 的支持程度可能不同 
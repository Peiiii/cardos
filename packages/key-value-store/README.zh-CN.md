# 键值对存储系统

一个灵活的键值对存储系统，支持多级缓存和多种存储提供者。

## 特性

- 支持多种存储提供者：
  - 本地存储 (localStorage)
  - 内存存储 (Map)
  - 远程存储 (HTTP)
  - 级联存储 (多级缓存)
- 类型安全的键值对存储
- 支持缓存过期时间 (TTL)
- 支持缓存大小限制
- 支持只读缓存层级
- 支持缓存预热
- 支持缓存统计

## 安装

```bash
pnpm add @cardos/key-value-store
```

## 使用示例

### 基本使用

```typescript
import {
  KeyValueStorage,
  LocalKeyValueStoreProvider
} from '@cardos/key-value-store';

// 创建存储实例
const store = new LocalKeyValueStoreProvider();
const storage = new KeyValueStorage(store);

// 设置值
await storage.set("theme.mode", "dark");

// 获取值
const themeMode = await storage.get("theme.mode");

// 删除值
await storage.remove("theme.mode");
```

### 使用类型安全的存储

```typescript
import {
  KeyValueStorage,
  MemoryKeyValueStoreProvider,
  TypedKeyValueStorage
} from '@cardos/key-value-store';

// 定义存储类型
type AppStorage = {
  // 主题设置
  theme: {
    mode: "light" | "dark";
    name: string;
  };
  // 布局设置
  layout: {
    sidebarCollapsed: boolean;
    activityBarExpanded: boolean;
  };
  // 聊天设置
  chat: {
    defaultSessionId: string | null;
  };
};

// 创建类型安全的存储实例
const storage = new KeyValueStorage(
  new MemoryKeyValueStoreProvider()
) as TypedKeyValueStorage<AppStorage>;

// 设置值 - 类型安全
await storage.set("theme.mode", "dark"); // ✅ 正确
await storage.set("theme.name", "default"); // ✅ 正确
await storage.set("layout.sidebarCollapsed", true); // ✅ 正确

// 以下代码会在编译时报错
// await storage.set("theme.mode", "invalid"); // ❌ 错误：类型 "invalid" 不能赋值给类型 "light" | "dark"
// await storage.set("invalid.key", "value"); // ❌ 错误：类型 "invalid.key" 不能赋值给类型 Paths<AppStorage>
// await storage.set("theme.mode", 123); // ❌ 错误：类型 "number" 不能赋值给类型 "light" | "dark"

// 获取值 - 类型安全
const themeMode = await storage.get("theme.mode"); // 类型为 "light" | "dark" | null
const sidebarCollapsed = await storage.get("layout.sidebarCollapsed"); // 类型为 boolean | null

// 以下代码会在编译时报错
// const invalid = await storage.get("invalid.key"); // ❌ 错误：类型 "invalid.key" 不能赋值给类型 Paths<AppStorage>

// 获取所有键 - 类型安全
const keys = await storage.keys(); // 类型为 Paths<AppStorage>[]
console.log("All keys:", keys);

// 获取存储大小
const size = await storage.size();
console.log("Storage size:", size);

// 清除所有存储
await storage.clear();
```

### 使用级联存储

```typescript
import {
  KeyValueStorage,
  CascadingKeyValueStoreProvider,
  MemoryKeyValueStoreProvider,
  LocalKeyValueStoreProvider,
  RemoteKeyValueStoreProvider
} from '@cardos/key-value-store';

// 创建级联存储
const cascadingStore = new CascadingKeyValueStoreProvider([
  {
    name: 'memory',
    store: new MemoryKeyValueStoreProvider(),
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5分钟过期
  },
  {
    name: 'local',
    store: new LocalKeyValueStoreProvider(),
  },
  {
    name: 'remote',
    store: new RemoteKeyValueStoreProvider('https://api.example.com'),
  }
]);

const storage = new KeyValueStorage(cascadingStore);

// 使用存储
await storage.set("theme.mode", "dark");
const themeMode = await storage.get("theme.mode");
```

## API

### KeyValueStorage

主要的存储管理器类。

```typescript
class KeyValueStorage {
  constructor(store: KeyValueStore);
  setStore(store: KeyValueStore): void;
  get<T extends StorageValue>(key: StorageKeyPath): Promise<T | null>;
  set<T extends StorageValue>(key: StorageKeyPath, value: T): Promise<void>;
  remove(key: StorageKeyPath): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}
```

### TypedKeyValueStorage

类型安全的存储管理器类型。

```typescript
type TypedKeyValueStorage<T> = Omit<KeyValueStorage, "get" | "set" | "remove" | "clear" | "keys" | "size"> & {
  get<K extends Paths<T>>(key: K): Promise<GetValueType<T, K> | null>;
  set<K extends Paths<T>>(key: K, value: GetValueType<T, K>): Promise<void>;
  remove<K extends Paths<T>>(key: K): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<Paths<T>[]>;
  size(): Promise<number>;
};
```

### 存储提供者

#### LocalKeyValueStoreProvider

使用 localStorage 实现的本地存储提供者。

```typescript
class LocalKeyValueStoreProvider implements KeyValueStore {
  constructor();
}
```

#### MemoryKeyValueStoreProvider

使用 Map 实现的内存存储提供者。

```typescript
class MemoryKeyValueStoreProvider implements KeyValueStore {
  constructor();
}
```

#### RemoteKeyValueStoreProvider

通过 HTTP 请求实现的远程存储提供者。

```typescript
class RemoteKeyValueStoreProvider implements KeyValueStore {
  constructor(baseUrl: string);
}
```

#### CascadingKeyValueStoreProvider

实现多级缓存的级联存储提供者。

```typescript
class CascadingKeyValueStoreProvider implements KeyValueStore {
  constructor(levels: CacheLevelConfig[]);
  getStats(): Promise<Record<string, { size: number; hitCount: number; missCount: number; }>>;
  warmup(keys: string[]): Promise<void>;
}
```

### 类型定义

```typescript
interface KeyValueStore {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, value: string): Promise<void> | void;
  remove(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
  keys(): Promise<string[]> | string[];
  size(): Promise<number> | number;
}

interface CacheLevelConfig {
  name: string;
  store: KeyValueStore;
  maxSize?: number;
  ttl?: number;
  readOnly?: boolean;
}

// 类型安全的工具类型
type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${Paths<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type GetValueType<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? GetValueType<T[K], R>
    : never
  : never;
```

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT 
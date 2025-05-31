# Key-Value Storage System

A flexible key-value storage system with multi-level caching support.

## Features

- Multiple storage providers:
  - Local storage (localStorage)
  - Memory storage (Map)
  - Remote storage (HTTP)
  - Cascading storage (multi-level cache)
- Type-safe key-value storage
- Cache expiration (TTL) support
- Cache size limits
- Read-only cache levels
- Cache warming
- Cache statistics

## Installation

```bash
pnpm add @cardos/key-value-store
```

## Usage Examples

### Basic Usage

```typescript
import {
  KeyValueStorage,
  LocalKeyValueStoreProvider
} from '@cardos/key-value-store';

// Create storage instance
const store = new LocalKeyValueStoreProvider();
const storage = new KeyValueStorage(store);

// Set value
await storage.set("theme.mode", "dark");

// Get value
const themeMode = await storage.get("theme.mode");

// Remove value
await storage.remove("theme.mode");
```

### Type-Safe Storage

```typescript
import {
  KeyValueStorage,
  MemoryKeyValueStoreProvider,
  TypedKeyValueStorage
} from '@cardos/key-value-store';

// Define storage types
type AppStorage = {
  // Theme settings
  theme: {
    mode: "light" | "dark";
    name: string;
  };
  // Layout settings
  layout: {
    sidebarCollapsed: boolean;
    activityBarExpanded: boolean;
  };
  // Chat settings
  chat: {
    defaultSessionId: string | null;
  };
};

// Create type-safe storage instance
const storage = new KeyValueStorage(
  new MemoryKeyValueStoreProvider()
) as TypedKeyValueStorage<AppStorage>;

// Set values - type safe
await storage.set("theme.mode", "dark"); // ✅ Correct
await storage.set("theme.name", "default"); // ✅ Correct
await storage.set("layout.sidebarCollapsed", true); // ✅ Correct

// The following code will cause compile-time errors
// await storage.set("theme.mode", "invalid"); // ❌ Error: Type "invalid" is not assignable to type "light" | "dark"
// await storage.set("invalid.key", "value"); // ❌ Error: Type "invalid.key" is not assignable to type Paths<AppStorage>
// await storage.set("theme.mode", 123); // ❌ Error: Type "number" is not assignable to type "light" | "dark"

// Get values - type safe
const themeMode = await storage.get("theme.mode"); // Type: "light" | "dark" | null
const sidebarCollapsed = await storage.get("layout.sidebarCollapsed"); // Type: boolean | null

// The following code will cause compile-time errors
// const invalid = await storage.get("invalid.key"); // ❌ Error: Type "invalid.key" is not assignable to type Paths<AppStorage>

// Get all keys - type safe
const keys = await storage.keys(); // Type: Paths<AppStorage>[]
console.log("All keys:", keys);

// Get storage size
const size = await storage.size();
console.log("Storage size:", size);

// Clear all storage
await storage.clear();
```

### Cascading Storage

```typescript
import {
  KeyValueStorage,
  CascadingKeyValueStoreProvider,
  MemoryKeyValueStoreProvider,
  LocalKeyValueStoreProvider,
  RemoteKeyValueStoreProvider
} from '@cardos/key-value-store';

// Create cascading storage
const cascadingStore = new CascadingKeyValueStoreProvider([
  {
    name: 'memory',
    store: new MemoryKeyValueStoreProvider(),
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5 minutes expiration
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

// Use storage
await storage.set("theme.mode", "dark");
const themeMode = await storage.get("theme.mode");
```

## API

### KeyValueStorage

Main storage manager class.

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

Type-safe storage manager type.

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

### Storage Providers

#### LocalKeyValueStoreProvider

Local storage provider using localStorage.

```typescript
class LocalKeyValueStoreProvider implements KeyValueStore {
  constructor();
}
```

#### MemoryKeyValueStoreProvider

Memory storage provider using Map.

```typescript
class MemoryKeyValueStoreProvider implements KeyValueStore {
  constructor();
}
```

#### RemoteKeyValueStoreProvider

Remote storage provider using HTTP requests.

```typescript
class RemoteKeyValueStoreProvider implements KeyValueStore {
  constructor(baseUrl: string);
}
```

#### CascadingKeyValueStoreProvider

Cascading storage provider with multi-level cache.

```typescript
class CascadingKeyValueStoreProvider implements KeyValueStore {
  constructor(levels: CacheLevelConfig[]);
  getStats(): Promise<Record<string, { size: number; hitCount: number; missCount: number; }>>;
  warmup(keys: string[]): Promise<void>;
}
```

### Type Definitions

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

// Type-safe utility types
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

## Contributing

Issues and Pull Requests are welcome.

## License

MIT
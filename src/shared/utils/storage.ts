/**
 * 存储键的类型定义
 */
export type StorageKey = {
  // 侧边栏状态
  sidebar: {
    collapsed: boolean;
  };
  // 默认打开的会话
  chat: {
    defaultSessionId: string | null;
  };
  // 主题设置
  theme: {
    mode: "light" | "dark";
    themeName: string;
  };
  // 布局设置
  layout: {
    activityBarExpanded: boolean;
  };
};

/**
 * 存储键的类型
 */
export type StorageKeyType = keyof StorageKey;

/**
 * 存储键的路径类型
 */
export type StorageKeyPath = {
  [K in StorageKeyType]: {
    [P in keyof StorageKey[K]]: `${K}.${P & string}`;
  }[keyof StorageKey[K]];
}[StorageKeyType];

/**
 * 存储值的类型
 */
export type StorageValue = StorageKey[StorageKeyType][keyof StorageKey[StorageKeyType]];

/**
 * 键值对存储提供者接口
 * 定义了键值对存储的基本操作
 */
export interface KeyValueStore {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, value: string): Promise<void> | void;
  remove(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
  keys(): Promise<string[]> | string[];
  size(): Promise<number> | number;
}

/**
 * 浏览器本地存储提供者
 * 使用 localStorage 实现键值对存储
 */
export class LocalKeyValueStore implements KeyValueStore {
  private storage: Storage;

  constructor() {
    this.storage = window.localStorage;
  }

  get(key: string): string | null {
    return this.storage.getItem(key);
  }

  set(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }

  keys(): string[] {
    return Object.keys(this.storage);
  }

  size(): number {
    return this.storage.length;
  }
}

/**
 * 内存键值对存储提供者
 * 使用 Map 实现内存中的键值对存储
 */
export class MemoryKeyValueStore implements KeyValueStore {
  private store: Map<string, string>;

  constructor() {
    this.store = new Map();
  }

  get(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  size(): number {
    return this.store.size;
  }
}

/**
 * 远程键值对存储提供者
 * 通过 HTTP 请求实现远程键值对存储
 */
export class RemoteKeyValueStore implements KeyValueStore {
  private baseUrl: string;
  private cache: Map<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  async get(key: string): Promise<string | null> {
    // 先检查缓存
    if (this.cache.has(key)) {
      return this.cache.get(key) ?? null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/storage/${key}`);
      if (!response.ok) {
        return null;
      }
      const value = await response.text();
      this.cache.set(key, value);
      return value;
    } catch {
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/storage/${key}`, {
        method: 'PUT',
        body: value,
      });
      this.cache.set(key, value);
    } catch (error) {
      console.error('Failed to set remote storage:', error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/storage/${key}`, {
        method: 'DELETE',
      });
      this.cache.delete(key);
    } catch (error) {
      console.error('Failed to remove from remote storage:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/storage`, {
        method: 'DELETE',
      });
      this.cache.clear();
    } catch (error) {
      console.error('Failed to clear remote storage:', error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/storage/keys`);
      if (!response.ok) {
        return [];
      }
      return await response.json();
    } catch {
      return [];
    }
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }
}

/**
 * 缓存层级配置
 */
export interface CacheLevelConfig {
  /**
   * 缓存层级名称
   */
  name: string;
  /**
   * 键值对存储提供者
   */
  store: KeyValueStore;
  /**
   * 最大缓存项数，0表示不限制
   */
  maxSize?: number;
  /**
   * 缓存过期时间（毫秒），0表示永不过期
   */
  ttl?: number;
  /**
   * 是否只读
   */
  readOnly?: boolean;
}

/**
 * 缓存项
 */
interface CacheItem {
  value: string;
  timestamp: number;
}

/**
 * 级联键值对存储提供者
 * 实现多级缓存，数据从高层级向低层级级联
 */
export class CascadingKeyValueStore implements KeyValueStore {
  private levels: CacheLevelConfig[];
  private caches: Map<string, Map<string, CacheItem>>;

  constructor(levels: CacheLevelConfig[]) {
    if (levels.length === 0) {
      throw new Error('At least one cache level is required');
    }
    this.levels = levels;
    this.caches = new Map();
    
    // 为每个层级初始化缓存
    levels.forEach(level => {
      this.caches.set(level.name, new Map());
    });
  }

  /**
   * 获取存储值，从高层级向低层级级联查找
   */
  async get(key: string): Promise<string | null> {
    // 从最高层级开始查找
    for (let i = 0; i < this.levels.length; i++) {
      const level = this.levels[i];
      const levelCache = this.caches.get(level.name)!;

      // 1. 检查内存缓存
      const cachedItem = levelCache.get(key);
      if (cachedItem) {
        // 检查是否过期
        if (level.ttl && Date.now() - cachedItem.timestamp > level.ttl) {
          levelCache.delete(key);
          continue;
        }
        return cachedItem.value;
      }

      // 2. 检查存储提供者
      const value = await level.store.get(key);
      if (value !== null) {
        // 更新当前层级和所有更高层级的缓存
        this.cascadeUpdate(key, value, i);
        return value;
      }
    }

    return null;
  }

  /**
   * 设置存储值，从低层级向高层级级联更新
   */
  async set(key: string, value: string): Promise<void> {
    // 从最低层级开始更新
    for (let i = this.levels.length - 1; i >= 0; i--) {
      const level = this.levels[i];
      
      // 跳过只读层级
      if (level.readOnly) {
        continue;
      }

      // 更新存储提供者
      await level.store.set(key, value);
      
      // 更新内存缓存
      this.updateLevelCache(level.name, key, value);
    }
  }

  /**
   * 删除存储值，从低层级向高层级级联删除
   */
  async remove(key: string): Promise<void> {
    // 从最低层级开始删除
    for (let i = this.levels.length - 1; i >= 0; i--) {
      const level = this.levels[i];
      
      // 跳过只读层级
      if (level.readOnly) {
        continue;
      }

      // 从存储提供者中删除
      await level.store.remove(key);
      
      // 从内存缓存中删除
      this.caches.get(level.name)?.delete(key);
    }
  }

  /**
   * 清除所有缓存，从低层级向高层级级联清除
   */
  async clear(): Promise<void> {
    // 从最低层级开始清除
    for (let i = this.levels.length - 1; i >= 0; i--) {
      const level = this.levels[i];
      
      // 跳过只读层级
      if (level.readOnly) {
        continue;
      }

      // 清除存储提供者
      await level.store.clear();
      
      // 清除内存缓存
      this.caches.get(level.name)?.clear();
    }
  }

  /**
   * 获取所有键
   */
  async keys(): Promise<string[]> {
    const keySets = await Promise.all(
      this.levels.map(level => level.store.keys())
    );
    
    // 合并所有层级的键并去重
    return Array.from(new Set(keySets.flat()));
  }

  /**
   * 获取存储大小
   */
  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }

  /**
   * 级联更新指定层级及更高层级的缓存
   */
  private cascadeUpdate(key: string, value: string, startLevel: number): void {
    for (let i = startLevel; i >= 0; i--) {
      const level = this.levels[i];
      this.updateLevelCache(level.name, key, value);
    }
  }

  /**
   * 更新指定层级的缓存
   */
  private updateLevelCache(levelName: string, key: string, value: string): void {
    const level = this.levels.find(l => l.name === levelName)!;
    const levelCache = this.caches.get(levelName)!;

    // 检查缓存大小限制
    if (level.maxSize && levelCache.size >= level.maxSize) {
      // 移除最旧的项
      const oldestKey = this.findOldestKey(levelCache);
      if (oldestKey) {
        levelCache.delete(oldestKey);
      }
    }

    // 更新缓存
    levelCache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * 查找最旧的缓存项
   */
  private findOldestKey(cache: Map<string, CacheItem>): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, item] of cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<Record<string, {
    size: number;
    hitCount: number;
    missCount: number;
  }>> {
    const stats: Record<string, {
      size: number;
      hitCount: number;
      missCount: number;
    }> = {};

    for (const level of this.levels) {
      const levelCache = this.caches.get(level.name)!;
      stats[level.name] = {
        size: levelCache.size,
        hitCount: 0, // 这些值需要在get方法中统计
        missCount: 0
      };
    }

    return stats;
  }

  /**
   * 预热缓存
   * @param keys 要预热的键列表
   */
  async warmup(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get(key);
        if (value !== null) {
          // 更新所有层级的缓存
          this.cascadeUpdate(key, value, this.levels.length - 1);
        }
      })
    );
  }
}

/**
 * 键值对存储管理器
 * 用于管理应用中的键值对存储，支持多级缓存
 */
export class KeyValueStorage {
  private store: KeyValueStore;
  private cache: Map<string, unknown>;

  constructor(store: KeyValueStore) {
    this.store = store;
    this.cache = new Map();
  }

  /**
   * 设置存储提供者
   */
  public setStore(store: KeyValueStore): void {
    this.store = store;
    this.cache.clear();
  }

  /**
   * 获取存储值
   */
  public async get<T extends StorageValue>(key: StorageKeyPath): Promise<T | null> {
    // 先检查缓存
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    // 从存储中获取
    const value = await this.store.get(key);
    if (!value) {
      return null;
    }

    try {
      const parsedValue = JSON.parse(value) as T;
      // 更新缓存
      this.cache.set(key, parsedValue);
      return parsedValue;
    } catch {
      return null;
    }
  }

  /**
   * 设置存储值
   */
  public async set<T extends StorageValue>(key: StorageKeyPath, value: T): Promise<void> {
    // 更新缓存
    this.cache.set(key, value);
    // 更新存储
    await this.store.set(key, JSON.stringify(value));
  }

  /**
   * 删除存储值
   */
  public async remove(key: StorageKeyPath): Promise<void> {
    // 删除缓存
    this.cache.delete(key);
    // 删除存储
    await this.store.remove(key);
  }

  /**
   * 清除所有存储
   */
  public async clear(): Promise<void> {
    // 清除缓存
    this.cache.clear();
    // 清除存储
    await this.store.clear();
  }

  /**
   * 获取所有存储的键
   */
  public async keys(): Promise<string[]> {
    return this.store.keys();
  }

  /**
   * 获取存储大小
   */
  public async size(): Promise<number> {
    return this.store.size();
  }
}

// 导出一些常用的存储键
export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "sidebar.collapsed" as const,
  CHAT_DEFAULT_SESSION: "chat.defaultSessionId" as const,
  THEME_MODE: "theme.mode" as const,
  THEME_NAME: "theme.themeName" as const,
  ACTIVITY_BAR_EXPANDED: "layout.activityBarExpanded" as const,
} as const;

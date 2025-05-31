/**
 * 键值对存储提供者接口
 * 定义了键值对存储的基本操作
 */
export interface IKeyValueStorageProvider {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, value: string): Promise<void> | void;
  remove(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
  keys(): Promise<string[]> | string[];
  size(): Promise<number> | number;
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
  storageProvider: IKeyValueStorageProvider;
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
export interface CacheItem {
  value: string;
  timestamp: number;
}

/**
 * 存储键的类型定义
 * 使用者需要扩展这个类型来定义自己的键值结构
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StorageKey = Record<string, any>;

/**
 * 存储键的类型
 */
export type StorageKeyType = keyof StorageKey;

/**
 * 存储键的路径类型
 */
export type StorageKeyPath = string;

/**
 * 存储值的类型
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StorageValue = any; 
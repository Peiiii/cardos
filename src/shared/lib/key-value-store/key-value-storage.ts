import { KeyValueStore } from './types';

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
  public async get<T>(key: string): Promise<T | null> {
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
  public async set<T>(key: string, value: T): Promise<void> {
    // 更新缓存
    this.cache.set(key, value);
    // 更新存储
    await this.store.set(key, JSON.stringify(value));
  }

  /**
   * 删除存储值
   */
  public async remove(key: string): Promise<void> {
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
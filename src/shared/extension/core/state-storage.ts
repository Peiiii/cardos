import { ExtensionStateStorage, TypedKey } from '../types';

/**
 * 内存状态存储实现
 * 注意：这是一个简单的内存存储，实际项目中应使用持久化存储
 */
export class MemoryStateStorage implements ExtensionStateStorage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _storage: Map<string, unknown> = new Map();
  private _prefix: string;

  /**
   * 创建内存状态存储
   * @param extensionId 扩展ID，用于创建隔离的存储空间
   */
  constructor(extensionId: string) {
    this._prefix = `ext.${extensionId}.`;
  }

  /**
   * 获取存储键的完整名称
   * @param key 键名或TypedKey
   * @returns 带前缀的完整键名
   */
  private _getFullKey<T>(key: string | TypedKey<T>): string {
    const keyString = typeof key === 'string' ? key : key.name;
    return `${this._prefix}${keyString}`;
  }

  /**
   * 获取存储值
   * @param key 键名或类型安全的键
   * @param defaultValue 默认值（可选）
   * @returns 存储值或默认值
   */
  async get<T>(key: string | TypedKey<T>, defaultValue?: T): Promise<T | undefined> {
    const fullKey = this._getFullKey(key);
    if (this._storage.has(fullKey)) {
      return this._storage.get(fullKey) as T;
    }
    return defaultValue;
  }

  /**
   * 设置存储值
   * @param key 键名或类型安全的键
   * @param value 值
   */
  async set<T>(key: string | TypedKey<T>, value: T): Promise<void> {
    const fullKey = this._getFullKey(key);
    this._storage.set(fullKey, value);
  }

  /**
   * 删除存储值
   * @param key 键名或类型安全的键
   */
  async delete<T>(key: string | TypedKey<T>): Promise<void> {
    const fullKey = this._getFullKey(key);
    this._storage.delete(fullKey);
  }

  /**
   * 检查键是否存在
   * @param key 键名或类型安全的键
   * @returns 是否存在
   */
  async has<T>(key: string | TypedKey<T>): Promise<boolean> {
    const fullKey = this._getFullKey(key);
    return this._storage.has(fullKey);
  }

  /**
   * 获取所有键
   * @returns 键名数组
   */
  keys(): string[] {
    const result: string[] = [];
    for (const key of this._storage.keys()) {
      if (key.startsWith(this._prefix)) {
        result.push(key.substring(this._prefix.length));
      }
    }
    return result;
  }

  /**
   * 清空此扩展的所有存储
   */
  async clear(): Promise<void> {
    // 只清除此扩展的存储项
    for (const key of this._storage.keys()) {
      if (key.startsWith(this._prefix)) {
        this._storage.delete(key);
      }
    }
  }

  /**
   * 释放资源
   */
  dispose(): void {
    // 内存存储不需要特别释放资源
  }
}

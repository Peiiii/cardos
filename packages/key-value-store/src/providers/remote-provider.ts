import { KeyValueStore } from '../types';

/**
 * 远程键值对存储提供者
 * 通过 HTTP 请求实现远程键值对存储
 */
export class RemoteKeyValueStoreProvider implements KeyValueStore {
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
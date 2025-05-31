import { IKeyValueStorageProvider } from '../types';

/**
 * 浏览器本地存储提供者
 * 使用 localStorage 实现键值对存储
 */
export class LocalKeyValueStorageProvider implements IKeyValueStorageProvider {
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
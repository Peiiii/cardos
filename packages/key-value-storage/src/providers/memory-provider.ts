import { IKeyValueStorageProvider } from '../types';

/**
 * 内存键值对存储提供者
 * 使用 Map 实现内存中的键值对存储
 */
export class MemoryKeyValueStorageProvider implements IKeyValueStorageProvider {
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
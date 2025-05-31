import { CacheItem, CacheLevelConfig, IKeyValueStorageProvider } from '../types';

/**
 * 级联键值对存储提供者
 * 实现多级缓存，数据从高层级向低层级级联
 */
export class CascadingKeyValueStorageProvider implements IKeyValueStorageProvider {
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
      const value = await level.storageProvider.get(key);
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
      await level.storageProvider.set(key, value);
      
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
      await level.storageProvider.remove(key);
      
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
      await level.storageProvider.clear();
      
      // 清除内存缓存
      this.caches.get(level.name)?.clear();
    }
  }

  /**
   * 获取所有键
   */
  async keys(): Promise<string[]> {
    const keySets = await Promise.all(
      this.levels.map(level => level.storageProvider.keys())
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
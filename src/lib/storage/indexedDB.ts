/**
 * IndexedDB存储适配器
 * 实现基于IndexedDB的本地存储功能
 */

export class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;
  private stores: string[];

  /**
   * 创建IndexedDB存储适配器
   * @param dbName 数据库名称
   * @param version 数据库版本
   * @param stores 存储对象名称数组
   */
  constructor(dbName: string, version: number = 1, stores: string[] = ['cards']) {
    this.dbName = dbName;
    this.version = version;
    this.stores = stores;
  }

  /**
   * 初始化数据库连接
   * @returns Promise<void>
   */
  async init(): Promise<void> {
    if (this.db) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.version);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // 创建对象存储
          this.stores.forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };

        request.onerror = (event) => {
          reject(`IndexedDB error: ${(event.target as IDBOpenDBRequest).error}`);
        };
      } catch (error) {
        reject(`IndexedDB initialization error: ${error}`);
      }
    });
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * 获取对象存储
   * @param storeName 存储对象名称
   * @param mode 访问模式
   * @returns IDBObjectStore
   */
  private getObjectStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }

    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  /**
   * 添加或更新项
   * @param storeName 存储对象名称
   * @param item 要存储的项
   * @returns Promise<T>
   */
  async put<T>(storeName: string, item: T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        const store = this.getObjectStore(storeName, 'readwrite');
        const request = store.put(item);

        request.onsuccess = () => {
          resolve(item);
        };

        request.onerror = (event) => {
          reject(`Error storing item: ${(event.target as IDBRequest).error}`);
        };
      } catch (error) {
        reject(`Put operation error: ${error}`);
      }
    });
  }

  /**
   * 获取项
   * @param storeName 存储对象名称
   * @param id 项ID
   * @returns Promise<T | null>
   */
  async get<T>(storeName: string, id: string): Promise<T | null> {
    return new Promise<T | null>((resolve, reject) => {
      try {
        const store = this.getObjectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = (event) => {
          reject(`Error getting item: ${(event.target as IDBRequest).error}`);
        };
      } catch (error) {
        reject(`Get operation error: ${error}`);
      }
    });
  }

  /**
   * 获取所有项
   * @param storeName 存储对象名称
   * @returns Promise<T[]>
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      try {
        const store = this.getObjectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          reject(`Error getting all items: ${(event.target as IDBRequest).error}`);
        };
      } catch (error) {
        reject(`GetAll operation error: ${error}`);
      }
    });
  }

  /**
   * 删除项
   * @param storeName 存储对象名称
   * @param id 项ID
   * @returns Promise<void>
   */
  async delete(storeName: string, id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const store = this.getObjectStore(storeName, 'readwrite');
        const request = store.delete(id);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(`Error deleting item: ${(event.target as IDBRequest).error}`);
        };
      } catch (error) {
        reject(`Delete operation error: ${error}`);
      }
    });
  }

  /**
   * 清空存储对象
   * @param storeName 存储对象名称
   * @returns Promise<void>
   */
  async clear(storeName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const store = this.getObjectStore(storeName, 'readwrite');
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(`Error clearing store: ${(event.target as IDBRequest).error}`);
        };
      } catch (error) {
        reject(`Clear operation error: ${error}`);
      }
    });
  }

  /**
   * 使用游标遍历所有项
   * @param storeName 存储对象名称
   * @param callback 回调函数
   * @returns Promise<void>
   */
  async forEach<T>(storeName: string, callback: (item: T) => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const store = this.getObjectStore(storeName);
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
          if (cursor) {
            callback(cursor.value);
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = (event) => {
          reject(`Error in cursor: ${(event.target as IDBRequest).error}`);
        };
      } catch (error) {
        reject(`Cursor operation error: ${error}`);
      }
    });
  }

  /**
   * 过滤项
   * @param storeName 存储对象名称
   * @param predicate 过滤函数
   * @returns Promise<T[]>
   */
  async filter<T>(storeName: string, predicate: (item: T) => boolean): Promise<T[]> {
    const results: T[] = [];
    await this.forEach<T>(storeName, (item) => {
      if (predicate(item)) {
        results.push(item);
      }
    });
    return results;
  }

  /**
   * 批量添加项
   * @param storeName 存储对象名称
   * @param items 项数组
   * @returns Promise<T[]>
   */
  async bulkPut<T>(storeName: string, items: T[]): Promise<T[]> {
    const store = this.getObjectStore(storeName, 'readwrite');
    
    // 创建Promise数组
    const promises = items.map((item) => {
      return new Promise<T>((resolve, reject) => {
        const request = store.put(item);
        
        request.onsuccess = () => {
          resolve(item);
        };
        
        request.onerror = (event) => {
          reject(`Error storing item: ${(event.target as IDBRequest).error}`);
        };
      });
    });
    
    // 等待所有Promise完成
    return Promise.all(promises);
  }

  /**
   * 批量删除项
   * @param storeName 存储对象名称
   * @param ids ID数组
   * @returns Promise<string[]>
   */
  async bulkDelete(storeName: string, ids: string[]): Promise<string[]> {
    const store = this.getObjectStore(storeName, 'readwrite');
    
    // 创建Promise数组
    const promises = ids.map((id) => {
      return new Promise<string>((resolve, reject) => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve(id);
        };
        
        request.onerror = (event) => {
          reject(`Error deleting item: ${(event.target as IDBRequest).error}`);
        };
      });
    });
    
    // 等待所有Promise完成
    return Promise.all(promises);
  }
}

// 导出默认实例
export default IndexedDBStorage; 
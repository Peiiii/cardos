import { DataProvider } from "./types";

export interface IndexedDBOptions {
  dbName?: string;
  version?: number;
  storeName?: string;
}

export class IndexedDBProvider<T extends { id: string }> implements DataProvider<T> {
  private db: IDBDatabase | null = null;
  private readonly dbName: string;
  private readonly storeName: string;
  private readonly version: number;

  constructor(
    readonly storageKey: string,
    options: IndexedDBOptions = {}
  ) {
    this.dbName = options.dbName || 'app-db';
    this.storeName = options.storeName || storageKey;
    this.version = options.version || 1;
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  private async getStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.initDB();
    }
    const transaction = this.db!.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }

  async list(): Promise<T[]> {
    const store = await this.getStore();
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(id: string): Promise<T> {
    const store = await this.getStore();
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => {
        if (!request.result) {
          reject(new Error('Item not found'));
        } else {
          resolve(request.result);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const store = await this.getStore('readwrite');
    const item = { ...data, id: crypto.randomUUID() } as T;
    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  async createMany(dataArray: Omit<T, 'id'>[]): Promise<T[]> {
    const store = await this.getStore('readwrite');
    const items = dataArray.map(data => ({ ...data, id: crypto.randomUUID() } as T));
    
    return new Promise((resolve, reject) => {
      const requests = items.map(item => store.add(item));
      let completed = 0;
      let hasError = false;

      requests.forEach((request) => {
        request.onsuccess = () => {
          completed++;
          if (completed === requests.length && !hasError) {
            resolve(items);
          }
        };
        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      });
    });
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          reject(new Error('Item not found'));
          return;
        }

        const updatedItem = { ...item, ...data };
        const putRequest = store.put(updatedItem);
        putRequest.onsuccess = () => resolve(updatedItem);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async delete(id: string): Promise<void> {
    const store = await this.getStore('readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
} 
import { v4 as uuidv4 } from 'uuid';
import { SmartCard, SmartCardCreateParams, SmartCardQueryParams, SmartCardUpdateParams } from '../../types/smart-card';

/**
 * 卡片存储服务接口
 */
export interface CardStorageService {
  /**
   * 获取单个卡片
   * @param id 卡片ID
   */
  getCard(id: string): Promise<SmartCard | null>;
  
  /**
   * 查询卡片列表
   * @param params 查询参数
   */
  queryCards(params?: SmartCardQueryParams): Promise<SmartCard[]>;
  
  /**
   * 创建卡片
   * @param params 创建参数
   */
  createCard(params: SmartCardCreateParams): Promise<SmartCard>;
  
  /**
   * 更新卡片
   * @param id 卡片ID
   * @param params 更新参数
   */
  updateCard(id: string, params: SmartCardUpdateParams): Promise<SmartCard>;
  
  /**
   * 删除卡片
   * @param id 卡片ID
   */
  deleteCard(id: string): Promise<boolean>;
  
  /**
   * 批量删除卡片
   * @param ids 卡片ID列表
   */
  batchDeleteCards(ids: string[]): Promise<boolean>;
  
  /**
   * 清空所有卡片
   */
  clearCards(): Promise<boolean>;
}

/**
 * IndexedDB卡片存储服务实现
 */
export class IndexedDBCardStorage implements CardStorageService {
  private dbName = 'cardos';
  private storeName = 'cards';
  private version = 1;
  private db: IDBDatabase | null = null;
  
  /**
   * 初始化数据库连接
   */
  private async initDb(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }
  
  /**
   * 获取单个卡片
   * @param id 卡片ID
   */
  async getCard(id: string): Promise<SmartCard | null> {
    const db = await this.initDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);
      
      request.onerror = () => {
        reject(new Error(`Failed to get card with id ${id}`));
      };
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }
  
  /**
   * 查询卡片列表
   * @param params 查询参数
   */
  async queryCards(params: SmartCardQueryParams = {}): Promise<SmartCard[]> {
    const db = await this.initDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onerror = () => {
        reject(new Error('Failed to query cards'));
      };
      
      request.onsuccess = () => {
        let cards = request.result || [];
        
        // 应用过滤条件
        if (params.title) {
          const titleLower = params.title.toLowerCase();
          cards = cards.filter(card => 
            card.title.toLowerCase().includes(titleLower)
          );
        }
        
        if (params.content) {
          const contentLower = params.content.toLowerCase();
          cards = cards.filter(card => 
            card.htmlContent.toLowerCase().includes(contentLower)
          );
        }
        
        if (params.tags && params.tags.length > 0) {
          cards = cards.filter(card => 
            params.tags!.some(tag => card.metadata.tags?.includes(tag))
          );
        }
        
        if (params.onlyFavorites) {
          cards = cards.filter(card => card.metadata.isFavorite);
        }
        
        // 应用排序
        const sortBy = params.sortBy || 'updatedAt';
        const sortDirection = params.sortDirection || 'desc';
        
        cards.sort((a, b) => {
          const aValue = a[sortBy as keyof SmartCard];
          const bValue = b[sortBy as keyof SmartCard];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          }
          
          // 处理数字类型
          const aNum = Number(aValue);
          const bNum = Number(bValue);
          
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        });
        
        // 应用分页
        if (params.offset !== undefined || params.limit !== undefined) {
          const offset = params.offset || 0;
          const limit = params.limit || cards.length;
          cards = cards.slice(offset, offset + limit);
        }
        
        resolve(cards);
      };
    });
  }
  
  /**
   * 创建卡片
   * @param params 创建参数
   */
  async createCard(params: SmartCardCreateParams): Promise<SmartCard> {
    const db = await this.initDb();
    const now = Date.now();
    
    const card: SmartCard = {
      id: uuidv4(),
      ...params,
      createdAt: now,
      updatedAt: now,
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(card);
      
      request.onerror = () => {
        reject(new Error('Failed to create card'));
      };
      
      request.onsuccess = () => {
        resolve(card);
      };
    });
  }
  
  /**
   * 更新卡片
   * @param id 卡片ID
   * @param params 更新参数
   */
  async updateCard(id: string, params: SmartCardUpdateParams): Promise<SmartCard> {
    const db = await this.initDb();
    const card = await this.getCard(id);
    
    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }
    
    const updatedCard: SmartCard = {
      ...card,
      ...params,
      id, // 确保ID不变
      updatedAt: Date.now(),
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(updatedCard);
      
      request.onerror = () => {
        reject(new Error(`Failed to update card with id ${id}`));
      };
      
      request.onsuccess = () => {
        resolve(updatedCard);
      };
    });
  }
  
  /**
   * 删除卡片
   * @param id 卡片ID
   */
  async deleteCard(id: string): Promise<boolean> {
    const db = await this.initDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      
      request.onerror = () => {
        reject(new Error(`Failed to delete card with id ${id}`));
      };
      
      request.onsuccess = () => {
        resolve(true);
      };
    });
  }
  
  /**
   * 批量删除卡片
   * @param ids 卡片ID列表
   */
  async batchDeleteCards(ids: string[]): Promise<boolean> {
    const db = await this.initDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      let successCount = 0;
      
      ids.forEach((id) => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          successCount++;
          
          if (successCount === ids.length) {
            resolve(true);
          }
        };
        
        request.onerror = () => {
          reject(new Error(`Failed to delete some cards`));
        };
      });
      
      // 如果没有ID，直接返回成功
      if (ids.length === 0) {
        resolve(true);
      }
    });
  }
  
  /**
   * 清空所有卡片
   */
  async clearCards(): Promise<boolean> {
    const db = await this.initDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onerror = () => {
        reject(new Error('Failed to clear cards'));
      };
      
      request.onsuccess = () => {
        resolve(true);
      };
    });
  }
}

// 导出单例实例
export const cardStorage = new IndexedDBCardStorage(); 
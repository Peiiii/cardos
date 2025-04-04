import {
  SmartCard,
  SmartCardCreateParams,
  SmartCardQueryParams,
  SmartCardUpdateParams,
} from "@/types/smart-card";
import { cardStorage, CardStorageService } from "./storage";

/**
 * 卡片服务
 * 提供卡片的CRUD操作和高级功能
 */
class CardService {
  private storage: CardStorageService;

  constructor(storage: CardStorageService) {
    this.storage = storage;
  }

  /**
   * 获取单个卡片
   */
  async getCard(id: string): Promise<SmartCard | null> {
    return this.storage.getCard(id);
  }

  /**
   * 查询卡片列表
   */
  async queryCards(params?: SmartCardQueryParams): Promise<SmartCard[]> {
    return this.storage.queryCards(params);
  }

  /**
   * 创建卡片
   */
  async createCard(params: SmartCardCreateParams): Promise<SmartCard> {
    return this.storage.createCard(params);
  }

  /**
   * 更新卡片
   */
  async updateCard(
    id: string,
    params: SmartCardUpdateParams
  ): Promise<SmartCard> {
    return this.storage.updateCard(id, params);
  }

  /**
   * 删除卡片
   */
  async deleteCard(id: string): Promise<boolean> {
    return this.storage.deleteCard(id);
  }

  /**
   * 批量删除卡片
   */
  async batchDeleteCards(ids: string[]): Promise<boolean> {
    return this.storage.batchDeleteCards(ids);
  }

  /**
   * 清空所有卡片
   */
  async clearCards(): Promise<boolean> {
    return this.storage.clearCards();
  }

  /**
   * 切换卡片收藏状态
   */
  async toggleFavorite(id: string): Promise<SmartCard> {
    const card = await this.getCard(id);

    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }

    const isFavorite = card.metadata.isFavorite || false;

    return this.updateCard(id, {
      metadata: {
        ...card.metadata,
        isFavorite: !isFavorite,
      },
    });
  }

  /**
   * 添加标签到卡片
   */
  async addTag(id: string, tag: string): Promise<SmartCard> {
    const card = await this.getCard(id);

    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }

    const tags = card.metadata.tags || [];

    if (tags.includes(tag)) {
      return card; // 标签已存在，无需添加
    }

    return this.updateCard(id, {
      metadata: {
        ...card.metadata,
        tags: [...tags, tag],
      },
    });
  }

  /**
   * 从卡片中移除标签
   */
  async removeTag(id: string, tag: string): Promise<SmartCard> {
    const card = await this.getCard(id);

    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }

    const tags = card.metadata.tags || [];

    if (!tags.includes(tag)) {
      return card; // 标签不存在，无需移除
    }

    return this.updateCard(id, {
      metadata: {
        ...card.metadata,
        tags: tags.filter((t) => t !== tag),
      },
    });
  }

  /**
   * 获取所有标签
   */
  async getAllTags(): Promise<string[]> {
    const cards = await this.queryCards();
    const tagSet = new Set<string>();

    cards.forEach((card) => {
      const tags = card.metadata.tags || [];
      tags.forEach((tag) => {
        tagSet.add(tag);
      });
    });

    return Array.from(tagSet);
  }

  /**
   * 关联两个卡片
   */
  async relateCards(sourceId: string, targetId: string): Promise<void> {
    const sourceCard = await this.getCard(sourceId);
    const targetCard = await this.getCard(targetId);

    if (!sourceCard || !targetCard) {
      throw new Error("One or both cards not found");
    }

    const sourceRelatedIds = sourceCard.metadata.relatedCardIds || [];
    const targetRelatedIds = targetCard.metadata.relatedCardIds || [];

    // 如果已经关联，则无需操作
    if (
      sourceRelatedIds.includes(targetId) &&
      targetRelatedIds.includes(sourceId)
    ) {
      return;
    }

    // 更新源卡片的关联
    if (!sourceRelatedIds.includes(targetId)) {
      await this.updateCard(sourceId, {
        metadata: {
          ...sourceCard.metadata,
          relatedCardIds: [...sourceRelatedIds, targetId],
        },
      });
    }

    // 更新目标卡片的关联
    if (!targetRelatedIds.includes(sourceId)) {
      await this.updateCard(targetId, {
        metadata: {
          ...targetCard.metadata,
          relatedCardIds: [...targetRelatedIds, sourceId],
        },
      });
    }
  }

  /**
   * 取消两个卡片的关联
   */
  async unrelateCards(sourceId: string, targetId: string): Promise<void> {
    const sourceCard = await this.getCard(sourceId);
    const targetCard = await this.getCard(targetId);

    if (!sourceCard || !targetCard) {
      throw new Error("One or both cards not found");
    }

    const sourceRelatedIds = sourceCard.metadata.relatedCardIds || [];
    const targetRelatedIds = targetCard.metadata.relatedCardIds || [];

    // 更新源卡片的关联
    if (sourceRelatedIds.includes(targetId)) {
      await this.updateCard(sourceId, {
        metadata: {
          ...sourceCard.metadata,
          relatedCardIds: sourceRelatedIds.filter((id) => id !== targetId),
        },
      });
    }

    // 更新目标卡片的关联
    if (targetRelatedIds.includes(sourceId)) {
      await this.updateCard(targetId, {
        metadata: {
          ...targetCard.metadata,
          relatedCardIds: targetRelatedIds.filter((id) => id !== sourceId),
        },
      });
    }
  }

  /**
   * 获取卡片的相关卡片
   */
  async getRelatedCards(id: string): Promise<SmartCard[]> {
    const card = await this.getCard(id);

    if (!card) {
      throw new Error(`Card with id ${id} not found`);
    }

    const relatedIds = card.metadata.relatedCardIds || [];

    if (relatedIds.length === 0) {
      return [];
    }

    const relatedCards = await Promise.all(
      relatedIds.map((relatedId) => this.getCard(relatedId))
    );

    // 过滤掉可能不存在的卡片
    return relatedCards.filter((card): card is SmartCard => card !== null);
  }
}

// 导出单例实例
export const cardService = new CardService(cardStorage);

// 导出所有需要的类型
export type {
  SmartCard,
  SmartCardCreateParams,
  SmartCardQueryParams,
  SmartCardUpdateParams,
} from "@/types/smart-card";

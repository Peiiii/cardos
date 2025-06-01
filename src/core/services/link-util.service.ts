export class LinkUtilService {
  // 首页
  public home(): string {
    return "/";
  }

  // 聊天页面
  public pathOfChat(): string {
    return "/chat";
  }

  // 我的卡片列表页面
  public pathOfMyCards(): string {
    return "/my-cards";
  }

  public pathOfCard(cardId: string): string {
    return `/card/${cardId}`;
  }

  // 卡片创建页面
  public pathOfCardCreate(): string {
    return "/create";
  }
  
  // 卡片详情页面
  public pathOfCardView(cardId: string): string {
    return this.pathOfCard(cardId);
  }

  // 卡片编辑页面
  public pathOfCardEdit(cardId: string): string {
    return `${this.pathOfCard(cardId)}/edit`;
  }

  // 设置页面
  public pathOfSettings(): string {
    return "/settings";
  }

  // 卡片游乐场
  public pathOfCardPlayground(): string {
    return "/card-playground";
  }
}

export const linkUtilService = new LinkUtilService();
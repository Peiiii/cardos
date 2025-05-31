import { SmartCard } from "@/shared/types/smart-card";

// 示例对话列表
export const exampleConversations = [
  { 
    id: '1', 
    title: '如何烹饪意大利面', 
    timestamp: Date.now() - 3600000 // 1小时前
  },
  { 
    id: '2', 
    title: '学习React的最佳实践', 
    timestamp: Date.now() - 86400000 // 1天前
  },
  { 
    id: '3', 
    title: '旅行计划指南', 
    timestamp: Date.now() - 259200000 // 3天前
  },
];

// 初始消息
export const initialMessages = [
  { 
    id: '1', 
    content: '你好，我想知道如何制作简单的意大利面。', 
    isUser: true, 
    timestamp: Date.now() - 3600000 // 1小时前
  },
  { 
    id: '2', 
    content: '当然可以帮你！意大利面的基本步骤很简单：\n\n1. 烧一锅水，水开后加盐\n2. 放入意大利面，按照包装上的时间煮\n3. 同时准备酱汁\n4. 面煮好后沥干水分\n5. 拌入酱汁即可', 
    isUser: false, 
    timestamp: Date.now() - 3590000 // 1小时前
  },
  { 
    id: '3', 
    content: '我应该用什么样的酱汁呢？', 
    isUser: true, 
    timestamp: Date.now() - 3580000 // 1小时前
  },
];

// 初始卡片
export const initialCard:SmartCard = { 
  id: '1', 
  title: '意大利面基础食谱', 
  htmlContent: '意大利面是一种简单美味的主食，你可以按照以下步骤准备：\n\n- 烧开水并加盐\n- 放入意大利面烹煮8-10分钟\n- 准备酱汁（番茄酱汁、白酱或青酱）\n- 沥干面条\n- 加入酱汁拌匀\n- 撒上帕玛森奶酪和香草点缀\n\n小贴士：\n- 加入适量的盐使意大利面更有味道\n- 煮面的水量要足够，一般是面量的10倍\n- 面条稍硬（al dente）的口感最佳\n- 可以留一些面汤，帮助酱汁更好地融合', 
  createdAt: Date.now() - 3590000,
  updatedAt: Date.now() - 3590000,
  metadata: {
    tags: ['意大利面', '基础食谱'],
    isFavorite: false,
    author: 'John Doe',
  }
}; 
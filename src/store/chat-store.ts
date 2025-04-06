import { create } from "zustand";

interface ChatViewState {
  // 当前会话信息
  currentConversationId: string | null;
  currentCardId: string | null;

  // 视图状态
  isMessagesPanelOpen: boolean;
  isCardPreviewOpen: boolean;

  // Actions
  setCurrentConversationId: (id: string | null) => void;
  setCurrentCard: (id: string | null) => void;
  toggleMessagesPanel: () => void;
  toggleCardPreview: () => void;

  // 重置状态
  reset: () => void;
}

const initialState = {
  currentConversationId: null,
  currentCardId: null,
  isMessagesPanelOpen: true,
  isCardPreviewOpen: true,
};

export const chatStore = create<ChatViewState>()(
  // persist(
  (set) => ({
    ...initialState,

    // Actions
    setCurrentConversationId: (id) => set({ currentConversationId: id }),

    setCurrentCard: (id) => set({ currentCardId: id }),

    toggleMessagesPanel: () =>
      set((state) => ({ isMessagesPanelOpen: !state.isMessagesPanelOpen })),

    toggleCardPreview: () =>
      set((state) => ({ isCardPreviewOpen: !state.isCardPreviewOpen })),

    // 重置所有状态
    reset: () => set(initialState),
  })
  // {
  //   name: 'chat-storage',
  //   // 只持久化部分状态
  //   partialize: (state) => ({
  //     currentConversationId: state.currentConversationId,
  //     currentCardId: state.currentCardId,
  //   }),
  // }
  // )
);

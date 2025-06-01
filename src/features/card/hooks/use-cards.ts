import { cardResource } from "@/features/card/resources/card-resource";
import { useCRUDResource } from "@/features/chat/hooks/use-crud-resource";
import { cardService } from "@/features/card/services/card";
import { SmartCard } from "@/shared/types/smart-card";

export function useCards(conversationId?: string, options?: {
  reload?: boolean;
}) {
  const { reload } = options || {};
  return useCRUDResource<SmartCard>(
    cardResource,
    {
      create: (item: Omit<SmartCard, "id" | "createdAt" | "updatedAt">) =>
        cardService.createCard(item),
      createMany: (items: Omit<SmartCard, "id" | "createdAt" | "updatedAt">[]) =>
        Promise.all(items.map(item => cardService.createCard(item))),
      read: async (id: string) => {
        const card = await cardService.getCard(id);
        if (!card) {
          throw new Error(`Card with id ${id} not found`);
        }
        return card;
      },
      update: (id: string, data: Partial<SmartCard>) => cardService.updateCard(id, data),
      delete: async (id: string) => {
        await cardService.deleteCard(id);
      },
      list: () => cardService.queryCards({ conversationId }),
    },
    {
      onError: (error: Error) => {
        console.error("Card operation failed:", error);
      },
      reload,
    }
  );
}

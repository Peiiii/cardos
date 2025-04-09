import { cardResource } from "@/features/card/resources/card-resource";
import { useCRUDResource } from "@/features/chat/hooks/use-crud-resource";
import { cardService } from "../services/card-service";
import { Card } from "../types/card";

export function useCards(conversationId: string) {
  return useCRUDResource<Card>(
    cardResource,
    {
      create: (item: Omit<Card, "id">) =>
        cardService.create(item, conversationId),
      createMany: (items: Omit<Card, "id">[]) =>
        cardService.createMany(items, conversationId),
      read: (id: string) => cardService.get(id),
      update: (id: string, data: Partial<Card>) => cardService.update(id, data),
      delete: (id: string) => cardService.delete(id),
      list: () => cardService.list(conversationId),
    },
    {
      onError: (error: Error) => {
        console.error("Card operation failed:", error);
      },
    }
  );
}

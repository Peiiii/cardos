import { cardService } from "@/features/card/services/card";
import { getOrCreateResource, useResourceState } from "@/shared/lib/resource";
import { SmartCard } from "@/shared/types/smart-card";
import { useEffect } from "react";

export function useCard(
  cardId: string | undefined,
  options?: {
    reload?: boolean;
  }
) {
  const { reload } = options || {};
  const resource = getOrCreateResource<SmartCard>(`card:${cardId}`, {
    fetcher: async () => {
      if (!cardId) {
        throw new Error("卡片ID不存在");
      }
      const card = await cardService.getCard(cardId);
      if (!card) {
        throw new Error("未找到卡片");
      }
      return card;
    },
  });

  const { data, isLoading, error } = useResourceState(resource);

  useEffect(() => {
    if (reload) {
      resource.reload();
    }
  }, [reload, resource]);

  return {
    card: data,
    isLoading,
    error,
    resource
  };
}

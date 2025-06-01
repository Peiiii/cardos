import { linkUtilService } from "@/core/services/link-util.service";
import { useCard as useSmartCard } from "@/features/card/hooks/use-card";
import { cardService } from "@/features/card/services/card";
import { PageLayout } from "@/shared/components/layout/page/page-layout";
import { SmartCardUpdateParams } from "@/shared/types/smart-card";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CardEditorContainer } from "../components/card-editor-container";
import { Card, CardMetadata } from "../types/card";

// Helper function to safely convert to ISO string
function toISOStringSafe(dateValue: unknown): string {
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }
  if (typeof dateValue === "number") {
    return new Date(dateValue).toISOString();
  }
  if (typeof dateValue === "string" && dateValue) {
    // Attempt to parse string dates, if not valid, fallback to current date
    const parsedDate = new Date(dateValue);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }
  return new Date().toISOString(); // Fallback for undefined or invalid non-Date, non-number, non-string values
}

export default function CardEditPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const {
    card: initialFetchedCardData,
    isLoading: initialLoading,
    error: initialError,
  } = useSmartCard(cardId, {
    reload: true,
  });
  const [saveError, setSaveError] = useState<string | null>(null);

  const initialCardData: Card | undefined = initialFetchedCardData
    ? {
        id: String(initialFetchedCardData.id || cardId || ""),
        title: String(initialFetchedCardData.title || ""),
        htmlContent: String(initialFetchedCardData.htmlContent || ""),
        userId: String(
          (initialFetchedCardData as unknown as Record<string, unknown>)
            .userId || "placeholder-userId"
        ),
        createdAt: toISOStringSafe(initialFetchedCardData.createdAt),
        updatedAt: toISOStringSafe(initialFetchedCardData.updatedAt),
        metadata: initialFetchedCardData.metadata
          ? (initialFetchedCardData.metadata as CardMetadata)
          : {
              tags: [],
              isFavorite: false,
              author: "System",
              generatedAt: Date.now(),
            },
        tags: (initialFetchedCardData.metadata as CardMetadata)?.tags || [],
        category: String(
          (initialFetchedCardData as unknown as Record<string, unknown>)
            .category || "general"
        ),
        status:
          ((initialFetchedCardData as unknown as Record<string, unknown>)
            .status as Card["status"]) || "draft",
      }
    : undefined;

  const handleSave = async (data: { title: string; htmlContent: string }) => {
    if (!cardId) return;
    // setIsSaving(true);
    setSaveError(null);
    try {
      const updatedFields: SmartCardUpdateParams = {
        title: data.title,
        htmlContent: data.htmlContent,
        metadata: initialFetchedCardData?.metadata || {},
      };
      console.log("[handleSave] ", {
        cardId,
        data,
        updatedFields,
      });
      await cardService.updateCard(cardId, updatedFields);
    } catch (err) {
      console.error("Failed to save card:", err);
      setSaveError("保存失败，请重试。");
    } finally {
      // setIsSaving(false);
    }
  };

  return (
    <PageLayout
      title={
        initialLoading
          ? "加载中..."
          : `编辑: ${initialCardData?.title || "新卡片"}`
      }
      error={initialError?.message || saveError}
      loading={initialLoading}
      className="p-6 m-0 flex flex-col h-screen max-h-screen overflow-hidden relative"
    >
      <CardEditorContainer
        initialCard={initialCardData}
        isLoading={initialLoading}
        isSaving={false}
        onSave={handleSave}
        onCancel={() => navigate(linkUtilService.pathOfCard(cardId!))}
        showLastUpdated={true}
      />
    </PageLayout>
  );
}

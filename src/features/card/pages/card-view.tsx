import { linkUtilService } from "@/core/services/link-util.service";
import { useCard } from "@/features/card/hooks/use-card";
import { PageLayout } from "@/shared/components/layout/page/page-layout";
import { Button } from "@/shared/components/ui/button";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { card, isLoading, error } = useCard(cardId, { reload: true });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleBack = () => {
    navigate(linkUtilService.pathOfMyCards());
  };

  const handleEdit = () => {
    if (cardId) {
      navigate(linkUtilService.pathOfCardEdit(cardId));
    }
  };

  // TODO: Future iframe communication logic can be added here or in a separate service.
  // Keep iframeRef for potential future use.

  return (
    <PageLayout
      title={card?.title || "卡片详情"}
      error={error?.message}
      loading={isLoading}
      className="p-6 flex flex-col h-full"
    >
      {card && (
        <div className="flex flex-col flex-grow max-w-full mx-auto w-full">
          <div className="mb-4 flex justify-between items-center">
            <Button variant="outline" onClick={handleBack}>
              返回列表
            </Button>
            <Button variant="default" onClick={handleEdit}>
              编辑卡片
            </Button>
          </div>
          <div className="flex-grow w-full h-full border rounded-md overflow-hidden">
            <iframe
              ref={iframeRef}
              srcDoc={card.htmlContent}
              title={card.title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin" // Adjust sandbox as needed
            />
          </div>
        </div>
      )}
      {!card && !isLoading && !error && (
        <div className="text-center text-muted-foreground">
          <p>无法加载卡片信息。</p>
        </div>
      )}
    </PageLayout>
  );
}

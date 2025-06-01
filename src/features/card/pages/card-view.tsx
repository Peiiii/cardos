import { useParams, useNavigate } from 'react-router-dom';
import { CardPreviewItem } from '@/features/card/components/card-preview-item';
import { useCard } from '@/features/card/hooks/use-card';
import { PageLayout } from '@/shared/components/layout/page/page-layout';
import { Button } from '@/shared/components/ui/button';
import { linkUtilService } from '@/core/services/link-util.service';

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { card, isLoading, error } = useCard(cardId);

  const handleBack = () => {
    navigate(linkUtilService.pathOfCards());
  };

  return (
    <PageLayout
      title="卡片详情"
      error={error?.message}
      loading={isLoading}
      className="p-6"
    >
      {card && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Button variant="outline" onClick={handleBack}>
              返回列表
            </Button>
          </div>
          <CardPreviewItem
            title={card.title}
            content={card.htmlContent}
            timestamp={card.createdAt}
            onShare={() => alert('已复制分享链接！')}
            onExport={() => alert('已导出为PDF！')}
            onCopy={() => alert('已复制内容到剪贴板！')}
          />
        </div>
      )}
    </PageLayout>
  );
} 
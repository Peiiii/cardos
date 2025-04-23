import { useEffect, useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { CardPreviewData, CARD_EVENTS } from '../features/ai/plugins/create-edit-card-plugin';
import { kernel } from '@/core/kernel';

export function CardPreview() {
  const [previewData, setPreviewData] = useState<CardPreviewData | null>(null);

  useEffect(() => {
    const handlePreview = (data: CardPreviewData) => {
      setPreviewData(data);
    };

    // 订阅预览事件
    const res = kernel.eventBus.on(CARD_EVENTS.PREVIEW, handlePreview);

    // 清理订阅
    return () => {
      res.dispose();
    };
  }, []);

  if (!previewData) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 w-1/3 h-full border-l border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-full p-4 overflow-y-auto">
        <Card className="w-full">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">{previewData.title}</h2>
            <div 
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: previewData.content }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
} 
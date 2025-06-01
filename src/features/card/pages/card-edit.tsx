import { linkUtilService } from '@/core/services/link-util.service';
import { useCard } from '@/features/card/hooks/use-card';
import { cardService } from '@/features/card/services/card';
import { PageLayout } from '@/shared/components/layout/page/page-layout';
import { SmartCardUpdateParams } from '@/shared/types/smart-card';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CardEditorContainer } from '../components/card-editor-container';

export default function CardEditPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { card: initialCardData, isLoading: initialLoading, error: initialError } = useCard(cardId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (data: { title: string; htmlContent: string }) => {
    if (!cardId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const updatedFields: SmartCardUpdateParams = {
        title: data.title,
        htmlContent: data.htmlContent,
        metadata: initialCardData?.metadata || {},
      };
      await cardService.updateCard(cardId, updatedFields);
    } catch (err) {
      console.error('Failed to save card:', err);
      setSaveError('保存失败，请重试。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout
      title={initialLoading ? "加载中..." : `编辑: ${initialCardData?.title || '新卡片'}`}
      error={initialError?.message || saveError}
      loading={initialLoading}
      className="p-6 m-0 flex flex-col h-screen max-h-screen overflow-hidden relative"
    >
      <CardEditorContainer
        initialTitle={initialCardData?.title}
        initialHtmlContent={initialCardData?.htmlContent}
        lastUpdatedAt={initialCardData?.updatedAt?.toString()}
        isLoading={initialLoading}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={() => navigate(linkUtilService.pathOfCard(cardId!))}
        showLastUpdated={true}
      />
    </PageLayout>
  );
} 
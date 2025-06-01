import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardService } from '@/features/card/services/card';
import { SmartCardCreateParams } from '@/shared/types/smart-card';
import { PageLayout } from '@/shared/components/layout/page/page-layout';
import { CardEditorContainer } from '../components/card-editor-container';
import { linkUtilService } from '@/core/services/link-util.service';

export default function CreateCardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { title: string; htmlContent: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const cardData: SmartCardCreateParams = {
        title: data.title,
        htmlContent: data.htmlContent,
        metadata: {
          tags: [],
          isFavorite: false,
          author: '当前用户',
          generatedAt: Date.now()
        }
      };
      
      const card = await cardService.createCard(cardData);
      navigate(linkUtilService.pathOfCard(card.id));
    } catch (err) {
      console.error('创建卡片失败:', err);
      setError('创建卡片失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout 
      title="创建卡片" 
      error={error} 
      loading={loading}
      className="p-6 m-0 flex flex-col h-screen max-h-screen overflow-hidden"
    >
      <CardEditorContainer
        onSave={handleSubmit}
        onCancel={() => navigate('/')}
        isSaving={loading}
        saveButtonText="创建卡片"
      />
    </PageLayout>
  );
} 
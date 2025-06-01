import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCard } from '@/features/card/hooks/use-card';
import { cardService } from '@/features/card/services/card';
import { PageLayout } from '@/shared/components/layout/page/page-layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { SmartCardUpdateParams } from '@/shared/types/smart-card';
import { linkUtilService } from '@/core/services/link-util.service';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/components/ui/resizable';
import type { ImperativePanelGroupHandle } from 'react-resizable-panels'; // Direct import for type
import { useDebounce, useLocalStorageState } from 'ahooks';
import { Maximize, Minimize, PanelLeftClose, PanelRightClose, RefreshCcw, SplitSquareHorizontal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

type LayoutMode = 'default' | 'editor-only' | 'preview-only';
const EDITOR_PANEL_ID = "editor-panel";
const PREVIEW_PANEL_ID = "preview-panel";

export default function CardEditPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { card: initialCardData, isLoading: initialLoading, error: initialError } = useCard(cardId);

  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const debouncedHtmlContent = useDebounce(htmlContent, { wait: 300 });
  const [previewKey, setPreviewKey] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [layoutMode, setLayoutMode] = useLocalStorageState<LayoutMode>(
    'card-editor-layout-mode',
    { defaultValue: 'default' }
  );
  const [panelSizes, setPanelSizes] = useLocalStorageState<number[]>(
    'card-editor-panel-sizes',
    { defaultValue: [50, 50] }
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Refs for panels can be used if direct DOM manipulation or specific panel APIs are needed beyond PanelGroup control.
  const editorPanelRef = useRef<HTMLDivElement>(null); // More generic type if specific handle isn't used for collapse/expand
  const previewPanelRef = useRef<HTMLDivElement>(null);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  useEffect(() => {
    if (initialCardData) {
      setTitle(initialCardData.title || '');
      setHtmlContent(initialCardData.htmlContent || '');
      setPreviewKey(prev => prev + 1);
    }
  }, [initialCardData]);

  const handleSave = async () => {
    if (!cardId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const updatedFields: SmartCardUpdateParams = {
        title,
        htmlContent,
        metadata: initialCardData?.metadata || {},
      };
      await cardService.updateCard(cardId, updatedFields);
      // navigate(linkUtilService.pathOfCardView(cardId));
    } catch (err) {
      console.error('Failed to save card:', err);
      setSaveError('保存失败，请重试。');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    if (cardId) {
      navigate(linkUtilService.pathOfCardView(cardId));
    } else {
      navigate(linkUtilService.pathOfMyCards());
    }
  };

  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    // If you need to programmatically set sizes with panelGroupRef.current?.setLayout([70, 30]);
    // you can do it here based on the mode.
    // For example, for 'editor-only', you might call panelGroupRef.current?.setLayout([100, 0]);
    // However, the current approach uses conditional rendering of panels and ResizableHandle,
    // and relies on the defaultSize/minSize of individual panels for full-screen effects.
  };

  const handlePanelLayout = (sizes: number[]) => {
    if (layoutMode === 'default') {
      setPanelSizes(sizes);
    }
  };
  
  const forcePreviewRefresh = () => {
    setPreviewKey(prev => prev + 1);
  }

  const showEditor = layoutMode === 'default' || layoutMode === 'editor-only';
  const showPreview = layoutMode === 'default' || layoutMode === 'preview-only';
  const showHandle = layoutMode === 'default';

  return (
    <PageLayout
      title={initialLoading ? "加载中..." : `编辑: ${initialCardData?.title || '新卡片'}`}
      error={initialError?.message || saveError}
      loading={initialLoading}
      className="p-6 m-0 flex flex-col h-screen max-h-screen overflow-hidden relative"
    >
      <TooltipProvider delayDuration={100}>
        <div className="absolute top-3 right-3 z-50 flex space-x-1 bg-background p-1 rounded-md border shadow-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleLayoutChange('default')} className={layoutMode === 'default' ? 'bg-muted' : ''}>
                <SplitSquareHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>双栏布局</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleLayoutChange('editor-only')} className={layoutMode === 'editor-only' ? 'bg-muted' : ''}>
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>仅编辑器</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleLayoutChange('preview-only')} className={layoutMode === 'preview-only' ? 'bg-muted' : ''}>
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>仅预览</TooltipContent>
          </Tooltip>
           <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={forcePreviewRefresh} >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>刷新预览</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <ResizablePanelGroup 
        ref={panelGroupRef}
        direction="horizontal" 
        className="flex-grow border-t"
        onLayout={handlePanelLayout}
      >
        {showEditor && (
          <ResizablePanel 
            id={EDITOR_PANEL_ID}
            // ref={editorPanelRef} // Ref type changed to HTMLDivElement, can be used if needed
            defaultSize={panelSizes?.[0] ?? 50} 
            minSize={15} // Min size when visible
            collapsible
            collapsedSize={0} // Size when collapsed
            order={1}
            // className={!showEditor ? 'hidden' : ''} // Not strictly needed if parent ResizablePanelGroup handles it based on child presence
          >
            <div ref={editorPanelRef} className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
              <div>
                <label htmlFor="cardTitle" className="block text-sm font-medium mb-1">
                  卡片标题
                </label>
                <Input
                  id="cardTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入卡片标题"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="cardHtmlContent" className="block text-sm font-medium mb-1">
                  HTML 内容
                </label>
                <Textarea
                  id="cardHtmlContent"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="输入或粘贴 HTML 代码"
                  className="w-full min-h-[calc(100vh-240px)] font-mono text-sm resize-none border rounded-md"
                />
              </div>
            </div>
          </ResizablePanel>
        )}

        {showHandle && <ResizableHandle withHandle />}

        {showPreview && (
          <ResizablePanel 
            id={PREVIEW_PANEL_ID}
            // ref={previewPanelRef} // Ref type changed to HTMLDivElement
            defaultSize={panelSizes?.[1] ?? 50} 
            minSize={15}
            collapsible
            collapsedSize={0}
            order={2}
            // className={!showPreview ? 'hidden' : ''}
          >
            <div ref={previewPanelRef} className="flex flex-col h-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <div className="p-2 border-b flex justify-between items-center bg-background">
                  <p className="text-sm font-medium">实时预览</p>
                  {layoutMode === 'default' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleLayoutChange('preview-only')}>
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>全屏预览</TooltipContent>
                    </Tooltip>
                  )}
                  {layoutMode === 'preview-only' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleLayoutChange('default')}>
                          <Minimize className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>退出全屏</TooltipContent>
                    </Tooltip>
                  )}
              </div>
              <iframe
                ref={iframeRef}
                key={previewKey}
                srcDoc={debouncedHtmlContent}
                title="Card Preview"
                className="w-full h-full border-0 flex-grow bg-white dark:bg-gray-900"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
      
      <div className="p-3 border-t bg-background flex justify-end space-x-2 items-center shadow-inner">
        <span className="text-xs text-muted-foreground">
          {initialCardData && `上次更新: ${new Date(initialCardData.updatedAt).toLocaleString()}`}
        </span>
        <div className="flex-grow"></div>
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          取消
        </Button>
        <Button onClick={handleSave} disabled={isSaving || initialLoading || !title.trim() || !htmlContent.trim() }>
          {isSaving ? '保存中...' : '保存卡片'}
        </Button>
      </div>
    </PageLayout>
  );
}

// Helper type for ResizablePanel imperative handle (if available)
// This is a common pattern. If shadcn/ui doesn't expose this directly,
// we might need to manage sizes more directly or look for alternative ways.
// export interface ImperativePanelHandle {
//   collapse: () => void;
//   expand: () => void;
//   resize: (size: number) => void;
//   getSize: () => number;
// } 
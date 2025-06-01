import { useState, useEffect } from 'react';
import { useLocalStorageState } from 'ahooks';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/components/ui/resizable';
import { SplitSquareHorizontal, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { CardEditor } from './card-editor';
import { CardPreviewPanel } from './card-preview-panel';
import { Button } from '@/shared/components/ui/button';

export type LayoutMode = 'default' | 'editor-only' | 'preview-only';

export interface CardEditorContainerProps {
  // 基础数据
  initialTitle?: string;
  initialHtmlContent?: string;
  lastUpdatedAt?: string;
  
  // 状态
  isLoading?: boolean;
  isSaving?: boolean;
  
  // 回调函数
  onSave: (data: { title: string; htmlContent: string }) => Promise<void>;
  onCancel: () => void;
  
  // 自定义配置
  saveButtonText?: string;
  cancelButtonText?: string;
  showLastUpdated?: boolean;
  className?: string;
}

export function CardEditorContainer({
  // 基础数据
  initialTitle = '',
  initialHtmlContent = '',
  lastUpdatedAt,
  
  // 状态
  isLoading = false,
  isSaving = false,
  
  // 回调函数
  onSave,
  onCancel,
  
  // 自定义配置
  saveButtonText = '保存卡片',
  cancelButtonText = '取消',
  showLastUpdated = false,
  className = '',
}: CardEditorContainerProps) {
  const [currentTitle, setCurrentTitle] = useState(initialTitle);
  const [currentHtmlContent, setCurrentHtmlContent] = useState(initialHtmlContent);
  
  // 布局状态
  const [layoutMode, setLayoutMode] = useLocalStorageState<LayoutMode>(
    'card-editor-layout-mode',
    { defaultValue: 'default' }
  );
  const [panelSizes, setPanelSizes] = useLocalStorageState<number[]>(
    'card-editor-panel-sizes',
    { defaultValue: [50, 50] }
  );

  // 同步初始数据
  useEffect(() => {
    setCurrentTitle(initialTitle);
    setCurrentHtmlContent(initialHtmlContent);
  }, [initialTitle, initialHtmlContent]);

  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
  };

  const handlePanelLayout = (sizes: number[]) => {
    if (layoutMode === 'default') {
      setPanelSizes(sizes);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    await onSave({
      title: currentTitle,
      htmlContent: currentHtmlContent,
    });
  };

  const showEditor = layoutMode === 'default' || layoutMode === 'editor-only';
  const showPreview = layoutMode === 'default' || layoutMode === 'preview-only';
  const showHandle = layoutMode === 'default';

  return (
    <div className={`flex flex-col h-screen max-h-screen overflow-hidden relative ${className}`}>
      <TooltipProvider delayDuration={100}>
        <div className="absolute top-3 right-3 z-50 flex space-x-1 bg-background p-1 rounded-md border shadow-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleLayoutChange('default')}
                className={layoutMode === 'default' ? 'bg-muted' : ''}
              >
                <SplitSquareHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>双栏布局</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleLayoutChange('editor-only')}
                className={layoutMode === 'editor-only' ? 'bg-muted' : ''}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>仅编辑器</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleLayoutChange('preview-only')}
                className={layoutMode === 'preview-only' ? 'bg-muted' : ''}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>仅预览</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div className="flex-grow overflow-hidden">
        <ResizablePanelGroup 
          direction="horizontal" 
          className="h-full border-t"
          onLayout={handlePanelLayout}
        >
          {showEditor && (
            <ResizablePanel 
              defaultSize={panelSizes?.[0] ?? 50} 
              minSize={15}
              collapsible
              collapsedSize={0}
              order={1}
            >
              <div className="h-full flex flex-col">
                <CardEditor
                  title={currentTitle}
                  htmlContent={currentHtmlContent}
                  onTitleChange={setCurrentTitle}
                  onHtmlContentChange={setCurrentHtmlContent}
                  className="flex-grow overflow-hidden"
                />
              </div>
            </ResizablePanel>
          )}

          {showHandle && <ResizableHandle withHandle />}

          {showPreview && (
            <ResizablePanel 
              defaultSize={panelSizes?.[1] ?? 50} 
              minSize={15}
              collapsible
              collapsedSize={0}
              order={2}
            >
              <CardPreviewPanel
                htmlContent={currentHtmlContent}
                onToggleFullscreen={() => handleLayoutChange(layoutMode === 'preview-only' ? 'default' : 'preview-only')}
                isFullscreen={layoutMode === 'preview-only'}
              />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
      
      <div className="p-3 border-t bg-background flex justify-end space-x-2 items-center shadow-inner">
        {showLastUpdated && lastUpdatedAt && (
          <span className="text-xs text-muted-foreground">
            上次更新: {new Date(lastUpdatedAt).toLocaleString()}
          </span>
        )}
        <div className="flex-grow"></div>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving || isLoading}
        >
          {cancelButtonText}
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoading || !currentTitle.trim() || !currentHtmlContent.trim()}
        >
          {isSaving ? '保存中...' : saveButtonText}
        </Button>
      </div>
    </div>
  );
} 
import { Button } from "@/shared/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shared/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useLocalStorageState } from "ahooks";
import {
  PanelLeftClose,
  PanelRightClose,
  SplitSquareHorizontal,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card } from "../types/card";
import { CardEditor } from "./card-editor";
import { CardPreviewPanel } from "./card-preview-panel";

export type LayoutMode = "default" | "editor-only" | "preview-only";

export interface CardEditorContainerProps {
  initialCard?: Card;
  onSave: (data: { title: string; htmlContent: string }) => void;
  onCancel: () => void;
  isSaving?: boolean;
  isLoading?: boolean;
  saveButtonText?: string;
  showLastUpdated?: boolean;
  className?: string;
  onTitleChange?: (title: string) => void;
  onHtmlContentChange?: (htmlContent: string) => void;
}

export const CardEditorContainer: React.FC<CardEditorContainerProps> = ({
  initialCard,
  onSave,
  onCancel,
  isSaving = false,
  isLoading = false,
  saveButtonText = "保存",
  showLastUpdated = false,
  className = "",
  onTitleChange,
  onHtmlContentChange,
}) => {
  const [currentTitle, setCurrentTitle] = useState(initialCard?.title || "");
  const [currentHtmlContent, setCurrentHtmlContent] = useState(
    initialCard?.htmlContent || ""
  );

  // 布局状态
  const [layoutMode, setLayoutMode] = useLocalStorageState<LayoutMode>(
    "card-editor-layout-mode",
    { defaultValue: "default" }
  );
  const [panelSizes, setPanelSizes] = useLocalStorageState<number[]>(
    "card-editor-panel-sizes",
    { defaultValue: [50, 50] }
  );

  // 同步初始数据
  useEffect(() => {
    if (initialCard) {
      setCurrentTitle(initialCard.title);
      setCurrentHtmlContent(initialCard.htmlContent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
  };

  const handlePanelLayout = (sizes: number[]) => {
    if (layoutMode === "default") {
      setPanelSizes(sizes);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSave({
      title: currentTitle,
      htmlContent: currentHtmlContent,
    });
  };

  const handleTitleChange = (title: string) => {
    console.log("[CardEditorContainer][handleTitleChange] ", title);
    setCurrentTitle(title);
    onTitleChange?.(title);
  };

  const handleHtmlContentChange = (content: string) => {
    setCurrentHtmlContent(content);
    onHtmlContentChange?.(content);
  };

  const showEditor = layoutMode === "default" || layoutMode === "editor-only";
  const showPreview = layoutMode === "default" || layoutMode === "preview-only";
  const showHandle = layoutMode === "default";

  console.log("[CardEditorContainer] ", {
    card: initialCard,
    currentTitle,
    currentHtmlContent,
    layoutMode,
    panelSizes,
    showEditor,
    showPreview,
    isSaving,
    isLoading,
    showLastUpdated,
    className,
    onTitleChange,
    onHtmlContentChange,
    onSave,
  });

  return (
    <div
      className={`flex flex-col h-screen max-h-screen overflow-hidden relative ${className}`}
    >
      <TooltipProvider delayDuration={100}>
        <div className="absolute top-3 right-3 z-50 flex space-x-1 bg-background p-1 rounded-md border shadow-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleLayoutChange("default")}
                className={layoutMode === "default" ? "bg-muted" : ""}
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
                onClick={() => handleLayoutChange("editor-only")}
                className={layoutMode === "editor-only" ? "bg-muted" : ""}
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
                onClick={() => handleLayoutChange("preview-only")}
                className={layoutMode === "preview-only" ? "bg-muted" : ""}
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
                  initialTitle={currentTitle}
                  initialHtmlContent={currentHtmlContent}
                  onTitleChange={handleTitleChange}
                  onHtmlContentChange={handleHtmlContentChange}
                  className="flex-grow overflow-hidden"
                  isLoading={isLoading}
                  showLastUpdated={showLastUpdated}
                  lastUpdatedAt={initialCard?.updatedAt}
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
                onToggleFullscreen={() =>
                  handleLayoutChange(
                    layoutMode === "preview-only" ? "default" : "preview-only"
                  )
                }
                isFullscreen={layoutMode === "preview-only"}
              />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>

      <div className="p-3 border-t bg-background flex justify-end space-x-2 items-center shadow-inner">
        {showLastUpdated && initialCard?.updatedAt && (
          <span className="text-xs text-muted-foreground">
            上次更新: {new Date(initialCard.updatedAt).toLocaleString()}
          </span>
        )}
        <div className="flex-grow"></div>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving || isLoading}
        >
          取消
        </Button>
        <Button
          onClick={handleSaveClick}
          disabled={
            isSaving ||
            isLoading ||
            !currentTitle.trim() ||
            !currentHtmlContent.trim()
          }
        >
          {isSaving ? "保存中..." : saveButtonText}
        </Button>
      </div>
    </div>
  );
};

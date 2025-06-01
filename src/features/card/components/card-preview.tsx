import { useEffect, useRef } from "react";

interface CardPreviewProps {
  htmlContent: string;
  title: string;
}

export function CardPreview({ htmlContent, title }: CardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current || !iframeRef.current) return;

      const container = containerRef.current;
      const iframe = iframeRef.current;

      // 等待 iframe 内容加载完成
      iframe.onload = () => {
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDoc) return;

          // 获取内容的实际尺寸
            const contentWidth = iframeDoc.documentElement.scrollWidth;
        //   const contentWidth = window.innerWidth;
            const contentHeight = iframeDoc.documentElement.scrollHeight;
        //   const contentHeight = window.innerHeight;

          // 计算缩放比例
          const scaleX = container.clientWidth / contentWidth;
          const scaleY = container.clientHeight / contentHeight;
          const newScale = Math.min(scaleX, scaleY);

          // 注入缩放样式
          const styleElement = iframeDoc.createElement("style");
          styleElement.textContent = `
            body {
              margin: 0;
              padding: 0;
              transform-origin: top left;
              transform: scale(${newScale});
              width: ${100 / newScale}%;
              height: ${100 / newScale}%;
            }
          `;
          iframeDoc.head.appendChild(styleElement);
        } catch (error) {
          console.error("Failed to update iframe scale:", error);
        }
      };
    };

    // 初始更新
    updateScale();

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [htmlContent]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[200px] overflow-hidden"
    >
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        title={title}
        className="absolute top-0 left-0 w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

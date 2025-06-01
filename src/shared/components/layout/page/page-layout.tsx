import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  error?: string | null;
  loading?: boolean;
  className?: string;
}

export function PageLayout({ 
  title, 
  children, 
  error, 
  loading = false,
  className 
}: PageLayoutProps) {
  return (
    <div className={className} data-component="page-layout">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      </div>
      
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-muted-foreground">正在加载...</p>
        </div>
      )}
      
      {/* 内容 */}
      {!loading && children}
    </div>
  );
} 
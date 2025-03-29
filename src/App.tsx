import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/layout';
import { useResponsive } from './hooks/use-responsive';

// 应用主组件
export default function App() {
  const { isMobile } = useResponsive();
  
  return (
    <Routes>
      <Route path="/" element={<Layout />} />
      {/* 移动端卡片预览路由 */}
      {isMobile && (
        <Route path="/card/:cardId" element={<Layout />} />
      )}
    </Routes>
  );
}

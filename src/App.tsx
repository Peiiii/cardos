import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/layout';

// 应用主组件
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />} />
    </Routes>
  );
}

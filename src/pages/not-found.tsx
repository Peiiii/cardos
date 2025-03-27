import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">404</h2>
      <p className="text-xl text-gray-600 mb-6">页面不存在</p>
      <p className="text-gray-500 mb-8">您访问的页面不存在或已被移除</p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        返回首页
      </Link>
    </div>
  );
} 
/**
 * 获取环境变量的辅助函数，支持默认值
 * @param key 环境变量的键名
 * @param defaultValue 默认值
 * @returns 环境变量的值或默认值
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  // 在浏览器环境中，尝试从导入元数据获取环境变量
  const envValue = import.meta.env?.[key] || import.meta.env?.[`VITE_${key}`] || defaultValue;
  return envValue;
} 
import { useState } from 'react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('qwen-max-latest');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里可以添加保存设置的逻辑
    // 保存到localStorage或其他存储方式
    
    localStorage.setItem('settings', JSON.stringify({
      apiKey,
      model
    }));
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">设置</h2>
      
      {showSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-green-700">设置已保存</p>
            </div>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>AI模型设置</CardTitle>
          <CardDescription>配置通义千问AI模型的相关设置</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveSettings}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="apiKey" className="text-sm font-medium leading-none">
                阿里云通义千问API密钥
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-sm text-muted-foreground">您的API密钥将仅保存在本地，不会发送到服务器</p>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="model" className="text-sm font-medium leading-none">
                AI模型
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="qwen-max-latest">通义千问-超大规模模型（最新版）</option>
                <option value="qwen-max">通义千问-超大规模模型</option>
                <option value="qwen-plus-latest">通义千问-大规模模型（最新版）</option>
                <option value="qwen-plus">通义千问-大规模模型</option>
              </select>
            </div>
          </CardContent>
          
          <CardHeader>
            <CardTitle>应用设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                id="darkMode"
                name="darkMode"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="darkMode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                启用深色模式（开发中）
              </label>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit">保存设置</Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
} 
import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { ThemeSettingsPanel } from '@/shared/components/theme/theme-settings-panel';
import { useThemeStore } from '@/store/theme-store';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('qwen-max-latest');
  const [showSuccess, setShowSuccess] = useState(false);
  const { mode } = useThemeStore();
  
  // 从localStorage加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setApiKey(settings.apiKey || '');
      setModel(settings.model || 'qwen-max-latest');
    }
  }, []);
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // 保存到localStorage
    localStorage.setItem('settings', JSON.stringify({
      apiKey,
      model
    }));
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  return (
    <div className="p-6">
      {showSuccess && (
        <div className="bg-success/10 border-l-4 border-success p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-success">设置已保存</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>AI模型设置</CardTitle>
            <CardDescription>配置通义千问AI模型的相关设置</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveSettings}>
            <CardContent className="space-y-4 px-6 mb-4">
              <div className="space-y-1">
                <label htmlFor="apiKey" className="text-sm font-medium leading-none">
                  阿里云通义千问API密钥
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-input-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <p className="text-sm text-secondary-foreground">您的API密钥将仅保存在本地，不会发送到服务器。您可以在阿里云控制台获取API密钥。</p>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="model" className="text-sm font-medium leading-none">
                  AI模型
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-input-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="qwen-max-latest">通义千问-超大规模模型（最新版）</option>
                  <option value="qwen-max">通义千问-超大规模模型</option>
                  <option value="qwen-plus-latest">通义千问-大规模模型（最新版）</option>
                  <option value="qwen-plus">通义千问-大规模模型</option>
                </select>
                <div className="space-y-2">
                  <p className="text-sm text-secondary-foreground">选择适合您需求的AI模型：</p>
                  <ul className="text-sm text-secondary-foreground space-y-1 list-disc list-inside">
                    <li>超大规模模型：性能最强，适合复杂任务</li>
                    <li>大规模模型：性价比高，适合一般任务</li>
                    <li>最新版：包含最新的优化和功能</li>
                    <li>标准版：稳定可靠，适合生产环境</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="px-6 pb-6">
              <Button type="submit">保存设置</Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="space-y-6">
          <ThemeSettingsPanel />
          
          <Card>
            <CardHeader>
              <CardTitle>应用设置</CardTitle>
              <CardDescription>调整应用的外观和行为</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-secondary-foreground mb-2">当前显示模式: <span className="font-medium">{mode === 'system' ? '跟随系统' : mode === 'light' ? '亮色' : '暗色'}</span></p>
                <p className="text-sm text-secondary-foreground">您可以在上方的主题设置中更改显示模式和颜色主题</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
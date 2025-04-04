import { ThemeName, useThemeStore } from '@/store/theme-store'

export function ThemeSettingsPanel() {
  const { mode, themeName, setMode, setThemeName } = useThemeStore()

  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <h3 className="text-lg font-medium text-card-foreground mb-4">主题设置</h3>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-secondary-foreground mb-2">显示模式</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('light')}
            className={`px-3 py-2 rounded-md text-sm ${
              mode === 'light' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            亮色
          </button>
          <button
            onClick={() => setMode('dark')}
            className={`px-3 py-2 rounded-md text-sm ${
              mode === 'dark' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            暗色
          </button>
          <button
            onClick={() => setMode('system')}
            className={`px-3 py-2 rounded-md text-sm ${
              mode === 'system' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            跟随系统
          </button>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-secondary-foreground mb-2">颜色主题</h4>
        <div className="grid grid-cols-4 gap-2">
          <ThemeButton name="default" current={themeName} onClick={setThemeName} />
          <ThemeButton name="blue" current={themeName} onClick={setThemeName} />
          <ThemeButton name="green" current={themeName} onClick={setThemeName} />
          <ThemeButton name="purple" current={themeName} onClick={setThemeName} />
        </div>
      </div>
    </div>
  )
}

function ThemeButton({ 
  name, 
  current, 
  onClick 
}: { 
  name: ThemeName 
  current: ThemeName 
  onClick: (theme: ThemeName) => void 
}) {
  // 主题颜色映射
  const colors: Record<ThemeName, string> = {
    default: 'bg-blue-500',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600'
  }
  
  return (
    <button
      onClick={() => onClick(name)}
      className={`relative h-12 rounded-md ${current === name ? 'ring-2 ring-primary' : 'ring-1 ring-border'} overflow-hidden`}
    >
      <div className={`h-full w-full ${colors[name]}`}></div>
      {current === name && (
        <span className="absolute inset-0 flex items-center justify-center text-primary-foreground">
          ✓
        </span>
      )}
    </button>
  )
} 
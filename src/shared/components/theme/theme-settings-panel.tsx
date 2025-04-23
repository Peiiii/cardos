import { ThemeName, useThemeStore } from '@/core/stores/theme-store'

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
          <ThemeButton name="orange" current={themeName} onClick={setThemeName} />
          <ThemeButton name="red" current={themeName} onClick={setThemeName} />
          <ThemeButton name="yellow" current={themeName} onClick={setThemeName} />
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
    default: 'bg-[oklch(0.21_0.006_285.885)]',
    blue: 'bg-[oklch(0.623_0.214_259.815)]',
    green: 'bg-[oklch(0.723_0.219_149.579)]',
    purple: 'bg-[oklch(0.606_0.25_292.717)]',
    orange: 'bg-[oklch(0.705_0.213_47.604)]',
    red: 'bg-[oklch(0.637_0.237_25.331)]',
    yellow: 'bg-[oklch(0.795_0.184_86.047)]'
  }
  
  // 主题名称映射
  const themeNames: Record<ThemeName, string> = {
    default: '默认',
    blue: '蓝色',
    green: '绿色',
    purple: '紫色',
    orange: '橙色',
    red: '红色',
    yellow: '黄色'
  }
  
  return (
    <button
      onClick={() => onClick(name)}
      className={`relative h-12 rounded-md ${current === name ? 'ring-2 ring-primary' : 'ring-1 ring-border'} overflow-hidden group`}
      title={themeNames[name]}
    >
      <div className={`h-full w-full ${colors[name]}`}></div>
      {current === name && (
        <span className="absolute inset-0 flex items-center justify-center text-primary-foreground">
          ✓
        </span>
      )}
      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {themeNames[name]}
      </span>
    </button>
  )
} 
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useThemeStore } from '@/core/stores/theme-store';
import { cn } from '@/shared/utils/utils';

interface CompactThemeSwitcherProps {
  isCollapsed: boolean;
}

export function CompactThemeSwitcher({ isCollapsed }: CompactThemeSwitcherProps) {
  const { mode, setMode } = useThemeStore();

  return (
    <div className="mt-auto p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center"
            )}
          >
            {mode === 'dark' ? (
              <Moon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            ) : (
              <Sun className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            )}
            {!isCollapsed && "主题设置"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem 
            onClick={() => setMode('light')}
            className={cn(
              "flex items-center",
              mode === 'light' && "bg-accent text-accent-foreground"
            )}
          >
            <Sun className="h-4 w-4 mr-2" />
            亮色主题
            {mode === 'light' && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setMode('dark')}
            className={cn(
              "flex items-center",
              mode === 'dark' && "bg-accent text-accent-foreground"
            )}
          >
            <Moon className="h-4 w-4 mr-2" />
            暗色主题
            {mode === 'dark' && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setMode('system')}
            className={cn(
              "flex items-center",
              mode === 'system' && "bg-accent text-accent-foreground"
            )}
          >
            <Monitor className="h-4 w-4 mr-2" />
            跟随系统
            {mode === 'system' && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 
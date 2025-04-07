import { CommandRegistry, Disposable } from '../types';
import { DisposableImpl } from './disposable';

/**
 * 命令处理器类型
 */
type CommandHandler<T = any, R = any> = (arg?: T) => R | Promise<R>;

/**
 * 命令注册表实现
 */
export class CommandRegistryImpl implements CommandRegistry {
  private _commands: Map<string, CommandHandler> = new Map();

  /**
   * 注册命令
   * @param id 命令ID
   * @param handler 命令处理器
   * @returns 可释放对象，用于取消注册
   */
  register<T = any, R = any>(id: string, handler: (arg?: T) => R | Promise<R>): Disposable {
    if (this._commands.has(id)) {
      throw new Error(`命令 "${id}" 已经注册`);
    }

    this._commands.set(id, handler);

    return DisposableImpl.from(() => {
      this._commands.delete(id);
    });
  }

  /**
   * 执行命令
   * @param id 命令ID
   * @param arg 命令参数
   * @returns 命令执行结果Promise
   */
  async execute<T = any, R = any>(id: string, arg?: T): Promise<R> {
    const handler = this._commands.get(id) as CommandHandler<T, R> | undefined;
    
    if (!handler) {
      throw new Error(`命令 "${id}" 未注册`);
    }
    
    try {
      return await Promise.resolve(handler(arg));
    } catch (error) {
      console.error(`执行命令 "${id}" 出错:`, error);
      throw error;
    }
  }

  /**
   * 检查命令是否已注册
   * @param id 命令ID
   * @returns 是否已注册
   */
  hasCommand(id: string): boolean {
    return this._commands.has(id);
  }

  /**
   * 获取所有命令ID
   * @returns 命令ID数组
   */
  getCommandIds(): string[] {
    return Array.from(this._commands.keys());
  }

  /**
   * 释放所有命令
   */
  dispose(): void {
    this._commands.clear();
  }
}

/**
 * 创建命令注册表
 * @returns 命令注册表实例
 */
export function createCommandRegistry(): CommandRegistry {
  return new CommandRegistryImpl();
} 
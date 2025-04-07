import { 
  Disposable, 
  ServiceRegistry, 
  CommandRegistry, 
  EventEmitter 
} from '../types';
import { DisposableImpl } from './disposable';

/**
 * 服务注册表代理
 * 为扩展提供隔离的服务访问，自动添加命名空间前缀
 */
export class ServiceRegistryProxy implements ServiceRegistry {
  constructor(
    private _global: ServiceRegistry,
    private _extensionId: string
  ) {}

  /**
   * 获取完整服务ID（添加命名空间）
   */
  private _getFullId(id: string): string {
    return id.includes('.') ? id : `${this._extensionId}.${id}`;
  }

  /**
   * 注册服务
   * @param id 服务ID
   * @param implementation 服务实现
   */
  register<T>(id: string, implementation: T): Disposable {
    const fullId = this._getFullId(id);
    return this._global.register(fullId, implementation);
  }

  /**
   * 获取服务
   * @param id 服务ID（可以是完整ID或相对ID）
   */
  get<T>(id: string): T | undefined {
    // 如果已包含命名空间（包含点号），直接获取
    // 否则先查找扩展自己的命名空间，再查找全局
    if (id.includes('.')) {
      return this._global.get<T>(id);
    } else {
      // 先尝试扩展自己的命名空间
      const prefixedId = this._getFullId(id);
      const prefixedService = this._global.get<T>(prefixedId);
      if (prefixedService) {
        return prefixedService;
      }
      // 再尝试全局服务
      return this._global.get<T>(id);
    }
  }

  /**
   * 释放资源
   */
  dispose(): void {
    // 代理不需要释放任何资源
  }
}

/**
 * 命令注册表代理
 * 为扩展提供隔离的命令访问，自动添加命名空间前缀
 */
export class CommandRegistryProxy implements CommandRegistry {
  constructor(
    private _global: CommandRegistry,
    private _extensionId: string
  ) {}

  /**
   * 获取完整命令ID（添加命名空间）
   */
  private _getFullId(id: string): string {
    return id.includes('.') ? id : `${this._extensionId}.${id}`;
  }

  /**
   * 注册命令
   * @param id 命令ID
   * @param handler 命令处理函数
   */
  register<T = any, R = any>(id: string, handler: (arg?: T) => R | Promise<R>): Disposable {
    const fullId = this._getFullId(id);
    return this._global.register(fullId, handler);
  }

  /**
   * 执行命令
   * @param id 命令ID（可以是完整ID或相对ID）
   * @param arg 命令参数
   */
  async execute<T = any, R = any>(id: string, arg?: T): Promise<R> {
    // 如果已包含命名空间，直接执行
    // 否则添加扩展命名空间
    const fullId = id.includes('.') ? id : this._getFullId(id);
    return await this._global.execute(fullId, arg);
  }

  /**
   * 释放资源
   */
  dispose(): void {
    // 代理不需要释放任何资源
  }
}

/**
 * 事件发射器代理
 * 为扩展提供隔离的事件处理，自动添加命名空间前缀
 */
export class EventEmitterProxy<T extends Record<string, any>> implements EventEmitter<T> {
  constructor(
    private _global: EventEmitter<Record<string, any>>,
    private _extensionId: string
  ) {}

  /**
   * 获取完整事件名称（添加命名空间）
   */
  private _getFullEventName<K extends keyof T>(event: K): string {
    const eventName = String(event);
    return eventName.includes('.') ? eventName : `${this._extensionId}.${eventName}`;
  }

  /**
   * 订阅事件
   * @param event 事件名称
   * @param listener 事件监听器
   */
  on<K extends keyof T>(event: K, listener: (value: T[K]) => void): Disposable {
    const fullEvent = this._getFullEventName(event) as any;
    return this._global.on(fullEvent, listener);
  }

  /**
   * 取消事件订阅
   * @param event 事件名称
   * @param listener 事件监听器
   */
  off<K extends keyof T>(event: K, listener: (value: T[K]) => void): void {
    const fullEvent = this._getFullEventName(event) as any;
    this._global.off(fullEvent, listener);
  }

  /**
   * 发送事件
   * @param event 事件名称
   * @param value 事件值
   */
  emit<K extends keyof T>(event: K, value: T[K]): void {
    const fullEvent = this._getFullEventName(event) as any;
    this._global.emit(fullEvent, value);
  }

  /**
   * 订阅事件一次
   * @param event 事件名称
   * @param listener 事件监听器
   */
  once<K extends keyof T>(event: K, listener: (value: T[K]) => void): Disposable {
    const fullEvent = this._getFullEventName(event) as any;
    return this._global.once(fullEvent, listener);
  }

  /**
   * 释放资源
   */
  dispose(): void {
    // 代理不需要释放任何资源
  }
} 
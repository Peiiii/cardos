/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDisposable, EventBus, TypedKey } from '../types';
import { Disposable } from './disposable';

// 事件处理函数类型
type EventHandler<T> = (data: T) => void;

/**
 * 事件总线实现
 */
export class EventEmitterImpl implements EventBus {
  private _listeners: Map<string, Set<EventHandler<any>>> = new Map();

  /**
   * 订阅事件
   * 支持字符串事件名和TypedKey
   * @param eventName 事件名称或类型安全的事件键
   * @param handler 事件处理函数
   * @returns 可释放对象，用于取消订阅
   */
  on<T = any>(
    eventName: string | TypedKey<T>, 
    handler: EventHandler<T>
  ): IDisposable {
    const name = typeof eventName === 'string' ? eventName : eventName.name;
    
    if (!this._listeners.has(name)) {
      this._listeners.set(name, new Set());
    }
    
    const handlers = this._listeners.get(name)!;
    handlers.add(handler);
    
    return Disposable.from(() => {
      this._off(name, handler);
    });
  }

  /**
   * 取消订阅事件 (内部方法)
   * @param eventName 事件名称
   * @param handler 事件处理函数
   */
  private _off<T = any>(
    eventName: string, 
    handler: EventHandler<T>
  ): void {
    const handlers = this._listeners.get(eventName);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this._listeners.delete(eventName);
      }
    }
  }

  /**
   * 触发事件
   * 支持字符串事件名和TypedKey
   * @param eventName 事件名称或类型安全的事件键
   * @param data 事件数据
   */
  emit<T = any>(
    eventName: string | TypedKey<T>, 
    data: T
  ): void {
    const name = typeof eventName === 'string' ? eventName : eventName.name;
    
    const handlers = this._listeners.get(name);
    if (handlers) {
      // 创建副本以防止在迭代过程中修改集合
      const handlersArray = Array.from(handlers);
      for (const handler of handlersArray) {
        try {
          handler(data);
        } catch (error) {
          console.error(`事件处理器执行错误 (${name}):`, error);
        }
      }
    }
  }

  /**
   * 订阅事件一次
   * 事件触发后自动取消订阅
   * @param eventName 事件名称或类型安全的事件键
   * @param handler 事件处理函数
   * @returns 可释放对象，用于取消订阅
   */
  once<T = any>(
    eventName: string | TypedKey<T>,
    handler: EventHandler<T>
  ): IDisposable {
    const name = typeof eventName === 'string' ? eventName : eventName.name;
    
    const onceHandler = ((data: T) => {
      handler(data);
      this._off(name, onceHandler);
    }) as EventHandler<T>;
    
    return this.on(name, onceHandler);
  }

  /**
   * 检查是否有监听器订阅了指定事件 (内部方法)
   * @param eventName 事件名称
   * @returns 是否有监听器
   */
  private _hasListeners(eventName: string): boolean {
    const handlers = this._listeners.get(eventName);
    return !!handlers && handlers.size > 0;
  }

  /**
   * 获取所有已注册的事件名称 (内部方法)
   * @returns 事件名称数组
   */
  private _getEvents(): string[] {
    return Array.from(this._listeners.keys());
  }

  /**
   * 释放所有事件监听器
   */
  dispose(): void {
    this._listeners.clear();
  }
}
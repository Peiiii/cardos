import { Disposable } from '../types';
import { DisposableImpl } from './disposable';

type Listener<T> = (value: T) => void;

/**
 * 事件发射器
 * 提供事件注册、触发和管理功能
 */
export class EventEmitter<T extends Record<string, any>> implements Disposable {
  private _listeners: Map<keyof T, Set<Listener<any>>> = new Map();

  /**
   * 订阅事件
   * @param event 事件名称
   * @param listener 事件监听器
   * @returns 可释放的订阅对象
   */
  on<K extends keyof T>(event: K, listener: Listener<T[K]>): Disposable {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }

    const listeners = this._listeners.get(event)!;
    listeners.add(listener);

    return DisposableImpl.from(() => {
      this.off(event, listener);
    });
  }

  /**
   * 取消事件订阅
   * @param event 事件名称
   * @param listener 事件监听器
   */
  off<K extends keyof T>(event: K, listener: Listener<T[K]>): void {
    const listeners = this._listeners.get(event);
    if (!listeners) {
      return;
    }

    listeners.delete(listener);
    if (listeners.size === 0) {
      this._listeners.delete(event);
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param value 事件值
   */
  emit<K extends keyof T>(event: K, value: T[K]): void {
    const listeners = this._listeners.get(event);
    if (!listeners) {
      return;
    }

    // 使用拷贝以防止回调中修改监听器集合
    const listenersCopy = Array.from(listeners);
    for (const listener of listenersCopy) {
      try {
        listener(value);
      } catch (error) {
        console.error(`Error in event listener for "${String(event)}":`, error);
      }
    }
  }

  /**
   * 只订阅一次事件
   * @param event 事件名称
   * @param listener 事件监听器
   * @returns 可释放的订阅对象
   */
  once<K extends keyof T>(event: K, listener: Listener<T[K]>): Disposable {
    const wrapper = (value: T[K]) => {
      this.off(event, wrapper);
      listener(value);
    };

    return this.on(event, wrapper);
  }

  /**
   * 释放所有事件监听器
   */
  dispose(): void {
    this._listeners.clear();
  }
} 
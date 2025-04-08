import { Disposable } from '../types';

/**
 * Disposable 实现类
 * 
 * 提供资源释放的基础实现
 */
export class DisposableImpl implements Disposable {
  private _isDisposed: boolean = false;
  private _disposeFn: () => void | Promise<void>;

  /**
   * 创建一个新的Disposable实例
   * @param disposeFn 释放资源的函数
   */
  constructor(disposeFn: () => void | Promise<void>) {
    this._disposeFn = disposeFn;
  }

  /**
   * 释放资源
   * @returns void或Promise
   */
  dispose(): void | Promise<void> {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    return this._disposeFn();
  }

  /**
   * 检查资源是否已释放
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * 基于函数创建Disposable
   * @param fn 释放函数
   * @returns Disposable实例
   */
  static from(fn: () => void | Promise<void>): Disposable {
    return new DisposableImpl(fn);
  }
}

/**
 * 组合多个Disposable为一个
 * @param disposables 要组合的Disposable列表
 * @returns 组合后的Disposable
 */
export function combineDisposables(...disposables: Disposable[]): Disposable {
  return {
    async dispose() {
      // 收集所有的dispose结果，等待所有异步操作完成
      const promises: Array<void | Promise<void>> = [];
      
      for (const disposable of disposables) {
        try {
          const result = disposable.dispose();
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (error) {
          console.error('Error disposing resource:', error);
        }
      }
      
      // 等待所有异步dispose完成
      if (promises.length > 0) {
        await Promise.all(
          promises.filter(p => p instanceof Promise)
        );
      }
    }
  };
}

/**
 * 创建一个可跟踪多个Disposable的集合
 * @returns DisposableCollection实例
 */
export function createDisposableCollection(): {
  add: (disposable: Disposable) => void;
  dispose: () => Promise<void>;
} {
  const disposables: Disposable[] = [];
  
  return {
    add(disposable: Disposable) {
      disposables.push(disposable);
    },
    
    async dispose() {
      const copyOfDisposables = [...disposables];
      disposables.length = 0;
      
      await combineDisposables(...copyOfDisposables).dispose();
    }
  };
} 
import { IDisposable } from '../types';

/**
 * Disposable 实现类
 * 
 * 提供资源释放的基础实现
 */
export class Disposable implements IDisposable {
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
  static from(fn: () => void | Promise<void>): IDisposable {
    return new Disposable(fn);
  }
}

/**
 * 组合多个Disposable为一个
 * @param disposables 要组合的Disposable列表
 * @returns 组合后的Disposable
 */
export function combineDisposables(...disposables: (IDisposable)[]): IDisposable {
  return {
    dispose() {      
      for (const disposable of disposables) {
        try {
          disposable.dispose();
        } catch (error) {
          console.error('Error disposing resource:', error);
        }
      }
    }
  };
}

/**
 * 创建一个可跟踪多个Disposable的集合
 * @returns DisposableCollection实例
 */
export function createDisposableCollection(): {
  add: (disposable: IDisposable) => void;
  dispose: () => void;
} {
  const disposables: IDisposable[] = [];
  
  return {
    add(disposable: IDisposable) {
      disposables.push(disposable);
    },
    
    dispose() {
      const copyOfDisposables = [...disposables];
      disposables.length = 0;
      
      combineDisposables(...copyOfDisposables).dispose();
    }
  };
} 
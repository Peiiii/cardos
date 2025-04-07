import { Disposable, ServiceRegistry } from '../types';
import { DisposableImpl } from './disposable';

/**
 * 服务注册表实现
 */
export class ServiceRegistryImpl implements ServiceRegistry {
  private _services: Map<string, any> = new Map();

  /**
   * 注册服务
   * @param id 服务ID
   * @param implementation 服务实现
   * @returns 可释放对象，用于取消注册
   */
  register<T>(id: string, implementation: T): Disposable {
    if (this._services.has(id)) {
      throw new Error(`服务 "${id}" 已经注册`);
    }

    this._services.set(id, implementation);

    return DisposableImpl.from(() => {
      this._services.delete(id);
    });
  }

  /**
   * 获取服务
   * @param id 服务ID
   * @returns 服务实现或undefined
   */
  get<T>(id: string): T | undefined {
    return this._services.get(id) as T | undefined;
  }

  /**
   * 检查服务是否已注册
   * @param id 服务ID
   * @returns 是否已注册
   */
  has(id: string): boolean {
    return this._services.has(id);
  }

  /**
   * 列出所有已注册的服务ID
   * @returns 服务ID数组
   */
  getServiceIds(): string[] {
    return Array.from(this._services.keys());
  }

  /**
   * 释放所有服务
   */
  dispose(): void {
    // 释放所有可释放的服务
    for (const [id, service] of this._services.entries()) {
      if (service && typeof service === 'object' && 'dispose' in service && typeof service.dispose === 'function') {
        try {
          service.dispose();
        } catch (error) {
          console.error(`释放服务 "${id}" 时出错:`, error);
        }
      }
    }

    this._services.clear();
  }
}

/**
 * 创建新的服务注册表
 * @returns 服务注册表实例
 */
export function createServiceRegistry(): ServiceRegistry {
  return new ServiceRegistryImpl();
} 
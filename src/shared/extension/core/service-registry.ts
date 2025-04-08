/* eslint-disable @typescript-eslint/no-explicit-any */
import { Disposable, ServiceRegistry, TypedKey } from '../types';
import { DisposableImpl } from './disposable';

/**
 * 服务注册表实现
 */
export class ServiceRegistryImpl implements ServiceRegistry {
  private _services: Map<string, any> = new Map();

  /**
   * 注册服务
   * 支持字符串ID和TypedKey
   * @param serviceId 服务ID或类型安全的服务键
   * @param service 服务实现
   * @returns 可释放对象，用于取消注册
   */
  registerService<T = any>(
    serviceId: string | TypedKey<T>, 
    service: T
  ): Disposable {
    const id = typeof serviceId === 'string' ? serviceId : serviceId.name;
    
    if (this._services.has(id)) {
      throw new Error(`服务 "${id}" 已经注册`);
    }

    this._services.set(id, service);

    return DisposableImpl.from(() => {
      this._services.delete(id);
    });
  }

  /**
   * 获取服务
   * 支持字符串ID和TypedKey
   * @param serviceId 服务ID或类型安全的服务键
   * @returns 服务实例
   */
  getService<T = any>(serviceId: string | TypedKey<T>): T | undefined {
    const id = typeof serviceId === 'string' ? serviceId : serviceId.name;
    return this._services.get(id) as T | undefined;
  }

  /**
   * 检查服务是否已注册
   * @param id 服务ID
   * @returns 是否已注册
   */
  hasService(id: string): boolean {
    return this._services.has(id);
  }

  /**
   * 获取所有已注册服务ID
   * @returns 服务ID数组
   */
  getServices(): string[] {
    return Array.from(this._services.keys());
  }

  /**
   * 释放所有服务
   */
  dispose(): void {
    this._services.clear();
  }
}
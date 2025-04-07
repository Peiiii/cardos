import { Disposable, Extension, ExtensionContext, ExtensionManifest } from '../types';
import { createCommandRegistry } from './command-registry';
import { createDisposableCollection, DisposableImpl } from './disposable';
import { EventEmitter } from './event-emitter';
import { createExtensionContext } from './extension-context';
import { createServiceRegistry } from './service-registry';

/**
 * 扩展管理器事件类型
 */
export interface ExtensionManagerEvents {
  /**
   * 扩展加载事件
   */
  onExtensionLoaded: Extension;
  
  /**
   * 扩展激活事件
   */
  onExtensionActivated: Extension;
  
  /**
   * 扩展停用事件
   */
  onExtensionDeactivated: Extension;
  
  /**
   * 扩展错误事件
   */
  onExtensionError: { extension: Extension; error: Error };
}

/**
 * 扩展管理器 - 负责扩展的注册、激活和停用
 */
export class ExtensionManager implements Disposable {
  private _extensions: Map<string, Extension> = new Map();
  private _activatedExtensions: Map<string, { extension: Extension; context: ExtensionContext }> = new Map();
  private _disposables = createDisposableCollection();
  
  // 全局系统组件
  private _serviceRegistry = createServiceRegistry();
  private _commandRegistry = createCommandRegistry();
  private _eventBus = new EventEmitter();


  /**
   * 创建新的扩展管理器实例
   */
  constructor() {
    // 将全局系统添加到释放列表
    this._disposables.add(this._serviceRegistry);
    this._disposables.add(this._commandRegistry);
    this._disposables.add(this._eventBus);
  }

  /**
   * 获取事件发射器
   */
  get events() {
    return this._eventBus;
  }
  
  /**
   * 获取全局服务注册表
   */
  getGlobalServiceRegistry() {
    return this._serviceRegistry;
  }
  
  /**
   * 获取全局命令注册表
   */
  getGlobalCommandRegistry() {
    return this._commandRegistry;
  }
  
  /**
   * 获取全局事件发射器
   */
  getGlobalEventEmitter() {
    return this._eventBus;
  }

  /**
   * 注册扩展
   * @param extension 扩展对象
   */
  registerExtension(extension: Extension): Disposable {
    if (this._extensions.has(extension.manifest.id)) {
      throw new Error(`扩展 "${extension.manifest.id}" 已注册`);
    }

    this._extensions.set(extension.manifest.id, extension);
    this._eventBus.emit('onExtensionLoaded', extension);

    return DisposableImpl.from(() => {
      this.deactivateExtension(extension.manifest.id);
      this._extensions.delete(extension.manifest.id);
    });
  }

  /**
   * 通过扩展清单和模块注册扩展
   * @param manifest 扩展清单
   * @param module 扩展模块
   */
  registerExtensionWithModule(
    manifest: ExtensionManifest,
    module: { activate: Extension['activate']; deactivate?: Extension['deactivate'] }
  ): Disposable {
    const extension: Extension = {
      manifest,
      activate: module.activate,
      deactivate: module.deactivate
    };

    return this.registerExtension(extension);
  }

  /**
   * 激活扩展
   * @param extensionId 扩展ID
   */
  async activateExtension(extensionId: string): Promise<ExtensionContext | undefined> {
    if (this._activatedExtensions.has(extensionId)) {
      return this._activatedExtensions.get(extensionId)?.context;
    }

    const extension = this._extensions.get(extensionId);
    if (!extension) {
      throw new Error(`找不到扩展 "${extensionId}"`);
    }

    try {
      // 创建扩展上下文，传入扩展管理器以访问全局系统
      const context = createExtensionContext(extension, this);
      
      // 调用扩展的激活函数
      await extension.activate(context);
      
      // 记录已激活扩展
      this._activatedExtensions.set(extensionId, { extension, context });
      
      // 发出扩展激活事件
      this._eventBus.emit('onExtensionActivated', extension);
      
      return context;
    } catch (error) {
      // 处理激活错误
      const typedError = error instanceof Error ? error : new Error(String(error));
      this._eventBus.emit('onExtensionError', { extension, error: typedError });
      throw typedError;
    }
  }

  /**
   * 停用扩展
   * @param extensionId 扩展ID
   */
  async deactivateExtension(extensionId: string): Promise<void> {
    const activatedExtension = this._activatedExtensions.get(extensionId);
    if (!activatedExtension) {
      return; // 扩展未激活，无需停用
    }

    const { extension, context } = activatedExtension;

    try {
      // 调用扩展停用函数
      if (extension.deactivate) {
        await extension.deactivate();
      }
      
      // 释放扩展上下文资源
      await context.dispose();
      
      // 从激活列表中移除
      this._activatedExtensions.delete(extensionId);
      
      // 发出扩展停用事件
      this._eventBus.emit('onExtensionDeactivated', extension);
    } catch (error) {
      // 处理停用错误
      const typedError = error instanceof Error ? error : new Error(String(error));
      this._eventBus.emit('onExtensionError', { extension, error: typedError });
      throw typedError;
    }
  }

  /**
   * 获取所有已注册扩展
   */
  getExtensions(): Extension[] {
    return Array.from(this._extensions.values());
  }

  /**
   * 获取所有已激活的扩展
   */
  getActivatedExtensions(): { extension: Extension; context: ExtensionContext }[] {
    return Array.from(this._activatedExtensions.values());
  }

  /**
   * 获取特定扩展
   * @param extensionId 扩展ID
   */
  getExtension(extensionId: string): Extension | undefined {
    return this._extensions.get(extensionId);
  }

  /**
   * 检查扩展是否已激活
   * @param extensionId 扩展ID
   */
  isExtensionActivated(extensionId: string): boolean {
    return this._activatedExtensions.has(extensionId);
  }

  /**
   * 激活所有已注册扩展
   */
  async activateAllExtensions(): Promise<void> {
    const promises: Promise<ExtensionContext | undefined>[] = [];
    
    for (const extensionId of this._extensions.keys()) {
      if (!this._activatedExtensions.has(extensionId)) {
        promises.push(this.activateExtension(extensionId));
      }
    }
    
    await Promise.all(promises);
  }

  /**
   * 释放资源
   */
  async dispose(): Promise<void> {
    // 停用所有扩展
    const deactivationPromises: Promise<void>[] = [];
    
    for (const extensionId of this._activatedExtensions.keys()) {
      deactivationPromises.push(this.deactivateExtension(extensionId));
    }
    
    await Promise.all(deactivationPromises);
    
    // 清除扩展记录
    this._extensions.clear();
    this._activatedExtensions.clear();
    
    // 释放其他资源
    await this._disposables.dispose();
    
    // 清理事件监听
    this._eventBus.dispose();
  }
} 
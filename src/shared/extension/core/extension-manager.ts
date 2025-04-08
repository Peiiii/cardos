import {
  Disposable,
  ExtensionContext,
  ExtensionDefinition,
  ExtensionManifest,
  IExtensionManager,
  ExtensionManagerEvents,
  RxEvent
} from "../types";
import { CommandRegistryImpl } from "./command-registry";
import { createDisposableCollection } from "./disposable";
import { EventEmitterImpl } from "./event-emitter";
import { createExtensionContext } from "./extension-context";
import { ServiceRegistryImpl } from "./service-registry";

/**
 * 扩展管理器 - 负责扩展的注册、激活和停用
 */
export class ExtensionManager implements Disposable, IExtensionManager {
  private _extensions: Map<string, ExtensionDefinition> = new Map();
  private _activatedExtensions: Map<
    string,
    { extension: ExtensionDefinition; context: ExtensionContext }
  > = new Map();
  private _disposables = createDisposableCollection();

  // 全局系统组件
  private _serviceRegistry = new ServiceRegistryImpl();
  private _commandRegistry = new CommandRegistryImpl();
  private _eventBus = new EventEmitterImpl();

  // 事件
  private _internalEvents: ExtensionManagerEvents = {
    onExtensionLoaded: new RxEvent<ExtensionDefinition>(),
    onExtensionActivated: new RxEvent<ExtensionDefinition>(),
    onExtensionDeactivated: new RxEvent<ExtensionDefinition>(),
    onExtensionError: new RxEvent<{ extension: ExtensionDefinition; error: Error }>()
  };

  /**
   * 创建新的扩展管理器实例
   */
  constructor() {
    // 将全局系统添加到释放列表
    this._disposables.add(this._serviceRegistry);
    this._disposables.add(this._commandRegistry);
    this._disposables.add(this._eventBus);
    
    // 添加事件到释放列表
    this._disposables.add(this._internalEvents.onExtensionLoaded);
    this._disposables.add(this._internalEvents.onExtensionActivated);
    this._disposables.add(this._internalEvents.onExtensionDeactivated);
    this._disposables.add(this._internalEvents.onExtensionError);
  }

  /**
   * 获取全局服务注册表
   */
  get serviceRegistry() {
    return this._serviceRegistry;
  }

  /**
   * 获取全局命令注册表
   */
  get commandRegistry() {
    return this._commandRegistry;
  }

  /**
   * 获取全局事件发射器
   */
  get eventBus() {
    return this._eventBus;
  }

  /**
   * 获取扩展管理器事件
   */
  get internalEvents() {
    return this._internalEvents;
  }

  /**
   * 注册扩展定义
   * @param definition 扩展定义
   * @returns 扩展ID
   */
  registerExtension(definition: ExtensionDefinition): string {
    const id = definition.manifest.id;
    if (this._extensions.has(id)) {
      throw new Error(`扩展 "${id}" 已经注册`);
    }
    this._extensions.set(id, definition);
    this._internalEvents.onExtensionLoaded.fire(definition);
    return id;
  }

  /**
   * 从路径加载扩展
   * @param path 扩展路径
   * @returns 加载的扩展ID
   */
  async loadExtension(path: string): Promise<string> {
    // 注意：此处实现应该动态加载扩展代码
    // 以下是示例实现，实际需要根据具体场景调整
    try {
      // 动态导入扩展模块
      const extensionModule = await import(/* webpackIgnore: true */ path);
      if (!extensionModule.default) {
        throw new Error(`扩展模块 ${path} 没有默认导出`);
      }

      const definition = extensionModule.default as ExtensionDefinition;
      return this.registerExtension(definition);
    } catch (error) {
      throw new Error(
        `加载扩展 ${path} 失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 从目录加载多个扩展
   * @param directory 扩展目录
   * @returns 加载的扩展ID数组
   */
  async loadExtensions(directory: string): Promise<string[]> {
    // 注意：此处实现应该扫描目录并加载所有扩展
    // 实际实现需要根据具体场景调整
    console.log(`将从目录加载扩展: ${directory}`); // 使用directory变量避免lint错误
    return []; // 占位实现
  }

  /**
   * 获取扩展清单
   * @param extensionId 扩展ID
   * @returns 扩展清单或undefined
   */
  getExtensionManifest(extensionId: string): ExtensionManifest | undefined {
    const extension = this._extensions.get(extensionId);
    return extension?.manifest;
  }

  /**
   * 获取所有扩展名称
   * @returns 扩展ID数组
   */
  getExtensionNames(): string[] {
    return Array.from(this._extensions.keys());
  }

  /**
   * 激活扩展
   * @param extensionId 扩展ID
   * @returns 扩展上下文
   */
  async activateExtension(extensionId: string): Promise<void> {
    if (this._activatedExtensions.has(extensionId)) {
      return;
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

      // 更新激活状态

      // 记录已激活扩展
      this._activatedExtensions.set(extensionId, { extension, context });

      // 发出扩展激活事件
      this._internalEvents.onExtensionActivated.fire(extension);

      return;
    } catch (error) {
      // 处理激活错误
      const typedError =
        error instanceof Error ? error : new Error(String(error));
      this._internalEvents.onExtensionError.fire({ extension, error: typedError });
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
      this._internalEvents.onExtensionDeactivated.fire(extension);
    } catch (error) {
      // 处理停用错误
      const typedError =
        error instanceof Error ? error : new Error(String(error));
      this._internalEvents.onExtensionError.fire({ extension, error: typedError });
      throw typedError;
    }
  }

  /**
   * 获取所有已注册扩展
   */
  getExtensions(): ExtensionDefinition[] {
    return Array.from(this._extensions.values());
  }

  /**
   * 获取所有已激活的扩展
   */
  getActivatedExtensions(): {
    extension: ExtensionDefinition;
    context: ExtensionContext;
  }[] {
    return Array.from(this._activatedExtensions.values());
  }

  /**
   * 获取特定扩展
   * @param extensionId 扩展ID
   */
  getExtension(extensionId: string): ExtensionDefinition | undefined {
    return this._extensions.get(extensionId);
  }

  /**
   * 检查扩展是否已激活
   * @param extensionId 扩展ID
   */
  isExtensionActive(extensionId: string): boolean {
    return this._activatedExtensions.has(extensionId);
  }

  /**
   * 激活所有已注册扩展
   */
  async activateAllExtensions(): Promise<void> {
    const promises: Promise<unknown>[] = [];

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
  }
}

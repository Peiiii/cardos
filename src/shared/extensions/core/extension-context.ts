import { Disposable, Extension, ExtensionContext } from '../types';
import { DisposableImpl, createDisposableCollection } from './disposable';
import { ExtensionManager } from './extension-manager';
import { createLogger } from './logger';
import {
  CommandRegistryProxy,
  EventEmitterProxy,
  ServiceRegistryProxy
} from './proxies';
import { createStateStorage } from './state-storage';

/**
 * 创建扩展上下文
 * @param extension 扩展对象
 * @param manager 扩展管理器
 * @returns 扩展上下文
 */
export function createExtensionContext(extension: Extension, manager: ExtensionManager): ExtensionContext {
  const disposables = createDisposableCollection();
  const subscriptions: Disposable[] = [];
  
  // 获取全局系统
  const globalServices = manager.getGlobalServiceRegistry();
  const globalCommands = manager.getGlobalCommandRegistry();
  const globalEvents = manager.getGlobalEventEmitter();
  
  // 创建代理系统 - 访问全局系统但添加命名空间隔离
  const serviceRegistry = new ServiceRegistryProxy(globalServices, extension.manifest.id);
  const commandRegistry = new CommandRegistryProxy(globalCommands, extension.manifest.id);
  const eventBus = new EventEmitterProxy<Record<string, any>>(globalEvents, extension.manifest.id);
  
  // 创建隔离系统 - 每个扩展独立
  const logger = createLogger(`扩展:${extension.manifest.id}`);
  
  // 创建存储系统 - 分为工作区和全局
  const workspaceStorage = createStateStorage(`${extension.manifest.id}.workspace`);
  const globalStorage = createStateStorage(`${extension.manifest.id}.global`);
  
  // 存储组合对象
  const storage = {
    workspace: workspaceStorage,
    global: globalStorage
  };

  // 创建上下文对象
  const context: ExtensionContext = {
    // 资源管理
    subscriptions,

    // 服务注册和查询
    serviceRegistry,

    // 命令注册和执行
    commandRegistry,

    // 事件系统
    eventBus,

    // 日志
    logger,

    // 存储
    storage,

    // 释放所有资源
    async dispose() {
      // 释放所有订阅
      while (subscriptions.length > 0) {
        const disposable = subscriptions.pop();
        if (disposable) {
          try {
            await Promise.resolve(disposable.dispose());
          } catch (error) {
            logger.error('Error disposing subscription', error);
          }
        }
      }

      // 释放上下文其他资源
      await disposables.dispose();
    }
  };

  // 注册可释放资源的辅助函数
  // 由于接口简化后没有这个函数，我们仍保留内部实现以支持示例
  const registerDisposable = (disposable: Disposable): Disposable => {
    subscriptions.push(disposable);
    return DisposableImpl.from(() => {
      const index = subscriptions.indexOf(disposable);
      if (index !== -1) {
        subscriptions.splice(index, 1);
      }
      return disposable.dispose();
    });
  };

  // 添加扩展信息的内部字段
  // 这些字段在简化接口中被移除，但可能在实现中需要
  Object.defineProperties(context, {
    // 这些属性在内部使用，不暴露在公共接口中
    '_extensionId': { value: extension.manifest.id },
    '_extensionPath': { value: '' }, // 将在实际加载扩展时设置
    '_manifest': { value: extension.manifest },
    'registerDisposable': { value: registerDisposable }
  });

  // 添加其他资源到disposables
  // 注意：不需要添加代理对象，因为它们只是全局系统的代理
  disposables.add(logger);
  disposables.add(workspaceStorage);
  disposables.add(globalStorage);

  return context;
} 
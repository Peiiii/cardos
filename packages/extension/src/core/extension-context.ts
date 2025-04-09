/* eslint-disable @typescript-eslint/no-explicit-any */
import { MemoryStateStorage } from "./state-storage";
import { IDisposable, ExtensionContext, ExtensionDefinition } from "../types";
import { createDisposableCollection } from "./disposable";
import { ExtensionManager } from "./extension-manager";
import { createLogger } from "./logger";

/**
 * 创建扩展上下文
 * @param extension 扩展对象
 * @param manager 扩展管理器
 * @returns 扩展上下文
 */
export function createExtensionContext(
  extension: ExtensionDefinition,
  manager: ExtensionManager
): ExtensionContext {
  const disposables = createDisposableCollection();
  const subscriptions: IDisposable[] = [];
  const serviceRegistry = manager.serviceRegistry;
  const commandRegistry = manager.commandRegistry;
  const eventBus = manager.eventBus;
  // 创建隔离系统 - 每个扩展独立
  const logger = createLogger(`扩展:${extension.manifest.id}`);

  // 创建存储系统 - 分为工作区和全局
  const workspaceStorage = new MemoryStateStorage(
    `${extension.manifest.id}.workspace`
  );
  const globalStorage = new MemoryStateStorage(
    `${extension.manifest.id}.global`
  );

  // 存储组合对象
  const storage = {
    workspace: workspaceStorage,
    global: globalStorage,
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
            logger.error("Error disposing subscription", error);
          }
        }
      }

      // 释放上下文其他资源
      await disposables.dispose();
    },

    internalEvents: manager.internalEvents,
  };

  // 添加其他资源到disposables
  // 注意：不需要添加代理对象，因为它们只是全局系统的代理
  disposables.add(logger);
  disposables.add(workspaceStorage);
  disposables.add(globalStorage);

  return context;
}

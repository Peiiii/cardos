// 导出类型
export * from '../types';

// 导出资源管理相关实现
export { 
  DisposableImpl, 
  combineDisposables, 
  createDisposableCollection 
} from './disposable';

// 导出事件系统实现
export { EventEmitter as EventEmitterImpl } from './event-emitter';

// 导出日志工具实现
export { 
  ConsoleLogger, 
  LogLevel, 
  createLogger 
} from './logger';

// 导出服务注册表实现
export { 
  ServiceRegistryImpl,
  createServiceRegistry 
} from './service-registry';

// 导出命令注册表实现
export { 
  CommandRegistryImpl,
  createCommandRegistry 
} from './command-registry';

// 导出状态存储实现
export { 
  MemoryStateStorage,
  createStateStorage 
} from './state-storage';

// 导出代理类
export {
  ServiceRegistryProxy,
  CommandRegistryProxy,
  EventEmitterProxy
} from './proxies';

// 导出扩展上下文
export { createExtensionContext } from './extension-context';

// 导出扩展管理器
export { 
  ExtensionManager
} from './extension-manager';

// 导出扩展管理器类型
export type { ExtensionManagerEvents } from './extension-manager'; 
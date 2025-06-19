# CardOS Extension System 使用指南

## 快速上手

### 1. 基本设置

```typescript
import { ExtensionManager } from '@cardos/extension';

// 创建扩展管理器
const extensionManager = new ExtensionManager();

// 在应用启动时激活所有扩展
extensionManager.activateAllExtensions();
```

### 2. 创建简单扩展

```typescript
import { ExtensionDefinition, ExtensionContext } from '@cardos/extension';

const simpleExtension: ExtensionDefinition = {
  manifest: {
    id: 'simple-extension',
    name: '简单扩展',
    version: '1.0.0',
    description: '一个简单的示例扩展',
  },
  
  activate: (context: ExtensionContext) => {
    context.logger.info('简单扩展已激活');
    
    // 注册一个命令
    const commandDisposable = context.commandRegistry.registerCommand(
      'simple.hello',
      (name?: string) => {
        return `Hello, ${name || 'World'}!`;
      }
    );
    
    // 添加到订阅列表
    context.subscriptions.push(commandDisposable);
  }
};

// 注册扩展
extensionManager.registerExtension(simpleExtension);
```

## 常见用例

### 1. 主题切换扩展

```typescript
import { ExtensionDefinition, ExtensionContext, TypedKey } from '@cardos/extension';

// 定义类型安全的事件键
const ThemeChangedEvent = new TypedKey<{ theme: string }>('theme.changed');

const themeExtension: ExtensionDefinition = {
  manifest: {
    id: 'theme-switcher',
    name: '主题切换器',
    version: '1.0.0',
    description: '提供主题切换功能',
  },
  
  activate: async (context: ExtensionContext) => {
    const { logger, storage, eventBus, commandRegistry } = context;
    
    // 注册主题切换命令
    const commandDisposable = commandRegistry.registerCommand(
      'theme.switch',
      async (theme?: string) => {
        const currentTheme = await storage.global.get('current-theme', 'light');
        const newTheme = theme || (currentTheme === 'light' ? 'dark' : 'light');
        
        await storage.global.set('current-theme', newTheme);
        eventBus.emit(ThemeChangedEvent, { theme: newTheme });
        
        logger.info(`主题已切换到: ${newTheme}`);
        return newTheme;
      }
    );
    
    // 订阅主题变化事件
    const eventDisposable = eventBus.on(ThemeChangedEvent, (data) => {
      logger.info(`主题变化事件: ${data.theme}`);
    });
    
    // 注册主题服务
    const themeService = {
      getCurrentTheme: async () => {
        return await storage.global.get('current-theme', 'light');
      },
      setTheme: async (theme: string) => {
        await storage.global.set('current-theme', theme);
        eventBus.emit(ThemeChangedEvent, { theme });
      }
    };
    
    const serviceDisposable = context.serviceRegistry.registerService(
      'theme-service',
      themeService
    );
    
    // 添加到订阅列表
    context.subscriptions.push(
      commandDisposable,
      eventDisposable,
      serviceDisposable
    );
  }
};
```

### 2. 文件监控扩展

```typescript
import { ExtensionDefinition, ExtensionContext } from '@cardos/extension';

const fileWatcherExtension: ExtensionDefinition = {
  manifest: {
    id: 'file-watcher',
    name: '文件监控器',
    version: '1.0.0',
    description: '监控文件变化并触发事件',
  },
  
  activate: (context: ExtensionContext) => {
    const { logger, eventBus, subscriptions } = context;
    
    // 模拟文件监控
    const intervalId = setInterval(() => {
      eventBus.emit('file.changed', {
        path: '/example/file.txt',
        timestamp: new Date().toISOString()
      });
    }, 5000);
    
    // 订阅文件变化事件
    const eventDisposable = eventBus.on('file.changed', (data) => {
      logger.info(`文件变化: ${data.path} at ${data.timestamp}`);
    });
    
    // 注册文件监控服务
    const fileWatcherService = {
      startWatching: (path: string) => {
        logger.info(`开始监控文件: ${path}`);
      },
      stopWatching: (path: string) => {
        logger.info(`停止监控文件: ${path}`);
      }
    };
    
    const serviceDisposable = context.serviceRegistry.registerService(
      'file-watcher-service',
      fileWatcherService
    );
    
    // 添加到订阅列表
    subscriptions.push(
      eventDisposable,
      serviceDisposable,
      {
        dispose: () => {
          clearInterval(intervalId);
          logger.info('文件监控已停止');
        }
      }
    );
  }
};
```

### 3. 数据同步扩展

```typescript
import { ExtensionDefinition, ExtensionContext, TypedKey } from '@cardos/extension';

const DataSyncEvent = new TypedKey<{ data: any; timestamp: string }>('data.sync');

const dataSyncExtension: ExtensionDefinition = {
  manifest: {
    id: 'data-sync',
    name: '数据同步器',
    version: '1.0.0',
    description: '提供数据同步功能',
  },
  
  activate: async (context: ExtensionContext) => {
    const { logger, storage, eventBus, commandRegistry } = context;
    
    // 注册同步命令
    const commandDisposable = commandRegistry.registerCommand(
      'data.sync',
      async (data?: any) => {
        const syncData = data || { message: 'default sync data' };
        const timestamp = new Date().toISOString();
        
        // 保存到存储
        await storage.workspace.set('last-sync', { data: syncData, timestamp });
        
        // 触发同步事件
        eventBus.emit(DataSyncEvent, { data: syncData, timestamp });
        
        logger.info('数据同步完成');
        return { success: true, timestamp };
      }
    );
    
    // 订阅同步事件
    const eventDisposable = eventBus.on(DataSyncEvent, (eventData) => {
      logger.info(`数据同步事件: ${JSON.stringify(eventData)}`);
    });
    
    // 注册数据服务
    const dataService = {
      getLastSync: async () => {
        return await storage.workspace.get('last-sync');
      },
      syncData: async (data: any) => {
        return await commandRegistry.executeCommand('data.sync', data);
      }
    };
    
    const serviceDisposable = context.serviceRegistry.registerService(
      'data-sync-service',
      dataService
    );
    
    context.subscriptions.push(
      commandDisposable,
      eventDisposable,
      serviceDisposable
    );
  }
};
```

## 最佳实践

### 1. 资源管理

始终将创建的资源添加到 `context.subscriptions` 中：

```typescript
activate: (context: ExtensionContext) => {
  // 创建定时器
  const timer = setInterval(() => {
    // 定时任务
  }, 1000);
  
  // 创建事件监听器
  const eventListener = context.eventBus.on('some-event', () => {
    // 事件处理
  });
  
  // 添加到订阅列表
  context.subscriptions.push(
    { dispose: () => clearInterval(timer) },
    eventListener
  );
}
```

### 2. 错误处理

在扩展激活过程中妥善处理错误：

```typescript
activate: (context: ExtensionContext) => {
  try {
    // 扩展逻辑
    context.logger.info('扩展激活成功');
  } catch (error) {
    context.logger.error('扩展激活失败:', error);
    throw error; // 重新抛出错误，让扩展管理器处理
  }
}
```

### 3. 类型安全

使用 `TypedKey` 来创建类型安全的事件和服务：

```typescript
// 定义类型安全的事件键
const UserLoginEvent = new TypedKey<{ userId: string; timestamp: string }>('user.login');

// 使用类型安全的事件
context.eventBus.emit(UserLoginEvent, {
  userId: '123',
  timestamp: new Date().toISOString()
});

// 定义类型安全的服务键
const UserServiceKey = new TypedKey<{
  getUser: (id: string) => Promise<any>;
  updateUser: (id: string, data: any) => Promise<void>;
}>('user-service');

// 注册类型安全的服务
context.serviceRegistry.registerService(UserServiceKey, {
  getUser: async (id) => { /* 实现 */ },
  updateUser: async (id, data) => { /* 实现 */ }
});
```

### 4. 扩展间通信

扩展可以通过服务和事件进行通信：

```typescript
// 扩展A：注册服务
context.serviceRegistry.registerService('data-service', {
  getData: () => ['item1', 'item2'],
  addData: (item: string) => { /* 实现 */ }
});

// 扩展B：使用服务
const dataService = context.serviceRegistry.getService('data-service');
if (dataService) {
  const data = dataService.getData();
  dataService.addData('item3');
}
```

### 5. 存储使用

合理使用工作区和全局存储：

```typescript
// 工作区存储：工作区切换时会改变
await context.storage.workspace.set('workspace-config', { theme: 'dark' });

// 全局存储：跨工作区保持不变
await context.storage.global.set('user-preferences', { language: 'zh-CN' });

// 获取存储数据
const workspaceConfig = context.storage.workspace.get('workspace-config');
const userPrefs = context.storage.global.get('user-preferences');
```

### 6. 日志记录

使用结构化日志记录扩展活动：

```typescript
activate: (context: ExtensionContext) => {
  const { logger } = context;
  
  logger.info('扩展开始激活');
  
  try {
    // 扩展逻辑
    logger.debug('扩展逻辑执行中', { step: 'initialization' });
    
    // 更多逻辑
    logger.info('扩展激活完成');
  } catch (error) {
    logger.error('扩展激活失败', { error: error.message });
    throw error;
  }
}
```

## 调试技巧

### 1. 查看扩展状态

```typescript
// 获取所有扩展
const extensionNames = extensionManager.getExtensionNames();
console.log('已注册的扩展:', extensionNames);

// 检查扩展是否激活
const isActive = extensionManager.isExtensionActive('my-extension');
console.log('扩展是否激活:', isActive);

// 获取扩展清单
const manifest = extensionManager.getExtensionManifest('my-extension');
console.log('扩展清单:', manifest);
```

### 2. 查看服务和命令

```typescript
// 获取所有服务
const services = context.serviceRegistry.getServices();
console.log('已注册的服务:', services);

// 获取所有命令
const commands = context.commandRegistry.getCommands();
console.log('已注册的命令:', commands);

// 检查命令是否存在
const hasCommand = context.commandRegistry.hasCommand('my-command');
console.log('命令是否存在:', hasCommand);
```

### 3. 事件调试

```typescript
// 监听所有事件（调试用）
const debugDisposable = context.eventBus.on('*', (eventName, data) => {
  console.log(`事件: ${eventName}`, data);
});

// 添加到订阅列表
context.subscriptions.push(debugDisposable);
```

## 常见问题

### 1. 扩展没有激活

- 检查扩展是否正确注册
- 确认扩展ID唯一
- 查看控制台错误信息

### 2. 资源没有正确释放

- 确保所有资源都添加到 `context.subscriptions`
- 检查 `dispose` 方法是否正确实现

### 3. 服务找不到

- 确认服务已正确注册
- 检查服务ID是否正确
- 确认扩展激活顺序

### 4. 事件没有触发

- 检查事件名称是否正确
- 确认事件监听器已正确注册
- 查看事件数据格式

## 性能优化

### 1. 延迟加载

```typescript
activate: (context: ExtensionContext) => {
  // 延迟加载重资源
  setTimeout(() => {
    // 加载重资源
    context.logger.info('重资源加载完成');
  }, 1000);
}
```

### 2. 批量操作

```typescript
// 批量注册命令
const commands = [
  { id: 'cmd1', handler: () => {} },
  { id: 'cmd2', handler: () => {} },
  { id: 'cmd3', handler: () => {} }
];

const disposables = commands.map(cmd => 
  context.commandRegistry.registerCommand(cmd.id, cmd.handler)
);

context.subscriptions.push(...disposables);
```

### 3. 缓存服务

```typescript
// 缓存服务实例
let cachedService: any = null;

const getService = () => {
  if (!cachedService) {
    cachedService = context.serviceRegistry.getService('my-service');
  }
  return cachedService;
};
``` 
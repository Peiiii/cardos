# CardOS Extension System

CardOS 扩展系统是一个强大的插件架构，允许开发者通过扩展来增强和定制 CardOS 应用的功能。该系统提供了完整的生命周期管理、服务注册、命令系统、事件总线等核心功能。

## 📦 安装

```bash
npm install @cardos/extension
# 或
yarn add @cardos/extension
# 或
pnpm add @cardos/extension
```

## 🚀 快速开始

### 1. 创建扩展管理器

```typescript
import { ExtensionManager } from '@cardos/extension';

// 创建扩展管理器实例
const extensionManager = new ExtensionManager();

// 在应用启动时初始化
extensionManager.activateAllExtensions();
```

### 2. 创建你的第一个扩展

```typescript
import { ExtensionDefinition, ExtensionContext } from '@cardos/extension';

const myExtension: ExtensionDefinition = {
  manifest: {
    id: 'my-extension',
    name: '我的扩展',
    version: '1.0.0',
    description: '一个简单的示例扩展',
    author: '开发者',
  },
  
  activate: (context: ExtensionContext) => {
    // 扩展激活逻辑
    context.logger.info('扩展已激活!');
    
    // 注册命令
    const commandDisposable = context.commandRegistry.registerCommand(
      'my-extension.hello',
      (name?: string) => {
        return `Hello, ${name || 'World'}!`;
      }
    );
    
    // 添加到订阅列表，确保扩展停用时自动清理
    context.subscriptions.push(commandDisposable);
  },
  
  deactivate: () => {
    console.log('扩展已停用');
  }
};

// 注册扩展
extensionManager.registerExtension(myExtension);
```

## 📚 核心概念

### 1. 扩展定义 (ExtensionDefinition)

每个扩展都需要定义一个 `ExtensionDefinition` 对象，包含：

- **manifest**: 扩展的元数据信息
- **activate**: 扩展激活时调用的函数
- **deactivate**: 扩展停用时调用的函数（可选）

### 2. 扩展上下文 (ExtensionContext)

扩展激活时会收到一个 `ExtensionContext` 对象，提供以下功能：

- **subscriptions**: 管理需要释放的资源
- **serviceRegistry**: 服务注册和发现
- **commandRegistry**: 命令注册和执行
- **eventBus**: 事件发布和订阅
- **storage**: 数据持久化存储
- **logger**: 结构化日志记录

### 3. 生命周期管理

扩展系统提供完整的生命周期管理：

```typescript
// 激活扩展
extensionManager.activateExtension('my-extension');

// 停用扩展
extensionManager.deactivateExtension('my-extension');

// 检查扩展状态
const isActive = extensionManager.isExtensionActive('my-extension');
```

## 🔧 核心功能

### 1. 服务注册系统

扩展可以注册和发现服务：

```typescript
// 注册服务
const serviceDisposable = context.serviceRegistry.registerService(
  'my-service',
  {
    doSomething: () => 'Hello from service!'
  }
);

// 获取服务
const service = context.serviceRegistry.getService('my-service');
if (service) {
  service.doSomething();
}

// 添加到订阅列表
context.subscriptions.push(serviceDisposable);
```

### 2. 命令系统

扩展可以注册和执行命令：

```typescript
// 注册命令
const commandDisposable = context.commandRegistry.registerCommand(
  'my-command',
  (arg?: string) => {
    return `Command executed with arg: ${arg}`;
  }
);

// 执行命令
const result = await context.commandRegistry.executeCommand('my-command', 'test');

// 添加到订阅列表
context.subscriptions.push(commandDisposable);
```

### 3. 事件系统

扩展可以发布和订阅事件：

```typescript
// 订阅事件
const eventDisposable = context.eventBus.on('my-event', (data) => {
  console.log('收到事件:', data);
});

// 发布事件
context.eventBus.emit('my-event', { message: 'Hello from event!' });

// 添加到订阅列表
context.subscriptions.push(eventDisposable);
```

### 4. 存储系统

扩展可以使用工作区和全局存储：

```typescript
// 工作区存储（工作区切换时会改变）
await context.storage.workspace.set('key', 'value');
const value = context.storage.workspace.get('key');

// 全局存储（跨工作区保持不变）
await context.storage.global.set('global-key', 'global-value');
const globalValue = context.storage.global.get('global-key');
```

### 5. 日志系统

扩展可以使用结构化日志：

```typescript
context.logger.debug('调试信息');
context.logger.info('一般信息');
context.logger.warn('警告信息');
context.logger.error('错误信息');
```

## 📝 完整示例

### 主题切换扩展

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
    author: '开发者',
  },
  
  activate: async (context: ExtensionContext) => {
    const { logger, storage, eventBus, commandRegistry } = context;
    
    logger.info('主题切换扩展已激活');
    
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
      // 这里可以添加主题切换的UI逻辑
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
    
    logger.info('主题切换扩展初始化完成');
  },
  
  deactivate: () => {
    console.log('主题切换扩展已停用');
  }
};
```

### 文件监控扩展

```typescript
import { ExtensionDefinition, ExtensionContext } from '@cardos/extension';

const fileWatcherExtension: ExtensionDefinition = {
  manifest: {
    id: 'file-watcher',
    name: '文件监控器',
    version: '1.0.0',
    description: '监控文件变化并触发事件',
    author: '开发者',
  },
  
  activate: (context: ExtensionContext) => {
    const { logger, eventBus, subscriptions } = context;
    
    logger.info('文件监控扩展已激活');
    
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

## 🔄 扩展加载

### 动态加载扩展

```typescript
// 从文件路径加载扩展
const extensionId = await extensionManager.loadExtension('./extensions/my-extension.js');

// 从目录加载所有扩展
const extensionIds = await extensionManager.loadExtensions('./extensions/');
```

### 扩展发现

```typescript
// 获取所有已注册的扩展
const extensionNames = extensionManager.getExtensionNames();

// 获取扩展清单
const manifest = extensionManager.getExtensionManifest('my-extension');

// 获取扩展定义
const extension = extensionManager.getExtension('my-extension');
```

## 🎯 最佳实践

### 1. 资源管理

始终将创建的资源添加到 `context.subscriptions` 中：

```typescript
activate: (context: ExtensionContext) => {
  // 创建资源
  const timer = setInterval(() => {}, 1000);
  const eventListener = context.eventBus.on('event', () => {});
  
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
```

### 4. 扩展间通信

扩展可以通过服务和事件进行通信：

```typescript
// 扩展A：注册服务
context.serviceRegistry.registerService('data-service', {
  getData: () => ['item1', 'item2']
});

// 扩展B：使用服务
const dataService = context.serviceRegistry.getService('data-service');
if (dataService) {
  const data = dataService.getData();
}
```

## 📖 API 参考

### ExtensionManager

扩展管理器的主要方法：

- `registerExtension(definition)`: 注册扩展
- `loadExtension(path)`: 从路径加载扩展
- `loadExtensions(directory)`: 从目录加载扩展
- `activateExtension(id)`: 激活扩展
- `deactivateExtension(id)`: 停用扩展
- `isExtensionActive(id)`: 检查扩展是否激活
- `getExtensionNames()`: 获取所有扩展名称
- `getExtensionManifest(id)`: 获取扩展清单

### ExtensionContext

扩展上下文提供的功能：

- `subscriptions`: 资源订阅列表
- `serviceRegistry`: 服务注册表
- `commandRegistry`: 命令注册表
- `eventBus`: 事件总线
- `storage`: 存储API
- `logger`: 日志API
- `internalEvents`: 内部事件

### 类型定义

- `ExtensionDefinition`: 扩展定义接口
- `ExtensionManifest`: 扩展清单接口
- `ExtensionContext`: 扩展上下文接口
- `IDisposable`: 可释放资源接口
- `TypedKey<T>`: 类型安全键类
- `RxEvent<T>`: 类型安全事件类

## 🤝 贡献

欢迎贡献代码和提出建议！请确保：

1. 遵循现有的代码风格
2. 添加适当的测试
3. 更新相关文档
4. 提交清晰的提交信息

## �� 许可证

MIT License 
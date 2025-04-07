# Cardos 扩展系统架构

## 一、设计目标

Cardos 扩展系统旨在提供一个灵活、可靠且易于使用的架构，允许第三方开发者通过扩展增强 Cardos 的功能。主要设计目标包括：

1. **可扩展性**：系统核心功能可通过扩展点灵活扩展
2. **隔离性**：扩展之间相互隔离，一个扩展的问题不应影响其他扩展
3. **生命周期管理**：完整控制扩展的安装、激活、停用和卸载过程
4. **类型安全**：提供完善的 TypeScript 类型定义，减少开发错误
5. **开发友好**：简化扩展开发流程，降低学习门槛

## 二、架构概述

```
扩展系统架构
├── 扩展管理器 (Extension Manager)
│   ├── 扩展注册表 (Extension Registry)
│   ├── 生命周期控制器 (Lifecycle Controller)
│   └── 依赖解析器 (Dependency Resolver)
├── 扩展通信层 (Extension Communication)
│   ├── 事件总线 (Event Bus)
│   ├── 服务注册表 (Service Registry)
│   └── 命令注册表 (Command Registry)
├── 扩展运行时 (Extension Runtime)
│   ├── 扩展上下文 (Extension Context)
│   ├── 存储 API (Storage API)
│   └── 日志系统 (Logging System)
└── 扩展点系统 (Extension Points)
    ├── 视图扩展点 (View Extension Points)
    ├── 命令扩展点 (Command Extension Points)
    └── 设置扩展点 (Configuration Extension Points)
```

### 架构关系图

扩展系统的各组件之间关系如下图所示：

```
┌────────────────────────────────────────────────────────────────┐
│                        Cardos 核心应用                          │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                        扩展管理器                               │
│                                                                │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │ 扩展注册表   │◄───►│生命周期控制器│◄───►│ 依赖解析器   │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                        扩展通信层                               │
│                                                                │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   事件总线   │◄───►│ 服务注册表   │◄───►│ 命令注册表   │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
└───────────────────────┬────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────┐  ┌────────────────────────┐
│           扩展实例                    │  │      扩展运行时         │
│  ┌─────────┐  ┌─────────┐  ┌────────┐│  │ ┌──────────────────┐   │
│  │ 扩展 A   │  │ 扩展 B   │  │ 扩展 C  ││  │ │    扩展上下文     │   │
│  │activate()│  │activate()│  │activate│││◄─┤ │                  │   │
│  │deactivate│  │deactivate│  │deactive│││  │ │ ┌───────┐ ┌────┐ │   │
│  └─────────┘  └─────────┘  └────────┘│  │ │ │ 存储API│ │日志 │ │   │
└──────────────────────────────────────┘  │ │ └───────┘ └────┘ │   │
                                         │ └──────────────────┘   │
                                         └────────────────────────┘
                                                   │
                                                   ▼
┌────────────────────────────────────────────────────────────────┐
│                        扩展点系统                               │
│                                                                │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │  视图扩展点  │     │  命令扩展点  │     │  设置扩展点  │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
└────────────────────────────────────────────────────────────────┘
```

这个架构图展示了从 Cardos 核心应用到各个扩展的完整流程。扩展管理器负责扩展的生命周期管理，扩展通信层提供扩展之间的通信机制，扩展运行时为扩展提供必要的上下文和API，而扩展点系统则定义了扩展可以扩展的系统部分。

## 三、核心组件

### 1. 扩展管理器

扩展管理器负责扩展的注册、激活、停用和卸载等生命周期管理。它维护所有已安装扩展的状态，处理扩展之间的依赖关系，并确保扩展按照正确的顺序加载和卸载。

### 2. 扩展通信层

扩展通信层提供扩展之间以及扩展与系统之间的通信机制。它包括事件总线（用于发布/订阅模式的通信）、服务注册表（用于注册和发现服务）以及命令注册表（用于注册和执行命令）。

### 3. 扩展运行时

扩展运行时为每个扩展提供运行环境和必要的 API。它包括扩展上下文（提供扩展所需的所有 API 和资源）、存储 API（用于数据持久化）以及日志系统（用于调试和记录）。

### 4. 扩展点系统

扩展点系统定义了扩展可以扩展的系统部分。它包括视图扩展点（用于扩展 UI）、命令扩展点（用于添加新命令）以及设置扩展点（用于扩展设置页面）等。

## 四、扩展生命周期

扩展的生命周期包括以下几个阶段：

1. **安装**：系统加载扩展描述文件，检查依赖关系，并准备扩展资源。
2. **激活**：系统调用扩展的 `activate` 函数，传入扩展上下文，扩展初始化自身。
3. **运行**：扩展运行并通过扩展点扩展系统功能。
4. **停用**：系统调用扩展的 `deactivate` 函数，扩展执行清理工作。
5. **卸载**：系统移除扩展及其资源。

### 生命周期流程图

```
┌─────────────────┐
│     开始        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐         ┌─────────────────┐
│  安装扩展包      │─────────►│ 依赖检查与解析   │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │                           │ 成功
         │                           ▼
┌────────┴────────┐         ┌─────────────────┐
│     失败        │◄────────┤  扩展注册        │
└─────────────────┘         └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  调用activate()  │
                            └────────┬────────┘
                                     │
              ┌────────────────────┐ │ ┌────────────────────┐
              │     扩展运行中...    │◄┼─┤  注册扩展贡献点     │
              └──────────┬─────────┘ │ └────────────────────┘
                         │           │
                         │           │
                         │           │
                         ▼           │
              ┌────────────────────┐ │
          ┌───┤  触发停用事件       │ │
          │   └────────────────────┘ │
          │                          │
          ▼                          ▼
┌─────────────────┐         ┌─────────────────┐
│ 调用deactivate() │◄────────┤   资源清理      │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  注销扩展贡献点   │─────────►│  移除扩展包     │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────┐
│                    结束                      │
└─────────────────────────────────────────────┘
```

在扩展的生命周期中，系统会严格按照上述流程管理扩展的状态。每个阶段都有明确的职责边界，确保扩展能够正确地初始化和清理资源。

特别注意，在激活阶段，扩展需要注册它的贡献点并初始化必要的资源。而在停用阶段，扩展必须释放所有资源，确保不会产生内存泄漏或其他副作用。

## 五、扩展开发流程

1. **创建扩展**：使用提供的扩展模板创建新扩展。
2. **定义清单**：在扩展清单中声明扩展的元数据、贡献点和依赖项。
3. **实现激活函数**：实现扩展的激活函数，注册服务、命令和事件处理器。
4. **实现停用函数**：实现扩展的停用函数，执行资源清理工作。
5. **测试与发布**：测试扩展功能并发布到扩展市场。

## 六、核心接口定义

```typescript
/**
 * 可释放资源接口
 * 
 * 用于管理需要释放的资源，如事件监听器、定时器等。
 * 支持同步和异步释放操作。
 */
interface Disposable {
  /**
   * 释放资源
   * 
   * 如果需要执行异步清理，可以返回 Promise
   * 如果是同步清理，可以返回 void
   */
  dispose(): void | Promise<void>;
}

/**
 * 扩展描述符
 * 
 * 定义扩展的元数据、贡献点和依赖项。
 * 类似于 VSCode 的 package.json 中的扩展描述部分。
 */
interface ExtensionManifest {
  /** 唯一标识符 */
  id: string;
  
  /** 显示名称 */
  name: string;
  
  /** 语义化版本 (遵循 semver 规范) */
  version: string;
  
  /** 扩展描述 */
  description?: string;
  
  /** 
   * 扩展贡献点
   * 声明扩展将向系统贡献的功能点
   */
  contributes?: {
    /** 视图贡献 */
    views?: {
      id: string;
      name: string;
      when?: string;
    }[];
    
    /** 命令贡献 */
    commands?: {
      id: string;
      title: string;
      icon?: string;
    }[];
    
    /** 设置贡献 */
    configuration?: {
      title: string;
      properties: Record<string, any>;
    };
  };
  
  /** 依赖的其他扩展列表 */
  dependencies?: string[];
}

/**
 * 扩展上下文
 * 
 * 提供扩展运行时所需的API和资源。
 * 在扩展激活时传递给扩展的activate方法。
 */
interface ExtensionContext {
  /** 
   * 订阅列表
   * 用于管理扩展创建的需要释放的资源
   * 扩展被停用时，这些资源会被自动释放
   */
  readonly subscriptions: Disposable[];
  
  /** 服务注册表，用于注册和发现服务 */
  readonly serviceRegistry: ServiceRegistry;
  
  /** 事件总线，用于发布和订阅事件 */
  readonly eventBus: EventEmitter;
  
  /** 
   * 存储API
   * 用于扩展数据的持久化
   */
  readonly storage: {
    /** 工作区级别的存储，在工作区切换时会改变 */
    readonly workspace: ExtensionStateStorage;
    
    /** 全局存储，跨工作区保持不变 */
    readonly global: ExtensionStateStorage;
  };
  
  /**
   * 日志API
   * 提供结构化日志记录功能
   */
  readonly logger: Logger;

  /**
   * 命令注册表
   * 用于注册和执行命令
   */
  readonly commandRegistry: CommandRegistry;
}

/**
 * 扩展激活函数
 * 
 * 扩展的入口点，在扩展被激活时调用
 * @param context 提供给扩展的上下文对象
 * @returns 可选的清理资源对象，或者void
 */
type ActivateFunction = (context: ExtensionContext) => Disposable | void | Promise<Disposable | void>;

/**
 * 扩展停用函数
 * 
 * 在扩展被停用时调用，用于清理资源
 * @returns void或Promise
 */
type DeactivateFunction = () => void | Promise<void>;

/**
 * 服务注册表
 * 
 * 用于注册和获取服务的接口
 */
interface ServiceRegistry {
  /**
   * 注册服务
   * @param id 服务标识符
   * @param service 服务实现
   * @returns 用于注销服务的Disposable对象
   */
  register<T>(id: string, service: T): Disposable;
  
  /**
   * 获取服务
   * @param id 服务标识符
   * @returns 服务实例，如未找到则返回undefined
   */
  get<T>(id: string): T | undefined;
}

/**
 * 命令注册表
 * 
 * 用于注册和执行命令的接口
 */
interface CommandRegistry {
  /**
   * 注册命令
   * @param id 命令标识符
   * @param handler 命令处理函数
   * @returns 用于注销命令的Disposable对象
   */
  registerCommand(id: string, handler: (...args: any[]) => any): Disposable;
  
  /**
   * 注册带有特定类型参数的命令
   * @param id 命令标识符
   * @param handler 命令处理函数
   * @returns 用于注销命令的Disposable对象
   */
  registerCommand<T extends any[]>(id: string, handler: (...args: T) => any): Disposable;
  
  /**
   * 执行命令
   * @param id 命令标识符
   * @param args 命令参数
   * @returns 命令执行结果的Promise
   */
  executeCommand<T = any>(id: string, ...args: any[]): Promise<T>;
  
  /**
   * 获取所有已注册的命令
   * @returns 命令标识符数组
   */
  getCommands(): string[];
}

/**
 * 事件发射器
 * 
 * 用于发布和订阅事件的接口
 */
interface EventEmitter {
  /**
   * 发布事件
   * @param event 事件名称
   * @param data 事件数据
   */
  emit<T = any>(event: string, data: T): void;
  
  /**
   * 订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 用于取消订阅的Disposable对象
   */
  on<T = any>(event: string, handler: (data: T) => void): Disposable;
  
  /**
   * 一次性订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 用于取消订阅的Disposable对象
   */
  once<T = any>(event: string, handler: (data: T) => void): Disposable;
}

/**
 * 日志接口
 * 
 * 提供结构化日志记录功能
 */
interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * 扩展状态存储
 * 
 * 为扩展提供状态数据的持久化存储
 */
interface ExtensionStateStorage {
  /**
   * 获取存储的值
   * @param key 键名
   * @returns 存储的值，如果不存在则返回undefined
   */
  get<T>(key: string): T | undefined;
  
  /**
   * 获取存储的值，如果不存在则返回默认值
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 存储的值或默认值
   */
  get<T>(key: string, defaultValue: T): T;
  
  /**
   * 设置存储的值
   * @param key 键名
   * @param value 要存储的值
   * @returns 操作完成的Promise
   */
  set<T>(key: string, value: T): Promise<void>;
  
  /**
   * 获取所有键名
   * @returns 所有存储键的数组
   */
  keys(): string[];
  
  /**
   * 移除指定键的值
   * @param key 要移除的键
   * @returns 操作完成的Promise
   */
  delete(key: string): Promise<void>;
  
  /**
   * 清除所有存储的数据
   * @returns 操作完成的Promise
   */
  clear(): Promise<void>;
}
```

## 七、扩展开发示例

### 基本扩展示例

```typescript
// 扩展入口点
export function activate(context: ExtensionContext): void {
  // 注册命令
  const disposable = context.commandRegistry.registerCommand('myExtension.helloWorld', () => {
    console.log('Hello World from MyExtension!');
  });
  
  // 将资源添加到订阅列表，以便在扩展停用时自动清理
  context.subscriptions.push(disposable);
  
  // 监听事件
  const eventDisposable = context.eventBus.on('app:started', () => {
    console.log('Application started!');
  });
  
  context.subscriptions.push(eventDisposable);
  
  // 记录扩展已激活
  context.logger.info('MyExtension activated');
}

// 扩展停用函数
export function deactivate(): void {
  // 资源会通过 context.subscriptions 自动清理
  console.log('MyExtension deactivated');
}
```

### 高级扩展示例（提供服务）

```typescript
// 定义服务接口
interface GreetingService {
  greet(name: string): string;
}

// 扩展入口点
export function activate(context: ExtensionContext): void {
  // 实现服务
  const greetingService: GreetingService = {
    greet(name: string): string {
      return `Hello, ${name}!`;
    }
  };
  
  // 注册服务
  const serviceDisposable = context.serviceRegistry.register<GreetingService>(
    'services.greeting',
    greetingService
  );
  
  // 将服务添加到订阅列表
  context.subscriptions.push(serviceDisposable);
  
  // 存储数据
  context.storage.global.set('lastActivated', new Date().toISOString());
  
  // 记录扩展已激活
  context.logger.info('GreetingExtension activated');
}

export function deactivate(): void {
  // 清理工作
}
```

## 八、最佳实践

1. **资源管理**
   - 总是将创建的可释放资源添加到 `context.subscriptions`
   - 使用 `Disposable` 接口管理资源生命周期

   ```typescript
   // 推荐: 资源管理最佳实践
   function activate(context: ExtensionContext) {
     // 创建复合的Disposable对象
     const disposables: Disposable[] = [];
     
     // 添加多个订阅
     disposables.push(
       context.eventBus.on('event1', handleEvent1),
       context.eventBus.on('event2', handleEvent2)
     );
     
     // 一次性添加到上下文订阅
     context.subscriptions.push(...disposables);
   }
   ```

2. **错误处理**
   - 捕获并正确处理激活和停用过程中的错误
   - 使用 `context.logger` 记录错误和警告
   - 实现优雅降级策略

   ```typescript
   // 推荐: 错误处理最佳实践
   async function activate(context: ExtensionContext) {
     try {
       // 初始化过程
       await initializeExtension();
       
       // 注册命令
       const cmd = context.commandRegistry.registerCommand('myExt.command', () => {
         try {
           // 命令处理逻辑
           performAction();
         } catch (err) {
           // 不要让错误影响整个扩展
           context.logger.error('Command execution failed', err);
           // 向用户显示友好错误
           showErrorNotification('操作执行失败，请查看日志了解详情');
         }
       });
       
       context.subscriptions.push(cmd);
     } catch (err) {
       // 处理激活错误
       context.logger.error('Extension activation failed', err);
       // 重新抛出严重错误以防止错误的扩展加载
       throw new Error(`无法激活扩展: ${err.message}`);
     }
   }
   
   async function deactivate() {
     try {
       // 释放资源
       await cleanupResources();
     } catch (err) {
       // 记录错误但不阻止停用过程
       console.error('Error during extension deactivation:', err);
       // 错误不会被重新抛出，以确保扩展能被完全停用
     }
   }
   ```

3. **扩展间通信**
   - 使用服务注册表共享功能
   - 使用事件总线进行松耦合通信

   ```typescript
   // 扩展A: 提供服务
   export function activate(context: ExtensionContext) {
     // 定义并注册服务
     const myService = {
       getData: async () => { return { /* ... */ }; }
     };
     
     context.serviceRegistry.register('myExt.dataService', myService);
   }
   
   // 扩展B: 使用服务
   export function activate(context: ExtensionContext) {
     // 获取服务
     const dataService = context.serviceRegistry.get('myExt.dataService');
     if (dataService) {
       dataService.getData().then(data => {
         // 使用数据...
       });
     }
     
     // 通过事件通信
     context.eventBus.emit('myExt.dataRequested', { requestId: '123' });
   }
   ```

4. **性能注意事项**
   - 避免在激活函数中执行耗时操作
   - 按需延迟加载功能
   - 缓存频繁使用的计算结果

   ```typescript
   // 推荐: 延迟加载
   export function activate(context: ExtensionContext) {
     // 仅注册命令，不加载实际功能
     context.commandRegistry.registerCommand('myExt.heavyFeature', () => {
       // 仅在需要时加载
       import('./heavyFeature').then(module => {
         module.execute();
       }).catch(err => {
         context.logger.error('Failed to load feature', err);
       });
     });
   }
   ```

5. **安全考虑**
   - 验证用户输入
   - 不要在日志中记录敏感信息
   - 注意存储API中的数据安全

   ```typescript
   // 推荐: 输入验证
   function processUserInput(input: string) {
     // 验证输入
     if (!input || input.length > 100 || !/^[a-zA-Z0-9\s]+$/.test(input)) {
       throw new Error('无效输入');
     }
     
     // 处理安全的输入...
   }
   
   // 不推荐: 记录敏感信息
   function login(username: string, password: string) {
     context.logger.info(`Login attempt: ${username}, password: ${password}`); // 错误!
   }
   
   // 推荐: 安全日志
   function login(username: string, password: string) {
     context.logger.info(`Login attempt for user: ${username}`); // 正确
   }
   ```

6. **版本兼容性**
   - 处理API变更和向后兼容
   - 利用特性检测而不是版本检查
   - 优雅降级当功能不可用时

   ```typescript
   // 推荐: 特性检测
   export function activate(context: ExtensionContext) {
     // 检查API是否可用
     if ('newFeature' in context) {
       // 使用新API
       context.newFeature();
     } else {
       // 降级处理
       fallbackImplementation();
     }
   }
   ```

## 九、扩展发布与分发

Cardos 扩展系统提供了完整的扩展发布和分发流程，使开发者能够方便地分享他们的扩展。

### 1. 扩展打包

扩展打包是将扩展代码和资源打包成标准格式的过程，便于分发和安装。

```bash
# 使用官方打包工具打包扩展
cardos-cli package-extension --source ./my-extension --output ./dist
```

打包后的扩展包含以下内容：
- 编译后的代码和资源
- 扩展清单文件
- 依赖项和第三方库
- 文档和许可证信息

### 2. 扩展验证

在发布前，系统会对扩展进行验证，确保其符合安全和质量标准：

- **静态分析**：检查代码质量和潜在问题
- **权限验证**：确认扩展只使用其声明的权限
- **依赖检查**：验证所有依赖项的兼容性
- **性能测试**：确保扩展不会过度消耗资源

### 3. 扩展市场

Cardos 扩展市场是集中发布和分发扩展的平台：

- **发布流程**：
  1. 开发者注册并创建发布者账号
  2. 上传打包后的扩展
  3. 提供描述、截图和文档
  4. 等待审核通过后发布

- **版本管理**：
  - 支持发布更新和多版本并存
  - 版本号必须符合语义化版本规范
  - 可以发布预览版和稳定版

- **发现机制**：
  - 分类和标签系统
  - 搜索功能
  - 推荐和热门扩展
  - 用户评分和评论

### 4. 扩展安装与更新

扩展可以通过以下方式安装：

- **市场安装**：直接从扩展市场安装
- **VSIX安装**：从本地扩展包安装
- **开发模式**：从源代码目录加载（用于开发和测试）

更新机制：
- 自动检查更新
- 可配置的更新策略（自动/手动）
- 更新前备份用户数据

### 5. 企业分发

对于企业用户，Cardos 提供了私有扩展分发解决方案：

- **私有扩展市场**：企业可以搭建内部扩展市场
- **策略控制**：管理员可以控制哪些扩展可以安装
- **批量部署**：支持通过配置文件批量部署扩展

### 6. 签名与验证

为确保扩展的安全性和完整性，Cardos 实现了签名和验证机制：

- 扩展可以使用开发者证书进行签名
- 安装时验证签名确保来源可信
- 受信任的发布者可获得简化的审核流程

## 十、扩展加载模式

Cardos 扩展系统支持两种主要的扩展加载模式，以满足不同的开发和部署需求。

### 1. 打包扩展模式

打包扩展是传统的扩展形式，将扩展代码和资源打包为标准格式，适合正式发布和分发。

**特点：**
- 完整的文件结构，包含代码、资源和元数据
- 支持通过扩展市场分发
- 适合第三方开发和公开发布
- 支持完整的生命周期管理和版本控制

**结构示例：**
```
my-extension/
├── package.json       # 包含扩展清单信息
├── dist/              # 编译后的代码
│   ├── extension.js   # 主扩展代码
│   └── ...
├── node_modules/      # 依赖项
├── assets/            # 资源文件
└── README.md          # 文档
```

**加载过程：**
```typescript
// 系统内部加载打包扩展
const extension = await ExtensionLoader.loadPackagedExtension('./path/to/extension');
extensionManager.register(extension);
```

### 2. 对象式扩展模式

对象式扩展是一种更灵活的形式，直接提供扩展对象而非打包文件，特别适合内部扩展和运行时动态生成的扩展。

**特点：**
- 无需打包和文件系统操作
- 可以在运行时动态创建和注册
- 适合应用内置扩展或插件
- 更轻量级，加载速度更快

**对象结构：**
```typescript
// 直接定义扩展对象
const myExtension = {
  // 扩展清单
  manifest: {
    id: 'my-inline-extension',
    name: '内置扩展',
    version: '1.0.0',
    description: '直接以对象形式提供的扩展',
    contributes: {
      commands: [
        { id: 'myExt.command', title: '执行命令' }
      ]
    }
  },
  
  // 生命周期方法
  lifecycle: {
    activate: async (context) => {
      // 激活逻辑
      const disposable = context.commandRegistry.registerCommand(
        'myExt.command', 
        () => console.log('命令执行')
      );
      context.subscriptions.push(disposable);
      return;
    },
    
    deactivate: async () => {
      // 清理逻辑
      console.log('扩展停用');
    }
  }
};
```

**注册过程：**
```typescript
// 直接注册扩展对象
extensionManager.registerExtension(myExtension);
```

### 3. 混合使用场景

两种模式可以在同一系统中共存，满足不同场景的需求：

**内置扩展：**
```typescript
// 应用启动时注册内置扩展
function bootstrapApplication() {
  // 注册核心功能作为内置扩展
  const coreExtensions = [
    createFileExplorerExtension(),
    createTerminalExtension(),
    createSettingsExtension()
  ];
  
  // 注册内置扩展
  coreExtensions.forEach(ext => extensionManager.registerExtension(ext));
  
  // 然后加载用户安装的打包扩展
  loadUserExtensions();
}
```

**动态扩展生成：**
```typescript
// 根据用户配置动态生成扩展
function createDynamicExtension(config) {
  return {
    manifest: {
      id: `dynamic-${config.id}`,
      name: config.name,
      version: '1.0.0',
      contributes: config.features
    },
    lifecycle: {
      activate: async (context) => {
        // 根据配置实现功能
        implementFeatures(context, config);
      },
      deactivate: async () => {
        // 清理资源
      }
    }
  };
}

// 用户更改配置时动态创建
function onConfigChanged(newConfig) {
  const extension = createDynamicExtension(newConfig);
  extensionManager.registerExtension(extension);
}
```

### 4. 对象式扩展的优势与限制

**优势：**
- **简化开发流程**：无需设置复杂的构建过程
- **即时加载**：无需文件IO操作，加载更快
- **运行时生成**：可以根据上下文动态生成扩展
- **更容易调试**：直接操作内存中的对象
- **与应用紧密集成**：可以直接访问应用内部API

**限制：**
- **不支持市场分发**：无法通过标准扩展市场分发
- **资源管理受限**：不支持复杂的资源文件
- **隔离性较弱**：与应用代码边界不明确
- **更新机制不同**：需要应用更新一起发布

对象式扩展特别适合以下场景：
- 应用内置的核心功能模块化
- 企业内部定制扩展
- 动态生成的用户脚本
- 开发过程中的快速原型和测试

---

*注: 本文档描述了 Cardos 扩展系统的架构和设计原则。实际实现可能会根据项目需求进行调整。* 
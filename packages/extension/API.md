# CardOS Extension System API 文档

## 目录

- [核心类型](#核心类型)
- [ExtensionManager](#extensionmanager)
- [ExtensionContext](#extensioncontext)
- [服务注册表](#服务注册表)
- [命令注册表](#命令注册表)
- [事件总线](#事件总线)
- [存储系统](#存储系统)
- [日志系统](#日志系统)
- [工具类](#工具类)

## 核心类型

### ExtensionDefinition

扩展定义接口，描述一个扩展的完整信息。

```typescript
interface ExtensionDefinition<T = unknown> {
  /** 扩展清单 */
  manifest: ExtensionManifest;
  
  /** 激活扩展 */
  activate(context: ExtensionContext): T;
  
  /** 停用扩展（可选） */
  deactivate?(): void | Promise<void>;
}
```

### ExtensionManifest

扩展清单接口，包含扩展的元数据信息。

```typescript
interface ExtensionManifest {
  /** 扩展唯一标识符 */
  id: string;
  
  /** 扩展名称 */
  name: string;
  
  /** 扩展版本 */
  version: string;
  
  /** 扩展描述 */
  description: string;
  
  /** 扩展作者 */
  author?: string;
  
  /** 扩展主入口文件 */
  main?: string;
  
  /** 扩展贡献点 */
  contributes?: Record<string, any>;
  
  /** 扩展激活事件 */
  activationEvents?: string[];
  
  /** 扩展依赖项 */
  dependencies?: string[];
  
  /** 其他元数据 */
  [key: string]: any;
}
```

### ExtensionContext

扩展上下文接口，提供给扩展的运行时环境。

```typescript
interface ExtensionContext extends IAsyncDisposable {
  /** 订阅列表，用于管理需要释放的资源 */
  readonly subscriptions: IDisposable[];
  
  /** 服务注册表，用于注册和发现服务 */
  readonly serviceRegistry: ServiceRegistry;
  
  /** 事件总线，用于发布和订阅事件 */
  readonly eventBus: EventBus;
  
  /** 存储API，用于扩展数据的持久化 */
  readonly storage: {
    /** 工作区级别的存储，在工作区切换时会改变 */
    readonly workspace: ExtensionStateStorage;
    
    /** 全局存储，跨工作区保持不变 */
    readonly global: ExtensionStateStorage;
  };
  
  /** 日志API，提供结构化日志记录功能 */
  readonly logger: Logger;
  
  /** 命令注册表，用于注册和执行命令 */
  readonly commandRegistry: CommandRegistry;
  
  /** 内部事件 */
  readonly internalEvents: ExtensionManagerEvents;
}
```

## ExtensionManager

扩展管理器类，负责扩展的注册、激活和停用。

### 构造函数

```typescript
constructor()
```

创建一个新的扩展管理器实例。

### 属性

#### serviceRegistry
```typescript
get serviceRegistry(): ServiceRegistry
```
获取全局服务注册表。

#### commandRegistry
```typescript
get commandRegistry(): CommandRegistry
```
获取全局命令注册表。

#### eventBus
```typescript
get eventBus(): EventBus
```
获取全局事件发射器。

#### internalEvents
```typescript
get internalEvents(): ExtensionManagerEvents
```
获取扩展管理器事件。

### 方法

#### registerExtension

```typescript
registerExtension(definition: ExtensionDefinition): string
```

注册内部扩展，允许直接在代码中定义和注册扩展。

**参数：**
- `definition`: 扩展定义对象

**返回值：**
- 扩展名称，用于后续引用该扩展

**示例：**
```typescript
const extensionId = extensionManager.registerExtension(myExtension);
```

#### loadExtension

```typescript
loadExtension(path: string): Promise<string>
```

从文件系统加载扩展。

**参数：**
- `path`: 扩展路径（文件或目录）

**返回值：**
- 加载的扩展名称

**示例：**
```typescript
const extensionId = await extensionManager.loadExtension('./extensions/my-extension.js');
```

#### loadExtensions

```typescript
loadExtensions(directory: string): Promise<string[]>
```

加载目录中的所有扩展。

**参数：**
- `directory`: 目录路径

**返回值：**
- 加载的扩展名称数组

**示例：**
```typescript
const extensionIds = await extensionManager.loadExtensions('./extensions/');
```

#### getExtensionManifest

```typescript
getExtensionManifest(extensionName: string): ExtensionManifest | undefined
```

获取特定扩展的元数据。

**参数：**
- `extensionName`: 扩展名称

**返回值：**
- 扩展清单或undefined

**示例：**
```typescript
const manifest = extensionManager.getExtensionManifest('my-extension');
```

#### getExtensionNames

```typescript
getExtensionNames(): string[]
```

获取所有已注册的扩展名称。

**返回值：**
- 扩展名称数组

**示例：**
```typescript
const names = extensionManager.getExtensionNames();
```

#### isExtensionActive

```typescript
isExtensionActive(extensionName: string): boolean
```

判断扩展是否已激活。

**参数：**
- `extensionName`: 扩展名称

**返回值：**
- 是否已激活

**示例：**
```typescript
const isActive = extensionManager.isExtensionActive('my-extension');
```

#### activateExtension

```typescript
activateExtension(extensionName: string): void
```

激活扩展。

**参数：**
- `extensionName`: 扩展名称

**示例：**
```typescript
extensionManager.activateExtension('my-extension');
```

#### deactivateExtension

```typescript
deactivateExtension(extensionName: string): void
```

停用扩展。

**参数：**
- `extensionName`: 扩展名称

**示例：**
```typescript
extensionManager.deactivateExtension('my-extension');
```

#### activateAllExtensions

```typescript
activateAllExtensions(): void
```

激活所有已注册的扩展。

**示例：**
```typescript
extensionManager.activateAllExtensions();
```

#### dispose

```typescript
dispose(): void
```

释放扩展管理器及其所有资源。

**示例：**
```typescript
extensionManager.dispose();
```

## 服务注册表

### ServiceRegistry

服务注册表接口，用于注册和发现服务。

```typescript
interface ServiceRegistry extends IDisposable {
  /** 注册服务 */
  registerService<T = unknown>(
    serviceId: string | TypedKey<T>,
    service: T
  ): IDisposable;
  
  /** 获取服务 */
  getService<T = unknown>(serviceId: string | TypedKey<T>): T | undefined;
  
  /** 获取所有已注册服务ID */
  getServices(): string[];
}
```

### 方法

#### registerService

```typescript
registerService<T = unknown>(
  serviceId: string | TypedKey<T>,
  service: T
): IDisposable
```

注册服务。

**参数：**
- `serviceId`: 服务ID或类型安全的服务键
- `service`: 服务实例

**返回值：**
- 用于注销服务的Disposable对象

**示例：**
```typescript
const disposable = serviceRegistry.registerService('my-service', {
  doSomething: () => 'Hello'
});
```

#### getService

```typescript
getService<T = unknown>(serviceId: string | TypedKey<T>): T | undefined
```

获取服务。

**参数：**
- `serviceId`: 服务ID或类型安全的服务键

**返回值：**
- 服务实例，如果未找到则返回undefined

**示例：**
```typescript
const service = serviceRegistry.getService('my-service');
if (service) {
  service.doSomething();
}
```

#### getServices

```typescript
getServices(): string[]
```

获取所有已注册服务ID。

**返回值：**
- 服务ID数组

**示例：**
```typescript
const services = serviceRegistry.getServices();
```

## 命令注册表

### CommandRegistry

命令注册表接口，用于注册和执行命令。

```typescript
interface CommandRegistry extends IDisposable {
  /** 注册命令 */
  registerCommand<T = unknown, R = unknown>(
    commandId: string | TypedKey<(arg?: T) => R | Promise<R>>,
    handler: (arg?: T) => R | Promise<R>
  ): IDisposable;
  
  /** 执行命令 */
  executeCommand<T = unknown, R = unknown>(
    commandId: string | TypedKey<(arg?: T) => R | Promise<R>>,
    arg?: T
  ): Promise<R>;
  
  /** 获取所有已注册命令ID */
  getCommands(): string[];
  
  /** 检查命令是否已注册 */
  hasCommand(id: string): boolean;
}
```

### 方法

#### registerCommand

```typescript
registerCommand<T = unknown, R = unknown>(
  commandId: string | TypedKey<(arg?: T) => R | Promise<R>>,
  handler: (arg?: T) => R | Promise<R>
): IDisposable
```

注册命令。

**参数：**
- `commandId`: 命令ID或类型安全的命令键
- `handler`: 命令处理器

**返回值：**
- 用于注销命令的Disposable对象

**示例：**
```typescript
const disposable = commandRegistry.registerCommand('my-command', (arg) => {
  return `Command executed with arg: ${arg}`;
});
```

#### executeCommand

```typescript
executeCommand<T = unknown, R = unknown>(
  commandId: string | TypedKey<(arg?: T) => R | Promise<R>>,
  arg?: T
): Promise<R>
```

执行命令。

**参数：**
- `commandId`: 命令ID或类型安全的命令键
- `arg`: 命令参数

**返回值：**
- 命令执行结果的Promise

**示例：**
```typescript
const result = await commandRegistry.executeCommand('my-command', 'test');
```

#### getCommands

```typescript
getCommands(): string[]
```

获取所有已注册命令ID。

**返回值：**
- 命令ID数组

**示例：**
```typescript
const commands = commandRegistry.getCommands();
```

#### hasCommand

```typescript
hasCommand(id: string): boolean
```

检查命令是否已注册。

**参数：**
- `id`: 命令ID

**返回值：**
- 是否已注册

**示例：**
```typescript
const exists = commandRegistry.hasCommand('my-command');
```

## 事件总线

### EventBus

事件总线接口，用于发布和订阅事件。

```typescript
interface EventBus extends IDisposable {
  // 基于字符串的API
  /** 触发事件 */
  emit<T>(eventName: string, data: T): void;
  
  /** 订阅事件 */
  on<T>(eventName: string, handler: (data: T) => void): IDisposable;
  
  /** 订阅事件一次 */
  once<T>(eventName: string, handler: (data: T) => void): IDisposable;
  
  // 类型安全的TypedKey API
  /** 使用类型安全键触发事件 */
  emit<T>(key: TypedKey<T>, data: T): void;
  
  /** 使用类型安全键订阅事件 */
  on<T>(key: TypedKey<T>, handler: (data: T) => void): IDisposable;
  
  /** 使用类型安全键订阅事件一次 */
  once<T>(key: TypedKey<T>, handler: (data: T) => void): IDisposable;
}
```

### 方法

#### emit

```typescript
emit<T>(eventName: string, data: T): void
emit<T>(key: TypedKey<T>, data: T): void
```

触发事件。

**参数：**
- `eventName` 或 `key`: 事件名称或类型安全的事件键
- `data`: 事件数据

**示例：**
```typescript
// 使用字符串
eventBus.emit('user.login', { userId: '123' });

// 使用类型安全键
const UserLoginEvent = new TypedKey<{ userId: string }>('user.login');
eventBus.emit(UserLoginEvent, { userId: '123' });
```

#### on

```typescript
on<T>(eventName: string, handler: (data: T) => void): IDisposable
on<T>(key: TypedKey<T>, handler: (data: T) => void): IDisposable
```

订阅事件。

**参数：**
- `eventName` 或 `key`: 事件名称或类型安全的事件键
- `handler`: 事件处理函数

**返回值：**
- 用于取消订阅的Disposable对象

**示例：**
```typescript
// 使用字符串
const disposable = eventBus.on('user.login', (data) => {
  console.log('用户登录:', data);
});

// 使用类型安全键
const UserLoginEvent = new TypedKey<{ userId: string }>('user.login');
const disposable = eventBus.on(UserLoginEvent, (data) => {
  console.log('用户登录:', data);
});
```

#### once

```typescript
once<T>(eventName: string, handler: (data: T) => void): IDisposable
once<T>(key: TypedKey<T>, handler: (data: T) => void): IDisposable
```

订阅事件一次。

**参数：**
- `eventName` 或 `key`: 事件名称或类型安全的事件键
- `handler`: 事件处理函数

**返回值：**
- 用于取消订阅的Disposable对象

**示例：**
```typescript
const disposable = eventBus.once('user.login', (data) => {
  console.log('用户首次登录:', data);
});
```

## 存储系统

### ExtensionStateStorage

扩展状态存储接口，提供数据持久化功能。

```typescript
interface ExtensionStateStorage {
  /** 获取存储的值 */
  get<T = unknown>(key: string): T | undefined;
  get<T = unknown>(key: string, defaultValue: T): T;
  get<T>(key: TypedKey<T>): T | undefined;
  get<T>(key: TypedKey<T>, defaultValue: T): T;
  
  /** 设置值 */
  set<T = unknown>(key: string, value: T): Promise<void>;
  set<T>(key: TypedKey<T>, value: T): Promise<void>;
  
  /** 删除键 */
  delete(key: string): Promise<void>;
  delete<T>(key: TypedKey<T>): Promise<void>;
  
  /** 获取所有键 */
  keys(): readonly string[];
}
```

### 方法

#### get

```typescript
get<T = unknown>(key: string): T | undefined
get<T = unknown>(key: string, defaultValue: T): T
get<T>(key: TypedKey<T>): T | undefined
get<T>(key: TypedKey<T>, defaultValue: T): T
```

获取存储的值。

**参数：**
- `key`: 键名或类型安全的键
- `defaultValue`: 默认值（可选）

**返回值：**
- 存储的值或默认值

**示例：**
```typescript
// 使用字符串键
const value = storage.get('my-key');
const valueWithDefault = storage.get('my-key', 'default');

// 使用类型安全键
const MyKey = new TypedKey<string>('my-key');
const value = storage.get(MyKey);
const valueWithDefault = storage.get(MyKey, 'default');
```

#### set

```typescript
set<T = unknown>(key: string, value: T): Promise<void>
set<T>(key: TypedKey<T>, value: T): Promise<void>
```

设置值。

**参数：**
- `key`: 键名或类型安全的键
- `value`: 值（必须可序列化）

**返回值：**
- 操作完成的Promise

**示例：**
```typescript
// 使用字符串键
await storage.set('my-key', 'value');

// 使用类型安全键
const MyKey = new TypedKey<string>('my-key');
await storage.set(MyKey, 'value');
```

#### delete

```typescript
delete(key: string): Promise<void>
delete<T>(key: TypedKey<T>): Promise<void>
```

删除键。

**参数：**
- `key`: 键名或类型安全的键

**返回值：**
- 操作完成的Promise

**示例：**
```typescript
// 使用字符串键
await storage.delete('my-key');

// 使用类型安全键
const MyKey = new TypedKey<string>('my-key');
await storage.delete(MyKey);
```

#### keys

```typescript
keys(): readonly string[]
```

获取所有键。

**返回值：**
- 键名数组

**示例：**
```typescript
const allKeys = storage.keys();
```

## 日志系统

### Logger

日志接口，提供结构化日志记录功能。

```typescript
interface Logger extends IDisposable {
  /** 输出调试信息 */
  debug(message: string, ...args: any[]): void;
  
  /** 输出信息 */
  info(message: string, ...args: any[]): void;
  
  /** 输出警告 */
  warn(message: string, ...args: any[]): void;
  
  /** 输出错误 */
  error(message: string, ...args: any[]): void;
}
```

### 方法

#### debug

```typescript
debug(message: string, ...args: any[]): void
```

输出调试信息。

**参数：**
- `message`: 日志消息
- `args`: 额外参数

**示例：**
```typescript
logger.debug('调试信息', { data: 'value' });
```

#### info

```typescript
info(message: string, ...args: any[]): void
```

输出信息。

**参数：**
- `message`: 日志消息
- `args`: 额外参数

**示例：**
```typescript
logger.info('一般信息', { data: 'value' });
```

#### warn

```typescript
warn(message: string, ...args: any[]): void
```

输出警告。

**参数：**
- `message`: 日志消息
- `args`: 额外参数

**示例：**
```typescript
logger.warn('警告信息', { data: 'value' });
```

#### error

```typescript
error(message: string, ...args: any[]): void
```

输出错误。

**参数：**
- `message`: 日志消息
- `args`: 额外参数

**示例：**
```typescript
logger.error('错误信息', { data: 'value' });
```

## 工具类

### IDisposable

同步可释放资源接口。

```typescript
interface IDisposable {
  dispose(): void;
}
```

### IAsyncDisposable

异步可释放资源接口。

```typescript
interface IAsyncDisposable {
  dispose(): void;
}
```

### TypedKey

类型安全的键类，将字符串键与特定类型关联。

```typescript
class TypedKey<T> {
  _typeHolder: T = null as unknown as T;
  
  constructor(public readonly name: string) {}
  
  toString(): string;
  valueOf(): string;
}
```

### RxEvent

基于RxJS的类型安全事件类。

```typescript
class RxEvent<T> extends Subject<T> implements IDisposable {
  private _isDisposed = false;
  
  listen(fn: (value: T) => void): IDisposable;
  fire(value: T): void;
  dispose(): void;
}
```

### 工具函数

#### toDisposable

```typescript
function toDisposable(fn: () => void): IDisposable
```

创建一个同步Disposable。

**参数：**
- `fn`: 释放函数

**返回值：**
- IDisposable对象

**示例：**
```typescript
const disposable = toDisposable(() => {
  console.log('资源已释放');
});
```

#### toAsyncDisposable

```typescript
function toAsyncDisposable(fn: () => Promise<void>): IAsyncDisposable
```

创建一个异步Disposable。

**参数：**
- `fn`: 异步释放函数

**返回值：**
- IAsyncDisposable对象

**示例：**
```typescript
const disposable = toAsyncDisposable(async () => {
  await cleanup();
});
```

#### combinedDisposable

```typescript
function combinedDisposable(...disposables: IDisposable[]): IDisposable
```

组合多个同步Disposable。

**参数：**
- `disposables`: 要组合的Disposable列表

**返回值：**
- 组合后的IDisposable对象

**示例：**
```typescript
const combined = combinedDisposable(disposable1, disposable2, disposable3);
```

#### combinedAsyncDisposable

```typescript
function combinedAsyncDisposable(...disposables: IAsyncDisposable[]): IAsyncDisposable
```

组合多个异步Disposable。

**参数：**
- `disposables`: 要组合的AsyncDisposable列表

**返回值：**
- 组合后的IAsyncDisposable对象

**示例：**
```typescript
const combined = combinedAsyncDisposable(asyncDisposable1, asyncDisposable2);
``` 
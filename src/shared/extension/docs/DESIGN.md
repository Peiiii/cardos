# CardOS 扩展系统设计

本文档详细描述了 CardOS 扩展系统的架构设计和核心组件，为开发者提供全面的技术参考。

## 目录

1. [设计理念](#设计理念)
2. [核心组件](#核心组件)
   - [资源管理](#1-资源管理与生命周期)
   - [事件系统](#2-事件系统)
   - [命令系统](#3-命令系统)
   - [存储系统](#4-存储系统)
   - [服务注册系统](#5-服务注册系统)
   - [日志系统](#6-日志系统)
   - [扩展上下文](#7-扩展上下文)
   - [扩展生命周期](#8-扩展生命周期)
   - [扩展管理器](#9-扩展管理器)
3. [使用示例](#使用示例)
4. [设计优势](#设计优势)

## 设计理念

CardOS 扩展系统的设计基于以下核心理念：

- **简洁性**：减少不必要的复杂度，优先采用直观的 API 设计
- **灵活性**：提供足够的扩展能力，支持多种使用场景
- **类型安全**：充分利用 TypeScript 类型系统，提供强类型 API
- **资源管理**：统一的资源生命周期管理机制
- **模块化**：各组件职责明确，松耦合设计
- **可测试性**：设计便于单元测试和集成测试

## 核心组件

### 1. 资源管理与生命周期

扩展系统使用 `Disposable` 模式统一管理资源生命周期，确保资源能够被正确释放。

```typescript
export interface Disposable {
  dispose(): void;
}

// 辅助工具
export namespace Disposable {
  // 组合多个Disposable为一个
  export function from(...disposables: Disposable[]): Disposable {
    return {
      dispose: () => {
        for (const disposable of disposables) {
          disposable.dispose();
        }
      }
    };
  }
  
  // 空Disposable
  export const None: Disposable = { dispose: () => {} };
}
```

### 1.5 类型安全标识符 (TypedKey)

CardOS 扩展系统使用 `TypedKey` 模式提供类型安全的标识符，用于事件、服务、命令和存储等多种场景。

```typescript
/**
 * 类型安全的键，将字符串键与特定类型关联
 * @template T 与键关联的类型
 */
export class TypedKey<T> {
  /**
   * 创建一个新的类型安全键
   * @param name 键名称，可以包含命名空间(如'namespace.name')
   */
  constructor(public readonly name: string) {}

  /**
   * 为了便于调试和日志
   */
  toString(): string {
    return this.name;
  }

  /**
   * 便于在Map或Set中使用
   */
  valueOf(): string {
    return this.name;
  }
}
```

`TypedKey` 提供了一种类型安全的方式来定义和使用标识符，同时保持与基于字符串的API的兼容性。命名空间的管理由开发者自行处理，这样能提供更大的灵活性。它可以用于：

- **事件系统** - 绑定事件名称与事件数据类型
- **服务注册** - 将服务ID与服务接口类型绑定
- **命令系统** - 将命令ID与命令参数/返回值类型绑定
- **存储系统** - 将存储键与存储值类型绑定

### 2. 事件系统

CardOS 采用双轨事件系统设计，结合结构化事件和灵活的事件总线，满足不同场景需求。

#### 2.1 RxEvent - 结构化事件

`RxEvent` 基于 RxJS 的 Subject，提供类型安全的事件处理能力。

```typescript
import { Subject } from "rxjs";

export class RxEvent<T> extends Subject<T> implements Disposable {
  /**
   * 监听事件
   * @param fn 事件处理函数
   * @returns Disposable对象，用于取消监听
   */
  listen(fn: (value: T) => void): Disposable {
    const subscription = this.subscribe(fn);
    return { dispose: () => subscription.unsubscribe() };
  }

  /**
   * 触发事件
   * @param value 事件数据
   */
  fire(value: T): void {
    this.next(value);
  }
  
  /**
   * 释放资源
   * 实现Disposable接口
   */
  dispose(): void {
    this.complete();
    this.unsubscribe();
  }
}
```

#### 2.2 EventBus - 自由通信

`EventBus` 提供松散耦合的事件通信机制，适合扩展间通信。它同时支持基于字符串和类型安全的 TypedKey API。

```typescript
export interface EventBus {
  // 基于字符串的API
  emit<T>(eventName: string, data: T): void;
  on<T>(eventName: string, handler: (data: T) => void): Disposable;
  once<T>(eventName: string, handler: (data: T) => void): Disposable;
  
  // 类型安全的TypedKey API
  emit<T>(key: TypedKey<T>, data: T): void;
  on<T>(key: TypedKey<T>, handler: (data: T) => void): Disposable;
  once<T>(key: TypedKey<T>, handler: (data: T) => void): Disposable;
}
```

#### 2.3 SystemEvents - 系统事件

`SystemEvents` 接口定义了系统核心事件，所有事件均基于 `RxEvent`，提供类型安全的事件监听。

```typescript
export interface SystemEvents {
  // 扩展生命周期
  readonly onDidLoadExtension: RxEvent<ExtensionDefinition>;
  readonly onDidActivateExtension: RxEvent<ExtensionDefinition>;
  readonly onDidDeactivateExtension: RxEvent<ExtensionDefinition>;
  
  // 文件系统事件
  readonly onDidCreateFile: RxEvent<FileEventPayload>;
  readonly onDidDeleteFile: RxEvent<FileEventPayload>;
  readonly onDidChangeFile: RxEvent<FileChangeEventPayload>;
  
  // 命令事件
  readonly onDidRegisterCommand: RxEvent<CommandEventPayload>;
  readonly onDidExecuteCommand: RxEvent<CommandExecutionEventPayload>;
  
  // 服务事件
  readonly onDidRegisterService: RxEvent<ServiceEventPayload>;
}
```

### 3. 命令系统

命令系统支持扩展注册和执行命令，自动处理命名空间隔离。同时提供基于字符串和类型安全的TypedKey API。

```typescript
export interface CommandRegistry {
  // 基于字符串的API
  /**
   * 注册命令
   * @param id 命令ID (会自动添加扩展名称作为前缀)
   * @param handler 命令处理函数
   * @returns Disposable对象，用于注销命令
   */
  registerCommand<T = any, R = any>(id: string, handler: (arg?: T) => R | Promise<R>): Disposable;
  
  /**
   * 执行命令
   * @param id 完整命令ID (格式为 "扩展名.命令ID")
   * @param arg 命令参数
   * @returns 命令执行结果
   */
  executeCommand<T = any, R = any>(id: string, arg?: T): Promise<R>;
  
  /**
   * 获取所有已注册命令
   * @returns 命令ID数组
   */
  getCommands(): string[];
  
  // 类型安全的TypedKey API
  /**
   * 使用类型安全键注册命令
   * @param key 类型安全的命令键
   * @param handler 命令处理函数
   * @returns Disposable对象，用于注销命令
   */
  registerCommand<T, R>(key: TypedKey<(arg?: T) => R | Promise<R>>, handler: (arg?: T) => R | Promise<R>): Disposable;
  
  /**
   * 使用类型安全键执行命令
   * @param key 类型安全的命令键
   * @param arg 命令参数
   * @returns 命令执行结果
   */
  executeCommand<T, R>(key: TypedKey<(arg?: T) => R | Promise<R>>, arg?: T): Promise<R>;
}
```

### 4. 存储系统

存储系统提供多种存储选项，满足不同数据存储需求。

#### 4.1 StateStorage 接口

键值对存储，适合小型结构化数据。提供基于字符串和类型安全的TypedKey API。

```typescript
export interface StateStorage {
  // 基于字符串的API
  /**
   * 获取存储的值
   * @param key 键名
   * @returns 存储的值或undefined
   */
  get<T>(key: string): T | undefined;
  
  /**
   * 获取存储的值，不存在则返回默认值
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 存储的值或默认值
   */
  get<T>(key: string, defaultValue: T): T;
  
  /**
   * 设置值
   * @param key 键名
   * @param value 值(必须可序列化)
   * @returns 操作完成的Promise
   */
  set<T>(key: string, value: T): Promise<void>;
  
  /**
   * 删除键
   * @param key 键名
   * @returns 操作完成的Promise
   */
  delete(key: string): Promise<void>;
  
  /**
   * 获取所有键
   * @returns 只读的键名数组
   */
  keys(): readonly string[];
  
  // 类型安全的TypedKey API
  /**
   * 使用类型安全键获取存储的值
   * @param key 类型安全的键
   * @returns 存储的值或undefined
   */
  get<T>(key: TypedKey<T>): T | undefined;
  
  /**
   * 使用类型安全键获取存储的值，不存在则返回默认值
   * @param key 类型安全的键
   * @param defaultValue 默认值
   * @returns 存储的值或默认值
   */
  get<T>(key: TypedKey<T>, defaultValue: T): T;
  
  /**
   * 使用类型安全键设置值
   * @param key 类型安全的键
   * @param value 值(必须可序列化)
   * @returns 操作完成的Promise
   */
  set<T>(key: TypedKey<T>, value: T): Promise<void>;
  
  /**
   * 使用类型安全键删除键
   * @param key 类型安全的键
   * @returns 操作完成的Promise
   */
  delete<T>(key: TypedKey<T>): Promise<void>;
}
```

#### 4.2 FileStorage 接口

文件系统存储，适合大型数据或二进制数据。

```typescript
export interface FileStorage {
  /**
   * 获取存储路径
   * @param fileName 文件名
   * @returns 完整文件路径
   */
  getPath(fileName: string): string;
  
  /**
   * 读取文件
   * @param fileName 文件名
   * @returns 文件内容Buffer
   */
  readFile(fileName: string): Promise<Buffer>;
  
  /**
   * 写入文件
   * @param fileName 文件名
   * @param data 文件内容
   * @returns 操作完成的Promise
   */
  writeFile(fileName: string, data: Buffer): Promise<void>;
  
  /**
   * 判断文件是否存在
   * @param fileName 文件名
   * @returns 文件是否存在
   */
  exists(fileName: string): Promise<boolean>;
  
  /**
   * 删除文件
   * @param fileName 文件名
   * @returns 操作完成的Promise
   */
  delete(fileName: string): Promise<void>;
}
```

#### 4.3 SecretStorage 接口

加密存储，适合敏感数据。

```typescript
export interface SecretStorage {
  /**
   * 获取加密存储的值
   * @param key 键名
   * @returns 存储的值或undefined
   */
  get(key: string): Promise<string | undefined>;
  
  /**
   * 设置加密值
   * @param key 键名
   * @param value 值
   * @returns 操作完成的Promise
   */
  store(key: string, value: string): Promise<void>;
  
  /**
   * 删除加密值
   * @param key 键名
   * @returns 操作完成的Promise
   */
  delete(key: string): Promise<void>;
}
```

### 5. 服务注册系统

服务注册系统允许扩展注册和发现服务，支持扩展间功能共享。提供基于字符串和类型安全的TypedKey API。

```typescript
export interface ServiceRegistry {
  // 基于字符串的API
  /**
   * 注册服务
   * @param serviceId 服务ID (会自动添加扩展名称作为前缀)
   * @param service 服务实例
   * @returns Disposable对象，用于注销服务
   */
  registerService<T>(serviceId: string, service: T): Disposable;
  
  /**
   * 获取服务
   * @param serviceId 完整服务ID (格式为 "扩展名.服务ID")
   * @returns 服务实例或undefined
   */
  getService<T>(serviceId: string): T | undefined;
  
  /**
   * 获取所有已注册服务
   * @returns 服务ID数组
   */
  getServices(): string[];
  
  // 类型安全的TypedKey API
  /**
   * 使用类型安全键注册服务
   * @param key 类型安全的服务键
   * @param service 服务实例
   * @returns Disposable对象，用于注销服务
   */
  registerService<T>(key: TypedKey<T>, service: T): Disposable;
  
  /**
   * 使用类型安全键获取服务
   * @param key 类型安全的服务键
   * @returns 服务实例或undefined
   */
  getService<T>(key: TypedKey<T>): T | undefined;
}
```

### 6. 日志系统

日志系统提供结构化日志功能，支持不同级别和作用域。

```typescript
export interface Logger {
  // 基本日志级别
  trace(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  
  // 创建子日志器
  createScope(scope: string): Logger;
}
```

### 7. 扩展上下文

扩展上下文提供了扩展运行所需的所有API和资源。

```typescript
export interface ExtensionContext {
  // 扩展元数据
  readonly manifest: ExtensionManifest;
  
  // 资源管理
  readonly subscriptions: Disposable[];
  
  // 事件系统
  readonly systemEvents: SystemEvents;  // 系统事件
  readonly eventBus: EventBus;          // 事件总线
  
  // 命令系统
  readonly commandRegistry: CommandRegistry;
  
  // 服务系统
  readonly serviceRegistry: ServiceRegistry;
  
  // 存储系统
  readonly storage: {
    readonly workspace: StateStorage;   // 工作区级存储
    readonly global: StateStorage;      // 全局级存储
    readonly workspaceFiles: FileStorage; // 工作区文件存储
    readonly globalFiles: FileStorage;  // 全局文件存储
    readonly secrets?: SecretStorage;   // 加密存储(可选)
  };
  
  // 日志
  readonly logger: Logger;
}
```

### 8. 扩展定义与生命周期

扩展系统分离了扩展的定义和运行时实例，使开发者可以更灵活地创建和管理扩展。

#### 8.1 扩展定义 (ExtensionDefinition)

CardOS扩展系统中，开发者只需要提供扩展定义，系统会自动管理扩展的生命周期和状态。扩展定义包含元数据和生命周期函数：

```typescript
export interface ExtensionDefinition<T = any> {
  /**
   * 扩展元数据
   * 定义扩展的基本信息和贡献点
   */
  manifest: ExtensionManifest;
  
  /**
   * 扩展激活函数
   * 当扩展被激活时调用，用于初始化扩展并注册功能
   * @param context 扩展上下文，提供与系统交互的API
   * @returns 激活Promise，可用于异步初始化
   */
  activate(context: ExtensionContext): void | Promise<void>;
  
  /**
   * 扩展停用函数（可选）
   * 当扩展被停用时调用，用于清理资源
   * @returns void或Promise<void>
   */
  deactivate?(): void | Promise<void>;
}
```

#### 8.2 扩展清单 (ExtensionManifest)

扩展清单定义了扩展的元数据和贡献点。

```typescript
export interface ExtensionManifest {
  name: string;
  version: string;
  main: string;
  activationEvents?: string[];
  contributes?: {
    // 命令贡献点：定义用户可见和可执行的命令
    commands?: Array<{
      id: string;        // 命令ID
      title: string;     // 显示名称
      shortcut?: string; // 快捷键
      category?: string; // 命令分类
      icon?: string;     // 命令图标
    }>;
    
    // 服务贡献点：定义扩展提供的服务
    services?: Array<{
      id: string;        // 服务ID
      description: string; // 服务描述
    }>;
    
    // 配置贡献点：定义扩展的配置项
    configuration?: {
      title: string;     // 配置分组标题
      properties: Record<string, {
        type: string;    // 数据类型(string|number|boolean|array|object)
        default: any;    // 默认值
        description: string; // 描述
        enum?: any[];    // 可选值列表
        minimum?: number; // 最小值(数字类型)
        maximum?: number; // 最大值(数字类型)
        items?: any;     // 数组项定义(数组类型)
      }>
    };
    
    // 菜单贡献点：定义扩展添加的菜单项
    menus?: {
      // 各种菜单位置
      'context': Array<{
        command: string; // 关联的命令ID
        when?: string;   // 显示条件
        group?: string;  // 分组
      }>;
      'menubar': Array<{
        command: string;
        when?: string;
        group?: string;
      }>;
      // 其他菜单位置...
    };
    
    // 视图贡献点：定义扩展添加的视图
    views?: {
      explorer?: Array<{
        id: string;      // 视图ID
        name: string;    // 视图名称
        when?: string;   // 显示条件
      }>;
      sidebar?: Array<{
        id: string;
        name: string;
        when?: string;
      }>;
      // 其他视图容器...
    };
    
    // 主题贡献点：定义扩展提供的主题
    themes?: Array<{
      id: string;        // 主题ID
      label: string;     // 主题显示名称
      uiTheme: 'vs' | 'vs-dark' | 'hc'; // UI主题类型
      path: string;      // 主题文件路径
    }>;
    
    // 图标贡献点：定义扩展提供的图标
    iconThemes?: Array<{
      id: string;        // 图标主题ID
      label: string;     // 图标主题显示名称
      path: string;      // 图标定义文件路径
    }>;
    
    // 语言贡献点：定义扩展支持的语言
    languages?: Array<{
      id: string;        // 语言ID
      aliases: string[]; // 语言别名
      extensions: string[]; // 文件扩展名
      filenames?: string[]; // 特定文件名
      filenamePatterns?: string[]; // 文件名模式
      mimetypes?: string[]; // MIME类型
      configuration?: string; // 语言配置文件路径
    }>;
    
    // 工具栏贡献点：定义扩展添加的工具栏按钮
    toolbar?: Array<{
      id: string;        // 按钮ID
      command: string;   // 关联的命令ID
      group?: string;    // 分组
      when?: string;     // 显示条件
      priority?: number; // 优先级
    }>;
    
    // 快捷键贡献点：定义扩展添加的快捷键
    keybindings?: Array<{
      command: string;   // 关联的命令ID
      key: string;       // 键绑定
      mac?: string;      // macOS特定键绑定
      linux?: string;    // Linux特定键绑定
      win?: string;      // Windows特定键绑定
      when?: string;     // 激活条件
    }>;
    
    // 自定义编辑器贡献点：定义扩展提供的自定义编辑器
    customEditors?: Array<{
      viewType: string;  // 编辑器视图类型
      displayName: string; // 显示名称
      selector: Array<{ 
        filenamePattern: string // 文件名模式
      }>;
      priority?: string; // 优先级
    }>;
  };
  
  // 依赖其他扩展
  extensionDependencies?: string[];
  
  // 扩展描述信息
  displayName?: string;
  description?: string;
  publisher?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  bugs?: string;
  
  // 扩展引擎兼容性
  engines?: {
    cardos: string; // 支持的CardOS版本范围
    node?: string;  // 可选的Node.js版本范围
  };
  
  // 扩展分类
  categories?: string[];
  
  // 扩展图标
  icon?: string;
  
  // 是否为UI扩展
  isUI?: boolean;
};
```

#### 8.2 扩展实例 (Extension)

扩展实例表示已加载的扩展，包含其定义、运行时状态和API。

```typescript
export interface Extension<T = any> {
  /**
   * 扩展定义
   * 包含扩展的元数据和生命周期函数
   */
  readonly definition: ExtensionDefinition<T>;
  
  /**
   * 扩展当前状态
   * true表示扩展已激活，false表示未激活
   */
  readonly isActive: boolean;
}
```

改为：

#### 8.1 扩展定义 (ExtensionDefinition)

CardOS扩展系统中，开发者只需要提供扩展定义，系统会自动管理扩展的生命周期和状态。扩展定义包含元数据和生命周期函数：

```typescript
export interface ExtensionDefinition<T = any> {
  /**
   * 扩展元数据
   * 定义扩展的基本信息和贡献点
   */
  manifest: ExtensionManifest;
  
  /**
   * 扩展激活函数
   * 当扩展被激活时调用，用于初始化扩展并注册功能
   * @param context 扩展上下文，提供与系统交互的API
   * @returns 激活Promise，可用于异步初始化
   */
  activate(context: ExtensionContext): void | Promise<void>;
  
  /**
   * 扩展停用函数（可选）
   * 当扩展被停用时调用，用于清理资源
   * @returns void或Promise<void>
   */
  deactivate?(): void | Promise<void>;
}
```

同时修改ExtensionManager接口，将原来接收和返回Extension类型的地方改为ExtensionDefinition：

```typescript
export interface ExtensionManager {
  /**
   * 注册内部扩展
   * 允许直接在代码中定义和注册扩展
   * @param definition 扩展定义
   * @returns 扩展名称，用于后续引用该扩展
   */
  registerExtension(definition: ExtensionDefinition): string;
  
  /**
   * 加载外部扩展
   * 从文件系统加载扩展
   * @param path 扩展路径(文件或目录)
   * @returns 扩展名称
   */
  loadExtension(path: string): Promise<string>;
  
  /**
   * 加载目录中的所有扩展
   * @param directory 目录路径
   * @returns 加载的扩展名称数组
   */
  loadExtensions(directory: string): Promise<string[]>;
  
  /**
   * 获取特定扩展的元数据
   * @param extensionName 扩展名称
   * @returns 扩展清单或undefined
   */
  getExtensionManifest(extensionName: string): ExtensionManifest | undefined;
  
  /**
   * 获取所有已注册的扩展名称
   * @returns 扩展名称数组
   */
  getExtensionNames(): string[];
  
  /**
   * 判断扩展是否已激活
   * @param extensionName 扩展名称
   * @returns 是否已激活
   */
  isExtensionActive(extensionName: string): boolean;
  
  /**
   * 激活扩展
   * @param extensionName 扩展名称
   * @returns 激活操作的Promise
   */
  activateExtension(extensionName: string): Promise<void>;
  
  /**
   * 停用扩展
   * @param extensionName 扩展名称
   * @returns 操作完成的Promise
   */
  deactivateExtension(extensionName: string): Promise<void>;
  
  /**
   * 扩展管理器事件
   */
  readonly events: ExtensionManagerEvents;
}
```

### 8.5 系统事件

CardOS 扩展系统使用 `RxEvent` 提供类型安全的事件处理能力。`RxEvent` 基于 RxJS 的 Subject，同时提供简化的 API。

```typescript
export class RxEvent<T> extends Subject<T> implements Disposable {
  /**
   * 监听事件
   * @param fn 事件处理函数
   * @returns Disposable对象，用于取消监听
   */
  listen(fn: (value: T) => void): Disposable {
    const subscription = this.subscribe(fn);
    return { dispose: () => subscription.unsubscribe() };
  }

  /**
   * 触发事件
   * @param value 事件数据
   */
  fire(value: T): void {
    this.next(value);
  }
  
  /**
   * 释放资源
   * 实现Disposable接口
   */
  dispose(): void {
    this.complete();
    this.unsubscribe();
  }
}
```

#### 8.5.1 SystemEvents

`SystemEvents` 接口定义了系统核心事件，所有事件均基于 `RxEvent`，提供类型安全的事件监听。

```typescript
export interface SystemEvents {
  // 扩展生命周期
  readonly onDidLoadExtension: RxEvent<ExtensionDefinition>;
  readonly onDidActivateExtension: RxEvent<ExtensionDefinition>;
  readonly onDidDeactivateExtension: RxEvent<ExtensionDefinition>;
  
  // 文件系统事件
  readonly onDidCreateFile: RxEvent<FileEventPayload>;
  readonly onDidDeleteFile: RxEvent<FileEventPayload>;
  readonly onDidChangeFile: RxEvent<FileChangeEventPayload>;
  
  // 命令事件
  readonly onDidRegisterCommand: RxEvent<CommandEventPayload>;
  readonly onDidExecuteCommand: RxEvent<CommandExecutionEventPayload>;
  
  // 服务事件
  readonly onDidRegisterService: RxEvent<ServiceEventPayload>;
}
```

#### 8.5.2 ExtensionManagerEvents

`ExtensionManagerEvents` 接口定义了扩展管理器的事件，用于监控扩展的生命周期状态变化。

```typescript
export interface ExtensionManagerEvents {
  /**
   * 扩展加载事件
   * 当扩展被加载到系统时触发
   */
  readonly onExtensionLoaded: RxEvent<ExtensionDefinition>;
  
  /**
   * 扩展激活事件
   * 当扩展被成功激活时触发
   */
  readonly onExtensionActivated: RxEvent<ExtensionDefinition>;
  
  /**
   * 扩展停用事件
   * 当扩展被停用时触发
   */
  readonly onExtensionDeactivated: RxEvent<ExtensionDefinition>;
  
  /**
   * 扩展错误事件
   * 当扩展加载或激活过程中发生错误时触发
   */
  readonly onExtensionError: RxEvent<{ extension: ExtensionDefinition; error: Error }>;
}
```

### 9. 扩展管理器

CardOS 扩展系统使用 `ExtensionManager` 接口管理扩展的生命周期和状态。

```typescript
export interface ExtensionManager {
  /**
   * 注册内部扩展
   * 允许直接在代码中定义和注册扩展
   * @param definition 扩展定义
   * @returns 扩展名称，用于后续引用该扩展
   */
  registerExtension(definition: ExtensionDefinition): string;
  
  /**
   * 加载外部扩展
   * 从文件系统加载扩展
   * @param path 扩展路径(文件或目录)
   * @returns 扩展名称
   */
  loadExtension(path: string): Promise<string>;
  
  /**
   * 加载目录中的所有扩展
   * @param directory 目录路径
   * @returns 加载的扩展名称数组
   */
  loadExtensions(directory: string): Promise<string[]>;
  
  /**
   * 获取特定扩展的元数据
   * @param extensionName 扩展名称
   * @returns 扩展清单或undefined
   */
  getExtensionManifest(extensionName: string): ExtensionManifest | undefined;
  
  /**
   * 获取所有已注册的扩展名称
   * @returns 扩展名称数组
   */
  getExtensionNames(): string[];
  
  /**
   * 判断扩展是否已激活
   * @param extensionName 扩展名称
   * @returns 是否已激活
   */
  isExtensionActive(extensionName: string): boolean;
  
  /**
   * 激活扩展
   * @param extensionName 扩展名称
   * @returns 激活操作的Promise
   */
  activateExtension(extensionName: string): Promise<void>;
  
  /**
   * 停用扩展
   * @param extensionName 扩展名称
   * @returns 操作完成的Promise
   */
  deactivateExtension(extensionName: string): Promise<void>;
  
  /**
   * 扩展管理器事件
   */
  readonly events: ExtensionManagerEvents;
}
```

## 使用示例

CardOS 扩展系统支持两种扩展创建方式：内部扩展和外部扩展。下面展示这两种方式的使用示例。

### 内部扩展示例

内部扩展可以直接在代码中定义和注册，适合快速开发和测试：

```typescript
// 1. 定义内部扩展
const myInternalExtension: ExtensionDefinition = {
  // 扩展元数据
  manifest: {
    name: "my-tools",
    version: "1.0.0",
    displayName: "内部工具扩展",
    description: "提供一组实用工具函数",
    contributes: {
      commands: [
        {
          id: "format",
          title: "格式化文本",
          category: "工具"
        }
      ]
    }
  },
  
  // 激活函数
  activate(context) {
    // 注册命令
    const cmdDisposable = context.commandRegistry.registerCommand('format', (text) => {
      return text ? text.trim() : '';
    });
    
    // 注册服务
    const toolsService = {
      formatText: (text: string) => text.trim(),
      countWords: (text: string) => text.split(/\s+/).length
    };
    const svcDisposable = context.serviceRegistry.registerService('tools', toolsService);
    
    // 监听系统事件
    const eventDisposable = context.systemEvents.onDidChangeFile.listen(event => {
      context.logger.info(`文件已更改: ${event.path}`);
    });
    
    // 添加到订阅列表进行清理
    context.subscriptions.push(cmdDisposable, svcDisposable, eventDisposable);
    
    // 返回公开API
    return {
      formatText: toolsService.formatText,
      countWords: toolsService.countWords
    };
  },
  
  // 停用函数
  deactivate() {
    console.log("内部工具扩展已停用");
    // context.subscriptions中的资源会自动被清理
  }
};

// 2. 注册内部扩展
const extensionName = extensionManager.registerExtension(myInternalExtension);

// 3. 激活扩展并使用功能
async function useExtension() {
  // 激活扩展
  if (!extensionManager.isExtensionActive(extensionName)) {
    await extensionManager.activateExtension(extensionName);
  }
  
  // 通过命令系统使用扩展功能
  const formatResult = await extensionManager.commandRegistry.executeCommand(`${extensionName}.format`, "  测试文本  ");
  console.log(formatResult); // "测试文本"
  
  // 通过服务注册系统使用扩展功能
  const toolsService = extensionManager.serviceRegistry.getService(`${extensionName}.tools`);
  console.log(toolsService.countWords("Hello World")); // 2
}
```

### 外部扩展示例

外部扩展作为独立的文件或目录存在，需要通过扩展管理器加载：

#### 目录结构

```
my-extension/
├── package.json      # 扩展清单
├── dist/
│   └── extension.js  # 编译后的扩展代码
├── src/
│   ├── extension.ts  # 扩展源代码
│   └── utils.ts      # 辅助函数
└── README.md         # 说明文档
```

#### package.json

```json
{
  "name": "file-explorer",
  "version": "1.0.0",
  "displayName": "文件浏览器",
  "description": "增强的文件浏览功能",
  "main": "dist/extension.js",
  "engines": {
    "cardos": "^1.0.0"
  },
  "activationEvents": [
    "onCommand:file-explorer.open"
  ],
  "contributes": {
    "commands": [
      {
        "id": "open",
        "title": "打开文件浏览器",
        "category": "文件"
      }
    ],
    "views": {
      "explorer": [
        {
          "id": "fileExplorer",
          "name": "文件浏览器"
        }
      ]
    }
  }
}
```

#### extension.ts

```typescript
import { ExtensionContext } from 'cardos';
import { FileExplorerView } from './views/explorer';

// 扩展激活函数
export async function activate(context: ExtensionContext) {
  // 创建视图
  const explorer = new FileExplorerView();
  
  // 注册命令
  const disposable = context.commandRegistry.registerCommand('open', () => {
    explorer.show();
    return true;
  });
  
  // 注册清理
  context.subscriptions.push(disposable, explorer);
  
  // 返回API
  return {
    showExplorer: () => explorer.show(),
    hideExplorer: () => explorer.hide()
  };
}

// 扩展停用函数
export function deactivate() {
  console.log("文件浏览器扩展已停用");
}
```

#### 加载和使用外部扩展

```typescript
// 加载单个扩展
const extensionName = await extensionManager.loadExtension("/path/to/my-extension");
const manifest = extensionManager.getExtensionManifest(extensionName);
console.log(`已加载扩展: ${manifest?.displayName}`);

// 加载目录中的所有扩展
const extensionNames = await extensionManager.loadExtensions("/path/to/extensions-dir");
console.log(`已加载 ${extensionNames.length} 个扩展`);

// 激活扩展
await extensionManager.activateExtension("file-explorer");

// 执行扩展命令
await extensionManager.commandRegistry.executeCommand("file-explorer.open");
```

### 扩展间通信示例

扩展可以通过服务注册、事件总线或命令系统进行通信：

```typescript
// 扩展A: 注册服务
const extensionA: ExtensionDefinition = {
  manifest: { name: "data-provider", /* 其他元数据 */ },
  activate(context) {
    // 注册服务
    const dataService = {
      getData: async () => ({ value: 42 }),
      updateData: async (value) => console.log(`更新数据: ${value}`)
    };
    context.serviceRegistry.registerService('dataService', dataService);
    
    // 监听事件
    context.eventBus.on('data-consumer.requestData', () => {
      // 发布事件
      context.eventBus.emit('data-provider.dataUpdated', { value: 42, time: Date.now() });
    });
    
    return dataService;
  }
};

// 扩展B: 使用其他扩展的服务和事件
const extensionB: ExtensionDefinition = {
  manifest: { name: "data-consumer", /* 其他元数据 */ },
  async activate(context) {
    // 方式1: 通过服务注册获取服务
    const dataService = context.serviceRegistry.getService('data-provider.dataService');
    if (dataService) {
      const data = await dataService.getData();
      console.log(`获取到数据: ${data.value}`);
    }
    
    // 方式2: 通过事件总线通信
    const disposable = context.eventBus.on('data-provider.dataUpdated', (data) => {
      console.log(`收到数据更新: ${JSON.stringify(data)}`);
    });
    context.subscriptions.push(disposable);
    
    // 发送数据请求事件
    context.eventBus.emit('data-consumer.requestData');
    
    // 方式3: 通过命令系统调用
    const result = await context.commandRegistry.executeCommand('data-provider.getData');
    console.log(`通过命令获取数据: ${result.value}`);
    
    return { requestData: () => context.eventBus.emit('data-consumer.requestData') };
  }
};

// 注册扩展
extensionManager.registerExtension(extensionA);
extensionManager.registerExtension(extensionB);

// 按依赖顺序激活
await extensionManager.activateExtension("data-provider");
await extensionManager.activateExtension("data-consumer");
```

### TypedKey 使用示例

#### 事件系统

```typescript
// 事件数据类型定义
interface FileChangedData {
  path: string;
  content: string;
}

// 创建类型安全的事件键（命名空间由开发者自行管理）
const FileChangedKey = new TypedKey<FileChangedData>('file.changed');

// 使用类型安全的事件监听
context.eventBus.on(FileChangedKey, (data) => {
  // data 被自动推断为 FileChangedData 类型
  console.log(`文件已更改: ${data.path}, 内容长度: ${data.content.length}`);
});

// 类型安全的事件发布
context.eventBus.emit(FileChangedKey, {
  path: '/path/to/file.txt',
  content: '文件内容'
});

// 类型错误，会在编译时被捕获
// context.eventBus.emit(FileChangedKey, { 
//   wrongProperty: 'wrong-data' 
// });
```

#### 服务注册

```typescript
// 服务接口定义
interface LoggerService {
  log(message: string, level?: string): void;
  error(error: Error): void;
}

// 创建类型安全的服务键（包含命名空间）
const LoggerServiceKey = new TypedKey<LoggerService>('core.logger');

// 实现服务
const loggerService: LoggerService = {
  log: (message, level = 'info') => console.log(`[${level}] ${message}`),
  error: (error) => console.error('[ERROR]', error)
};

// 注册服务
context.serviceRegistry.registerService(LoggerServiceKey, loggerService);

// 获取服务
const logger = context.serviceRegistry.getService(LoggerServiceKey);
if (logger) {
  // logger 被自动推断为 LoggerService 类型
  logger.log('系统启动');
  logger.error(new Error('发生错误'));
}
```

#### 命令系统

```typescript
// 命令参数和返回值类型
interface FormatTextCommand {
  text: string;
  options?: { trim?: boolean; lowercase?: boolean };
}

type FormatTextResult = string;

// 创建类型安全的命令键
const FormatTextKey = new TypedKey<(arg: FormatTextCommand) => Promise<FormatTextResult>>('text.format');

// 注册命令
context.commandRegistry.registerCommand(FormatTextKey, async (arg) => {
  let result = arg.text;
  
  if (arg.options?.trim) {
    result = result.trim();
  }
  
  if (arg.options?.lowercase) {
    result = result.toLowerCase();
  }
  
  return result;
});

// 执行命令
const formattedText = await context.commandRegistry.executeCommand(FormatTextKey, {
  text: '  Hello World  ',
  options: { trim: true, lowercase: true }
});

console.log(formattedText); // "hello world"
```

#### 存储系统

```typescript
// 存储值类型
interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  showLineNumbers: boolean;
}

// 创建类型安全的存储键
const UserPreferencesKey = new TypedKey<UserPreferences>('user.preferences');

// 保存设置
await context.storage.global.set(UserPreferencesKey, {
  theme: 'dark',
  fontSize: 14,
  showLineNumbers: true
});

// 读取设置
const preferences = await context.storage.global.get(UserPreferencesKey);
if (preferences) {
  // preferences 被自动推断为 UserPreferences 类型
  console.log(`主题: ${preferences.theme}, 字体大小: ${preferences.fontSize}px`);
}
```

### 扩展间通信示例

// ... existing code ...

// 添加使用TypedKey的扩展间通信示例
```typescript
// 共享事件类型定义
interface DataUpdatedEvent {
  value: number;
  time: number;
}

interface DataRequestEvent {
  requestId: string;
}

// 创建类型安全的事件键
const DataUpdatedKey = new TypedKey<DataUpdatedEvent>('data-provider.dataUpdated');
const DataRequestKey = new TypedKey<DataRequestEvent>('data-consumer.requestData');

// 服务接口定义
interface DataService {
  getData(): Promise<{ value: number }>;
  updateData(value: number): Promise<void>;
}

// 创建类型安全的服务键
const DataServiceKey = new TypedKey<DataService>('data-provider.dataService');

// 扩展A: 注册服务
const extensionA: ExtensionDefinition = {
  manifest: { name: "data-provider", /* 其他元数据 */ },
  activate(context) {
    // 实现服务
    const dataService: DataService = {
      getData: async () => ({ value: 42 }),
      updateData: async (value) => console.log(`更新数据: ${value}`)
    };
    
    // 注册服务
    context.serviceRegistry.registerService(DataServiceKey, dataService);
    
    // 监听事件 - 类型安全
    context.eventBus.on(DataRequestKey, (data) => {
      console.log(`收到数据请求: ${data.requestId}`);
      // 发布事件 - 类型安全
      context.eventBus.emit(DataUpdatedKey, { 
        value: 42, 
        time: Date.now() 
      });
    });
    
    return dataService;
  }
};

// 扩展B: 使用其他扩展的服务和事件
const extensionB: ExtensionDefinition = {
  manifest: { name: "data-consumer", /* 其他元数据 */ },
  async activate(context) {
    // 方式1: 通过服务注册获取服务 - 类型安全
    const dataService = context.serviceRegistry.getService(DataServiceKey);
    if (dataService) {
      const data = await dataService.getData();
      console.log(`获取到数据: ${data.value}`);
    }
    
    // 方式2: 通过事件总线通信 - 类型安全
    const disposable = context.eventBus.on(DataUpdatedKey, (data) => {
      console.log(`收到数据更新: 值=${data.value}, 时间=${new Date(data.time).toISOString()}`);
    });
    context.subscriptions.push(disposable);
    
    // 发送数据请求事件 - 类型安全
    context.eventBus.emit(DataRequestKey, { requestId: 'req-001' });
    
    return { 
      requestData: (requestId: string) => 
        context.eventBus.emit(DataRequestKey, { requestId }) 
    };
  }
};
```

## 设计优势

CardOS 扩展系统设计具有以下优势：

1. **简洁直观**：API 设计简单明了，易于理解和使用
2. **模块化**：各组件职责明确，可独立使用和测试
3. **类型安全**：充分利用 TypeScript 类型系统，提供类型安全的 API
4. **资源管理**：统一的 Disposable 模式简化资源生命周期管理
5. **双轨事件系统**：结合 RxEvent 和 EventBus，既提供类型安全又保持灵活性
6. **多级存储**：提供多种存储选项，满足不同数据存储需求
7. **命名空间隔离**：自动为命令和服务添加扩展 ID 前缀，避免冲突
8. **现代设计**：采用现代 JavaScript/TypeScript 实践和设计模式
9. **增强的类型安全**：通过TypedKey模式实现更强的编译时类型检查，避免运行时类型错误
10. **双轨API设计**：同时支持类型安全的TypedKey API和传统的字符串API，兼顾类型安全和兼容性
11. **跨模块类型安全**：不需要集中定义所有事件类型，可以在不同模块中定义和使用类型安全的键
12. **分散式类型定义**：避免了大型集中式类型映射表，更好地支持模块化和按需加载
13. **灵活的命名空间管理**：命名空间完全由开发者自行管理，可以根据项目需求灵活定义命名规则

## 与其他扩展系统的对比

相比其他扩展系统（如 VSCode），CardOS 扩展系统的特点：

1. **更简洁的 API**：减少不必要的抽象层和复杂性
2. **更强大的事件系统**：RxEvent 基于 RxJS，提供强大的事件处理能力
3. **更直观的存储 API**：存储接口命名更清晰，功能分类更合理
4. **统一的资源管理**：一致的 Disposable 模式简化资源管理
5. **灵活的服务注册**：扩展间服务共享更加简单直接

## 实现考量

实现扩展系统时需要考虑以下因素：

1. **性能优化**：特别是事件系统和扩展加载过程
2. **内存管理**：确保资源能够正确释放，避免内存泄漏
3. **错误处理**：扩展错误应被正确隔离，不影响系统稳定性
4. **安全边界**：明确定义扩展能力边界，避免安全风险
5. **兼容性**：考虑向后兼容和未来扩展性

## 结论

CardOS 扩展系统提供了一个简洁、灵活且功能强大的架构，适用于各种可扩展应用场景。它通过精心设计的 API 和组件，平衡了易用性、类型安全性和扩展能力，为开发者提供了理想的扩展开发体验。 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject } from "rxjs";

/**
 * 可释放资源接口
 * 
 * 用于管理需要释放的资源，如事件监听器、定时器等。
 * 支持同步和异步释放操作。
 */
export interface Disposable {
  /**
   * 释放资源，可以同步或异步执行
   */
  dispose(): void | Promise<void>;
}

/**
 * 基于RxJS的类型安全事件
 * 提供简化的事件API
 */
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

/**
 * 类型安全的键，将字符串键与特定类型关联
 * @template T 与键关联的类型
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

/**
 * 扩展清单接口
 * 
 * 定义扩展的元数据、贡献点和依赖项。
 * 类似于 VSCode 的 package.json 中的扩展描述部分。
 */
export interface ExtensionManifest {
  /**
   * 扩展唯一标识符
   */
  id: string;
  
  /**
   * 扩展名称
   */
  name: string;
  
  /**
   * 扩展版本
   */
  version: string;
  
  /**
   * 扩展描述
   */
  description: string;
  
  /**
   * 扩展作者
   */
  author?: string;
  
  /**
   * 扩展主入口文件
   */
  main?: string;
  
  /**
   * 扩展贡献点
   */
  contributes?: Record<string, any>;
  
  /**
   * 扩展激活事件
   */
  activationEvents?: string[];
  
  /**
   * 扩展依赖项
   */
  dependencies?: string[];
  
  /**
   * 其他元数据
   */
  [key: string]: any;
}

/**
 * 扩展生命周期
 * 
 * 定义扩展的激活和停用行为
 */
export interface ExtensionLifecycle {
  /**
   * 激活函数
   * 
   * 扩展的入口点，在扩展被激活时调用
   * @param context 提供给扩展的上下文对象
   * @returns 可选的清理资源对象，或者void
   */
  activate: (context: ExtensionContext) => Disposable | void | Promise<Disposable | void>;

  /**
   * 停用函数
   * 
   * 在扩展被停用时调用，用于清理资源
   * @returns void或Promise
   */
  deactivate?: () => void | Promise<void>;
}

/**
 * 扩展定义
 * 
 * 包含扩展的元数据和生命周期函数，由开发者提供
 */
export interface ExtensionDefinition<T = unknown> {
  /**
   * 扩展清单
   */
  manifest: ExtensionManifest;
  
  /**
   * 激活扩展
   * @param context 扩展上下文
   * @returns 可选的扩展API对象或Promise
   */
  activate(context: ExtensionContext): T | Promise<T>;
  
  /**
   * 停用扩展（可选）
   */
  deactivate?(): void | Promise<void>;
}

/**
 * 扩展上下文
 * 
 * 提供扩展运行时所需的API和资源。
 * 在扩展激活时传递给扩展的activate方法。
 */
export interface ExtensionContext extends Disposable {
  /** 
   * 订阅列表
   * 用于管理扩展创建的需要释放的资源
   * 扩展被停用时，这些资源会被自动释放
   */
  readonly subscriptions: Disposable[];
  
  /** 服务注册表，用于注册和发现服务 */
  readonly serviceRegistry: ServiceRegistry;
  
  /** 事件总线，用于发布和订阅事件 */
  readonly eventBus: EventBus;
  
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

  /** 
   * 内部事件
   */
  readonly internalEvents: ExtensionManagerEvents;
}

/**
 * 服务注册表
 * 
 * 用于注册和获取服务的接口
 */
export interface ServiceRegistry extends Disposable {
  /**
   * 注册服务
   * @param serviceId 服务ID或类型安全的服务键
   * @param service 服务实例
   * @returns 用于注销服务的Disposable对象
   */
  registerService<T = unknown>(serviceId: string | TypedKey<T>, service: T): Disposable;
  
  /**
   * 获取服务
   * @param serviceId 服务ID或类型安全的服务键
   * @returns 服务实例，如果未找到则返回undefined
   */
  getService<T = unknown>(serviceId: string | TypedKey<T>): T | undefined;
  
  /**
   * 获取所有已注册服务ID
   * @returns 服务ID数组
   */
  getServices(): string[];
}

/**
 * 命令注册表
 * 
 * 用于注册和执行命令的接口
 */
export interface CommandRegistry extends Disposable {
  /**
   * 注册命令
   * @param commandId 命令ID或类型安全的命令键
   * @param handler 命令处理器
   * @returns 用于注销命令的Disposable对象
   */
  registerCommand<T = unknown, R = unknown>(
    commandId: string | TypedKey<(arg?: T) => R | Promise<R>>, 
    handler: (arg?: T) => R | Promise<R>
  ): Disposable;
  
  /**
   * 执行命令
   * @param commandId 命令ID或类型安全的命令键
   * @param arg 命令参数
   * @returns 命令执行结果的Promise
   */
  executeCommand<T = unknown, R = unknown>(
    commandId: string | TypedKey<(arg?: T) => R | Promise<R>>, 
    arg?: T
  ): Promise<R>;
  
  /**
   * 获取所有已注册命令ID
   * @returns 命令ID数组
   */
  getCommands(): string[];
  
  /**
   * 检查命令是否已注册
   * @param id 命令ID
   * @returns 是否已注册
   */
  hasCommand(id: string): boolean;
}

/**
 * 事件发射器
 * 
 * 用于发布和订阅事件的接口
 */
export interface EventBus extends Disposable {
  // 基于字符串的API
  /**
   * 触发事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  emit<T>(eventName: string, data: T): void;
  
  /**
   * 订阅事件
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @returns 用于取消订阅的Disposable对象
   */
  on<T>(eventName: string, handler: (data: T) => void): Disposable;
  
  /**
   * 订阅事件一次
   * @param eventName 事件名称
   * @param handler 事件处理函数
   * @returns 用于取消订阅的Disposable对象
   */
  once<T>(eventName: string, handler: (data: T) => void): Disposable;
  
  // 类型安全的TypedKey API
  /**
   * 使用类型安全键触发事件
   * @param key 类型安全的事件键
   * @param data 事件数据
   */
  emit<T>(key: TypedKey<T>, data: T): void;
  
  /**
   * 使用类型安全键订阅事件
   * @param key 类型安全的事件键
   * @param handler 事件处理函数
   * @returns 用于取消订阅的Disposable对象
   */
  on<T>(key: TypedKey<T>, handler: (data: T) => void): Disposable;
  
  /**
   * 使用类型安全键订阅事件一次
   * @param key 类型安全的事件键
   * @param handler 事件处理函数
   * @returns 用于取消订阅的Disposable对象
   */
  once<T>(key: TypedKey<T>, handler: (data: T) => void): Disposable;
}

/**
 * 日志接口
 * 
 * 提供结构化日志记录功能
 */
export interface Logger extends Disposable {
  /**
   * 输出调试信息
   * @param message 日志消息
   * @param args 额外参数
   */
  debug(message: string, ...args: any[]): void;
  
  /**
   * 输出信息
   * @param message 日志消息
   * @param args 额外参数
   */
  info(message: string, ...args: any[]): void;
  
  /**
   * 输出警告
   * @param message 日志消息
   * @param args 额外参数
   */
  warn(message: string, ...args: any[]): void;
  
  /**
   * 输出错误
   * @param message 日志消息
   * @param args 额外参数
   */
  error(message: string, ...args: any[]): void;
}

/**
 * 扩展状态存储接口
 * 
 * 提供键值对存储能力，用于扩展数据的持久化
 */
export interface ExtensionStateStorage {
  /**
   * 获取存储的值
   * @param key 键名
   * @returns 存储的值或undefined
   */
  get<T = unknown>(key: string): T | undefined;
  
  /**
   * 获取存储的值，如果不存在则返回默认值
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 存储的值或默认值
   */
  get<T = unknown>(key: string, defaultValue: T): T;
  
  /**
   * 设置值
   * @param key 键名
   * @param value 值(必须可序列化)
   * @returns 操作完成的Promise
   */
  set<T = unknown>(key: string, value: T): Promise<void>;
  
  /**
   * 删除键
   * @param key 键名
   * @returns 操作完成的Promise
   */
  delete(key: string): Promise<void>;
  
  /**
   * 获取所有键
   * @returns 键名数组
   */
  keys(): readonly string[];
  
  /**
   * 使用类型安全键获取存储的值
   * @param key 类型安全的键
   * @returns 存储的值或undefined
   */
  get<T>(key: TypedKey<T>): T | undefined;
  
  /**
   * 使用类型安全键获取存储的值，如果不存在则返回默认值
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


export interface IExtensionManager {
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
}

/**
 * 扩展管理器事件
 * 
 * 定义扩展管理器触发的事件
 */
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

// 文件系统事件类型
export interface FileEventPayload {
  path: string;
}

export interface FileChangeEventPayload extends FileEventPayload {
  oldContent?: string;
  newContent?: string;
}

// 命令事件类型
export interface CommandEventPayload {
  id: string;
}

export interface CommandExecutionEventPayload extends CommandEventPayload {
  args?: any;
  result?: any;
  error?: Error;
}

// 服务事件类型
export interface ServiceEventPayload {
  id: string;
  service: any;
}

/**
 * 系统事件
 * 
 * 定义系统核心事件
 */
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
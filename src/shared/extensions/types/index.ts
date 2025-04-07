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
 * 扩展
 * 
 * 完整的扩展定义，包含清单和生命周期
 */
export interface Extension {
  /**
   * 扩展清单
   */
  manifest: ExtensionManifest;
  
  /**
   * 激活扩展
   * @param context 扩展上下文
   */
  activate(context: ExtensionContext): void | Promise<void>;
  
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
  readonly eventBus: EventEmitter<Record<string, any>>;
  
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
 * 服务注册表
 * 
 * 用于注册和获取服务的接口
 */
export interface ServiceRegistry extends Disposable {
  /**
   * 注册服务
   * @param id 服务ID
   * @param implementation 服务实现
   */
  register<T>(id: string, implementation: T): Disposable;
  
  /**
   * 获取服务
   * @param id 服务ID
   */
  get<T>(id: string): T | undefined;
}

/**
 * 命令注册表
 * 
 * 用于注册和执行命令的接口
 */
export interface CommandRegistry extends Disposable {
  /**
   * 注册命令
   * @param id 命令ID
   * @param handler 命令处理器
   */
  register<T = any, R = any>(id: string, handler: (arg?: T) => R | Promise<R>): Disposable;
  
  /**
   * 执行命令
   * @param id 命令ID
   * @param arg 命令参数
   */
  execute<T = any, R = any>(id: string, arg?: T): Promise<R>;
}

/**
 * 事件发射器
 * 
 * 用于发布和订阅事件的接口
 */
export interface EventEmitter<T extends Record<string, any>> extends Disposable {
  /**
   * 订阅事件
   * @param event 事件名称
   * @param listener 事件监听器
   */
  on<K extends keyof T>(event: K, listener: (value: T[K]) => void): Disposable;
  
  /**
   * 取消事件订阅
   * @param event 事件名称
   * @param listener 事件监听器
   */
  off<K extends keyof T>(event: K, listener: (value: T[K]) => void): void;
  
  /**
   * 触发事件
   * @param event 事件名称
   * @param value 事件值
   */
  emit<K extends keyof T>(event: K, value: T[K]): void;
  
  /**
   * 订阅事件一次
   * @param event 事件名称
   * @param listener 事件监听器
   */
  once<K extends keyof T>(event: K, listener: (value: T[K]) => void): Disposable;
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
 * 扩展状态存储
 * 
 * 为扩展提供状态数据的持久化存储
 */
export interface ExtensionStateStorage extends Disposable {
  /**
   * 获取值
   * @param key 键
   * @param defaultValue 默认值
   */
  get<T>(key: string, defaultValue?: T): Promise<T | undefined>;
  
  /**
   * 设置值
   * @param key 键
   * @param value 值
   */
  set<T>(key: string, value: T): Promise<void>;
  
  /**
   * 删除值
   * @param key 键
   */
  delete(key: string): Promise<void>;
  
  /**
   * 检查键是否存在
   * @param key 键
   */
  has(key: string): Promise<boolean>;
  
  /**
   * 清空存储
   */
  clear(): Promise<void>;
} 
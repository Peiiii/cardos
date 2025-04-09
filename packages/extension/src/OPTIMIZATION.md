# CardOS 扩展系统优化建议

本文档提供了基于对比 VSCode 扩展 API 的分析，对 CardOS 扩展系统的优化建议。目标是在保持系统优势的基础上，尽量与业界标准保持一致，降低学习成本，同时提高系统的可维护性和扩展性。

## 1. 代理模式与命名空间隔离

### 当前实现

CardOS 目前采用代理模式自动为扩展的命令、服务和事件添加命名空间前缀：

```typescript
// 当前实现
context.commandRegistry.register('hello', () => {}); // 自动转换为 'extensionId.hello'
```

### 推荐方案

**保留代理定义但默认不使用**：

```typescript
// 推荐实现
// 1. 默认直接访问全局命令，类似于 VS Code
commands.registerCommand('extensionId.hello', () => {});

// 2. 可选地使用代理模式（保留现有功能，但不作为默认方式）
const commandProxy = createCommandProxy(extensionId, commands);
commandProxy.register('hello', () => {}); // 自动转换为 'extensionId.hello'
```

### 优势分析

1. **与 VSCode 保持一致**：降低学习成本，方便开发者迁移
2. **保留灵活性**：需要时仍可使用代理模式实现命名空间隔离
3. **符合行业标准**：VSCode 使用命名约定而非强制隔离的方式更符合 JS/TS 生态习惯

## 2. 存储系统优化

### 当前实现

当前提供基本的工作区和全局存储：

```typescript
// 当前实现
await context.storage.workspace.set('key', value);
await context.storage.global.set('key', value);
```

### 推荐方案

**采用 VSCode 风格的多级存储模式**：

```typescript
// 推荐实现
// 1. 现有的键值对存储
context.workspaceState.update('key', value);  // 工作区级别
context.globalState.update('key', value);     // 全局级别
context.globalState.setKeysForSync(['key']);  // 支持同步的键

// 2. 文件系统存储
const storageUri = context.storageUri;        // 工作区存储路径
const globalStorageUri = context.globalStorageUri; // 全局存储路径
await workspace.fs.writeFile(           // 存储大型数据或二进制文件
  Uri.joinPath(globalStorageUri, 'data.json'), 
  Buffer.from(JSON.stringify(data))
);

// 3. 加密存储（可选）
await context.secrets.store('token', 'secret-value');
const token = await context.secrets.get('token');
```

### VSCode API 类型定义

#### Memento 接口

```typescript
/**
 * Memento 表示一个存储工具，可以存储和检索值。
 */
interface Memento {
  /**
   * 返回存储的值
   * @param key 要检索的键
   * @returns 存储的值或 undefined（如果不存在）
   */
  get<T>(key: string): T | undefined;

  /**
   * 返回存储的值，如果不存在则返回指定的默认值
   * @param key 要检索的键
   * @param defaultValue 当键不存在时返回的默认值
   * @returns 存储的值或默认值
   */
  get<T>(key: string, defaultValue: T): T;

  /**
   * 存储一个值
   * 注意：值必须可以被JSON序列化(JSON-stringifyable)
   * 使用 undefined 作为值会从底层存储中删除该键
   * @param key 存储的键
   * @param value 要存储的值，不能包含循环引用
   * @returns 一个表示操作完成的 Thenable
   */
  update(key: string, value: any): Thenable<void>;

  /**
   * 返回所有存储的键的数组
   * @returns 只读的字符串数组，包含所有存储的键
   */
  keys(): readonly string[];
}

/**
 * 全局状态扩展，添加同步功能
 */
interface GlobalMemento extends Memento {
  /**
   * 设置哪些键应该在不同设备间同步
   * @param keys 要同步的键名数组
   */
  setKeysForSync(keys: string[]): void;
}
```

#### SecretStorage 接口

```typescript
/**
 * 代表用于存储敏感信息的加密存储工具
 * 实现会根据平台不同而变化，且不会在不同机器间同步
 */
interface SecretStorage {
  /**
   * 当秘密被存储或删除时触发的事件
   */
  onDidChange: Event<SecretStorageChangeEvent>;

  /**
   * 检索存储的秘密
   * @param key 秘密存储的键
   * @returns 存储的值或 undefined
   */
  get(key: string): Thenable<string | undefined>;

  /**
   * 在指定键下存储秘密
   * @param key 存储秘密的键
   * @param value 秘密内容
   */
  store(key: string, value: string): Thenable<void>;

  /**
   * 从存储中删除秘密
   * @param key 秘密存储的键
   */
  delete(key: string): Thenable<void>;
}

/**
 * 当秘密被添加或删除时触发的事件数据
 */
interface SecretStorageChangeEvent {
  /**
   * 已更改的秘密的键
   */
  key: string;
}
```

### 优势分析

1. **更丰富的存储选项**：满足不同类型数据的存储需求
2. **兼容主流标准**：与 VSCode 接口保持一致，降低学习成本
3. **支持大型数据**：提供文件系统级别的存储，适合大型数据或二进制文件
4. **安全性提升**：提供加密存储选项，保护敏感数据

## 3. 事件命名规范

### 当前实现

当前事件命名不完全遵循特定规范：

```typescript
// 当前实现可能有多种命名风格
eventBus.emit('extensionLoaded', extension);
eventBus.on('someEvent', handler);
```

### 推荐方案

**采用 VSCode 的 `on[Will|Did]VerbNoun` 命名模式**：

```typescript
// 推荐实现
// 事件定义
interface ExtensionEvents {
  onDidLoadExtension: Extension;
  onWillActivateExtension: Extension;
  onDidActivateExtension: Extension;
  onDidDeactivateExtension: Extension;
}

// 事件使用
eventBus.on('onDidLoadExtension', (extension) => { console.log('扩展已加载', extension); });
eventBus.emit('onDidActivateExtension', extension);
```

### 优势分析

1. **语义清晰**：明确区分事件是"将要发生"还是"已经发生"
2. **可读性高**：清晰表达事件的主体和动作
3. **标准一致**：符合业界广泛采用的事件命名规范
4. **降低学习成本**：与 VSCode 等知名项目保持一致

## 4. 命令系统优化

### 当前实现

使用自定义的 CommandRegistry 接口：

```typescript
// 当前实现
context.commandRegistry.register('command', handler);
await context.commandRegistry.execute('command', args);
```

### 推荐方案

**采用与 VSCode 一致的命令系统**：

```typescript
// 推荐实现
commands.registerCommand('extensionId.command', handler);
await commands.executeCommand('extensionId.command', ...args);

// package.json 中定义用户可见命令
{
  "contributes": {
    "commands": [
      {
        "command": "extensionId.command",
        "title": "执行命令"
      }
    ]
  }
}
```

### 优势分析

1. **接口一致性**：与 VSCode 保持一致，降低开发者学习成本
2. **声明式定义**：在 package.json 中声明命令的元数据
3. **更好的 IDE 支持**：主流编辑器对这种声明式定义有更好的支持

## 5. 扩展上下文优化

### 当前实现

自定义的 ExtensionContext 结构：

```typescript
// 当前实现
export interface ExtensionContext {
  readonly subscriptions: Disposable[];
  readonly serviceRegistry: ServiceRegistry;
  readonly eventBus: EventEmitter<Record<string, any>>;
  readonly storage: {
    readonly workspace: ExtensionStateStorage;
    readonly global: ExtensionStateStorage;
  };
  readonly logger: Logger;
  readonly commandRegistry: CommandRegistry;
}
```

### 推荐方案

**更接近 VSCode 的 ExtensionContext 结构**：

```typescript
// 推荐实现
export interface ExtensionContext {
  // 资源管理
  readonly subscriptions: Disposable[];
  
  // 扩展信息
  readonly extension: Extension<any>;
  readonly extensionPath: string;
  readonly extensionUri: Uri;
  
  // 存储
  readonly workspaceState: Memento;
  readonly globalState: Memento & { setKeysForSync(keys: string[]): void };
  readonly storageUri: Uri;
  readonly globalStorageUri: Uri;
  readonly secrets: SecretStorage;
  
  // 日志
  readonly logUri: Uri;
  readonly logger: Logger; // 保留 CardOS 的结构化日志
  
  // CardOS 特有服务 (可选)
  readonly services?: ServiceRegistry;
}
```

### 优势分析

1. **兼容性提升**：更接近 VSCode API，降低迁移成本
2. **功能完善**：提供更多存储选项和扩展信息
3. **保留特色**：保留 CardOS 的特色功能，如结构化日志
4. **灵活扩展**：可根据需要扩展更多特性

## 总结与建议

综合以上各点，建议 CardOS 扩展系统朝着以下方向优化：

1. **保持 API 一致性**：尽量与 VSCode 扩展 API 保持一致，降低学习成本
2. **保留现有优势**：保留代理模式等优势设计作为可选功能
3. **标准化命名**：采用标准的事件命名规范，提高代码可读性
4. **丰富存储选项**：提供多级存储和文件系统级存储支持
5. **增强安全性**：考虑添加加密存储功能

这些优化将使 CardOS 扩展系统既保持特色，又与主流标准接轨，为扩展开发者提供更友好、更熟悉的开发体验。

## 实施路线图

1. **短期**：标准化事件命名，采用 VSCode 的命名规范
2. **中期**：优化存储系统，增加文件系统级存储支持
3. **长期**：重构命令系统，提供与 VSCode 一致的接口，同时保留代理功能作为可选项

实施过程中应注意兼容性，避免破坏现有扩展的功能。可以考虑提供适配层，在新旧 API 之间进行转换，确保平滑过渡。 
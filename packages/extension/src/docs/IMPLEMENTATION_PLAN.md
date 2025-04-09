# CardOS扩展系统改造计划与追踪文档

## 1. 需求背景

根据设计文档`DESIGN.md`和现有实现，我们需要对CardOS扩展系统进行重构和增强，主要包括以下几个方面：

1. 添加`TypedKey`模式，增强类型安全
2. 更新各核心组件API，支持双轨API设计（字符串和TypedKey）
3. 改进扩展生命周期，分离ExtensionDefinition和Extension
4. 完善扩展管理器，优化API命名和设计

## 2. 改造范围

本次改造涵盖的文件包括但不限于：

1. `src/shared/extensions/types/index.ts`：添加新的类型定义
2. `src/shared/extensions/core`目录下的多个文件：
   - `command-registry.ts`：命令系统
   - `service-registry.ts`：服务系统
   - `event-emitter.ts`：事件系统
   - `state-storage.ts`：存储系统
   - `extension-manager.ts`：扩展管理器
   - `extension-context.ts`：扩展上下文

## 3. 具体任务分解与计划

### 3.1 基础类型定义（优先级：高）

1. 在`types/index.ts`中添加`TypedKey`类：
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

2. 添加`ExtensionDefinition`接口以区分扩展定义和运行时实例：
```typescript
export interface ExtensionDefinition<T = any> {
  manifest: ExtensionManifest;
  activate(context: ExtensionContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}

export interface Extension<T = any> {
  readonly definition: ExtensionDefinition<T>;
  readonly isActive: boolean;
}
```

### 3.2 命令系统改造（优先级：高）

1. 更新`CommandRegistry`接口：
```typescript
export interface CommandRegistry {
  // 基于字符串的API
  registerCommand<T = any, R = any>(id: string, handler: (arg?: T) => R | Promise<R>): Disposable;
  executeCommand<T = any, R = any>(id: string, arg?: T): Promise<R>;
  getCommands(): string[];
  
  // 基于TypedKey的API
  registerCommand<T, R>(key: TypedKey<(arg?: T) => R | Promise<R>>, handler: (arg?: T) => R | Promise<R>): Disposable;
  executeCommand<T, R>(key: TypedKey<(arg?: T) => R | Promise<R>>, arg?: T): Promise<R>;
}
```

2. 修改`CommandRegistryImpl`类实现双轨API

### 3.3 服务系统改造（优先级：高）

1. 更新`ServiceRegistry`接口：
```typescript
export interface ServiceRegistry {
  // 基于字符串的API
  registerService<T>(serviceId: string, service: T): Disposable;
  getService<T>(serviceId: string): T | undefined;
  getServices(): string[];
  
  // 基于TypedKey的API
  registerService<T>(key: TypedKey<T>, service: T): Disposable;
  getService<T>(key: TypedKey<T>): T | undefined;
}
```

2. 修改`ServiceRegistryImpl`类实现双轨API

### 3.4 事件系统改造（优先级：高）

1. 更新`EventEmitter`接口：
```typescript
export interface EventEmitter<T extends Record<string, any>> extends Disposable {
  // 基于字符串的API
  on<K extends keyof T>(event: K, listener: (value: T[K]) => void): Disposable;
  emit<K extends keyof T>(event: K, value: T[K]): void;
  once<K extends keyof T>(event: K, listener: (value: T[K]) => void): Disposable;
  
  // 扩展支持TypedKey
  on<E>(key: TypedKey<E>, listener: (value: E) => void): Disposable;
  emit<E>(key: TypedKey<E>, value: E): void;
  once<E>(key: TypedKey<E>, listener: (value: E) => void): Disposable;
}
```

2. 修改`EventEmitter`类实现双轨API

### 3.5 存储系统改造（优先级：中）

1. 更新`StateStorage`接口：
```typescript
export interface StateStorage {
  // 基于字符串的API
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): readonly string[];
  
  // 基于TypedKey的API
  get<T>(key: TypedKey<T>): T | undefined;
  get<T>(key: TypedKey<T>, defaultValue: T): T;
  set<T>(key: TypedKey<T>, value: T): Promise<void>;
  delete<T>(key: TypedKey<T>): Promise<void>;
}
```

2. 修改`MemoryStateStorage`类实现双轨API

### 3.6 扩展管理器改造（优先级：高）

1. 更新`ExtensionManager`接口：
```typescript
export interface ExtensionManager {
  registerExtension(definition: ExtensionDefinition): string;
  loadExtension(path: string): Promise<string>;
  loadExtensions(directory: string): Promise<string[]>;
  getExtensionManifest(extensionName: string): ExtensionManifest | undefined;
  getExtensionNames(): string[];
  isExtensionActive(extensionName: string): boolean;
  activateExtension(extensionName: string): Promise<void>;
  deactivateExtension(extensionName: string): Promise<void>;
}
```

2. 修改`ExtensionManager`类实现改进的API

## 4. 实施步骤与追踪

### 阶段一：类型定义和接口设计（1-2天）

- [x] 创建`TypedKey`类
- [x] 更新/创建`ExtensionDefinition`和`Extension`接口
- [x] 修改核心组件接口定义（CommandRegistry、ServiceRegistry等）

### 阶段二：核心组件实现（2-3天）

- [x] 实现改进的命令系统
- [x] 实现改进的服务系统
- [x] 实现改进的事件系统
- [x] 实现改进的存储系统

### 阶段三：扩展管理器实现（1-2天）

- [x] 重构`ExtensionManager`类
- [x] 修改相关的工厂函数和辅助方法

### 阶段四：测试和验证（1-2天）

- [ ] 编写单元测试验证新API
- [ ] 编写集成测试验证扩展系统完整流程
- [ ] 测试向后兼容性

## 5. 风险与解决方案

### 5.1 接口兼容风险

**风险**：API变更可能导致现有代码无法工作
**解决方案**：
- 保留现有的字符串API，新增TypedKey API
- 对废弃的API添加`@deprecated`标记，提供迁移路径
- 编写详细的迁移指南

### 5.2 性能风险

**风险**：双轨API设计可能带来额外的性能开销
**解决方案**：
- 优化内部实现，避免冗余逻辑
- 对关键路径进行性能测试
- 提供性能最佳实践文档

### 5.3 类型复杂性

**风险**：`TypedKey`模式增加类型定义复杂性，可能提高开发门槛
**解决方案**：
- 提供详细的文档和示例
- 编写辅助工具函数简化使用
- 确保IDE类型提示工作正常

## 6. 文档和示例

- [x] 更新`DESIGN.md`设计文档，反映新的API设计
- [ ] 编写TypedKey使用指南和最佳实践
- [ ] 提供完整的示例代码展示不同场景的使用方法
- [ ] 编写API迁移指南，帮助现有代码平滑升级

## 7. 后续工作

- [ ] 监控使用情况，收集反馈
- [ ] 根据反馈进一步优化API
- [ ] 考虑为更多组件添加TypedKey支持
- [ ] 探索更多类型安全增强的可能性

## 8. 时间线和里程碑

- **里程碑1**：接口设计完成（计划：1周内）
- **里程碑2**：核心组件改造完成（计划：2周内）
- **里程碑3**：测试和文档完成（计划：3周内）
- **里程碑4**：完整版本发布（计划：1个月内）

## 9. 协作与责任

为确保改造顺利进行，建议划分责任：
- 类型定义与接口设计：1人
- 核心组件实现：1-2人
- 测试和文档：1人
- 协调与审查：1人

## 10. 进度追踪

| 任务 | 责任人 | 计划完成时间 | 实际完成时间 | 状态 | 备注 |
|-----|-------|------------|------------|------|-----|
| TypedKey类定义 | | | 2023-10-10 | 已完成 | 已在types/index.ts中实现 |
| ExtensionDefinition接口 | | | 2023-10-10 | 已完成 | 已在types/index.ts中实现 |
| CommandRegistry改造 | | | 2023-10-12 | 已完成 | 添加了双轨API支持 |
| ServiceRegistry改造 | | | 2023-10-12 | 已完成 | 添加了双轨API支持 |
| EventEmitter改造 | | | 2023-10-12 | 已完成 | 添加了双轨API支持，优化了泛型实现 |
| StateStorage改造 | | | 2023-10-12 | 已完成 | 添加了双轨API支持，统一了方法接口 |
| ExtensionManager改造 | | | 2023-10-12 | 已完成 | 完善了API，优化了扩展管理设计 |
| 单元测试 | | | | 未开始 | |
| 集成测试 | | | | 未开始 | |
| 文档更新 | | | 2023-10-11 | 部分完成 | DESIGN.md已更新TypedKey相关内容 |
| 示例代码 | | | | 未开始 | | 
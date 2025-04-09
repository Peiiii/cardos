# CardOS 扩展系统

CardOS 扩展系统是一个模块化架构，允许通过扩展来增强应用程序的功能。该系统支持动态加载、激活和停用扩展，并提供了丰富的API供扩展使用。

## 架构设计

扩展系统采用了**混合代理模式**架构，主要包括以下组件：

### 核心组件

1. **ExtensionManager**: 扩展管理器，负责扩展的注册、激活和停用
2. **ExtensionContext**: 扩展上下文，为扩展提供运行时环境和API
3. **全局系统**:
   - 服务注册表 (ServiceRegistry)
   - 命令注册表 (CommandRegistry)
   - 事件系统 (EventEmitter)
4. **独立系统**:
   - 日志系统 (Logger)
   - 状态存储 (ExtensionStateStorage)，分为工作区和全局两个级别

### 代理系统

为避免扩展间冲突并提供命名空间隔离，系统使用代理模式：

1. **ServiceRegistryProxy**: 服务注册表代理
2. **CommandRegistryProxy**: 命令注册表代理
3. **EventEmitterProxy**: 事件系统代理

这些代理自动为扩展的命令、服务和事件添加命名空间前缀，确保扩展间的隔离性。

### 资源管理

系统提供了完善的资源管理机制：

1. **Disposable**: 可释放资源接口
2. **DisposableImpl**: 可释放资源实现
3. **createDisposableCollection**: 创建可释放资源集合

## 命名空间隔离

扩展系统使用命名空间来隔离扩展的服务、命令和事件：

1. 扩展注册的服务、命令和事件会自动添加扩展ID作为前缀
2. 扩展可以访问自己的资源（不需要前缀）和其他扩展的资源（使用完整ID）
3. 全局系统可以使用完整ID访问所有扩展的资源

例如：

```typescript
// 在扩展内部
context.commandRegistry.register('hello', () => {}); // 自动转换为 'extensionId.hello'
context.serviceRegistry.get('myService');            // 自动查找 'extensionId.myService'

// 访问其他扩展或全局资源
context.serviceRegistry.get('other.extension.service'); // 直接访问其他扩展的服务
context.serviceRegistry.get('global.service');          // 访问全局服务
```

## 存储系统

每个扩展都有两个独立的存储空间：

1. **工作区存储**: 与当前工作区相关联，工作区切换时会改变
   ```typescript
   await context.storage.workspace.set('key', value);
   const value = await context.storage.workspace.get('key');
   ```

2. **全局存储**: 跨工作区保持不变，适合保存全局配置
   ```typescript
   await context.storage.global.set('key', value);
   const value = await context.storage.global.get('key');
   ```

## 设计优势

这种混合代理模式具有以下优势：

1. **共享与隔离的平衡**:
   - 命令和服务是全局共享的，便于扩展间协作
   - 自动命名空间避免了冲突
   
2. **资源隔离**:
   - 日志和存储对每个扩展独立，确保数据安全
   
3. **资源管理**:
   - 统一的资源释放机制确保扩展能够干净地停用

4. **灵活的访问控制**:
   - 扩展可以访问自己的资源和他人的资源，但有清晰的边界

## 使用示例

参见 `examples` 目录中的示例代码，展示了扩展的创建、注册和使用。

```typescript
// 创建扩展
export const extension: Extension = {
  manifest: {
    id: 'my.extension',
    name: '我的扩展',
    // ...其他元数据
  },
  activate: async (context) => {
    // 注册命令
    context.commandRegistry.register('myCommand', () => {
      console.log('Command executed!');
    });
    
    // 使用存储
    await context.storage.workspace.set('key', 'value');
    
    // 订阅事件
    context.eventBus.on('someEvent', (data) => {
      console.log('Event received:', data);
    });
  },
  deactivate: async () => {
    // 清理资源
  }
}; 
```

import { Extension, ExtensionContext, ExtensionManifest } from '../types';

/**
 * Hello World 扩展清单
 */
export const manifest: ExtensionManifest = {
  id: 'cardos.example.hello-world',
  name: 'Hello World 示例扩展',
  version: '1.0.0',
  description: '一个简单的示例扩展，展示扩展系统的基本使用',
  author: 'CardOS团队',
  activationEvents: ['onStartup']
};

/**
 * 扩展激活函数
 * @param context 扩展上下文
 */
export async function activate(context: ExtensionContext): Promise<void> {
  // 获取日志工具
  const { logger } = context;
  
  logger.info('Hello World 扩展已激活!');
  
  // 注册一个简单的命令
  // 注意：不需要添加命名空间前缀，代理会自动处理
  const helloCommand = context.commandRegistry.register('hello', (name?: string) => {
    const target = name || 'World';
    logger.info(`Hello, ${target}!`);
    return `Hello, ${target}!`;
  });
  
  // 将命令添加到订阅列表中，以便扩展停用时自动清理
  context.subscriptions.push(helloCommand);
  
  // 存储一些状态 - 使用工作区存储
  await context.storage.workspace.set('lastActivated', new Date().toISOString());
  
  // 使用全局存储
  await context.storage.global.set('activationCount', 
    (await context.storage.global.get<number>('activationCount') || 0) + 1
  );
  
  // 注册一个简单的服务
  const greetingService = {
    greet: (name: string) => `Greetings, ${name}!`
  };
  
  // 注意：不需要添加命名空间前缀，代理会自动处理
  const serviceRegistration = context.serviceRegistry.register('greetingService', greetingService);
  context.subscriptions.push(serviceRegistration);
  
  // 使用事件系统
  // 注意：不需要添加命名空间前缀，代理会自动处理
  const eventSubscription = context.eventBus.on('greeting', (data) => {
    logger.info(`收到问候事件: ${JSON.stringify(data)}`);
  });
  
  context.subscriptions.push(eventSubscription);
  
  // 定时发送事件
  const timerId = setInterval(() => {
    // 注意：不需要添加命名空间前缀，代理会自动处理
    context.eventBus.emit('greeting', { 
      message: 'Hello from timer!',
      timestamp: new Date().toISOString()
    });
  }, 30000); // 每30秒发送一次
  
  // 确保定时器在扩展停用时被清理
  // 使用内部注册方法，由于公共接口已简化
  const anyContext = context as any;
  if (typeof anyContext.registerDisposable === 'function') {
    anyContext.registerDisposable({
      dispose: () => {
        clearInterval(timerId);
        logger.info('清理了定时器资源');
      }
    });
  } else {
    // 降级方案：直接添加到订阅列表
    context.subscriptions.push({
      dispose: () => {
        clearInterval(timerId);
        logger.info('清理了定时器资源');
      }
    });
  }
  
  // 检查是否可以访问全局服务和命令
  // 访问另一个扩展的服务（通过完整ID）
  const otherService = context.serviceRegistry.get('other.extension.someService');
  if (otherService) {
    logger.info('成功访问另一个扩展的服务');
  }
  
  // 记录存储状态
  const activationCount = await context.storage.global.get<number>('activationCount');
  logger.info(`扩展已被激活 ${activationCount} 次`);
  
  logger.info('Hello World 扩展初始化完成');
}

/**
 * 扩展停用函数
 */
export function deactivate(): void {
  console.log('Hello World 扩展已停用');
}

/**
 * 导出扩展
 */
export const extension: Extension = {
  manifest,
  activate,
  deactivate
}; 
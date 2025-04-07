import { Extension, ExtensionManagerEvents } from '../core/index';
import { ExtensionManager } from '../core/extension-manager';
import { extension as helloWorldExtension } from './hello-world-extension';

// 定义问候服务接口
interface GreetingService {
  greet(name: string): string;
}

// 定义时间服务接口
interface TimeService {
  getCurrentTime(): string;
}

/**
 * 扩展系统演示程序
 */
async function runExtensionDemo() {
  console.log('开始扩展系统演示');
  
  // 创建扩展管理器
  const extensionManager = new ExtensionManager();
  
  // 注册全局服务，供所有扩展使用
  const globalServices = extensionManager.getGlobalServiceRegistry();
  globalServices.register<TimeService>('global.timeService', {
    getCurrentTime: () => new Date().toISOString()
  });
  
  // 设置事件监听
  extensionManager.events.on('onExtensionLoaded', (extension: Extension) => {
    console.log(`扩展已加载: ${extension.manifest.id} (${extension.manifest.name})`);
  });
  
  extensionManager.events.on('onExtensionActivated', (extension: Extension) => {
    console.log(`扩展已激活: ${extension.manifest.id}`);
  });
  
  extensionManager.events.on('onExtensionDeactivated', (extension: Extension) => {
    console.log(`扩展已停用: ${extension.manifest.id}`);
  });
  
  extensionManager.events.on('onExtensionError', ({ extension, error }: ExtensionManagerEvents['onExtensionError']) => {
    console.error(`扩展 ${extension.manifest.id} 错误:`, error);
  });
  
  // 注册扩展
  const disposable = extensionManager.registerExtension(helloWorldExtension);
  
  // 列出已注册的扩展
  console.log('已注册扩展:');
  extensionManager.getExtensions().forEach(ext => {
    console.log(` - ${ext.manifest.id} (${ext.manifest.name}) v${ext.manifest.version}`);
  });
  
  // 激活扩展
  try {
    const extensionId = helloWorldExtension.manifest.id;
    console.log(`正在激活扩展: ${extensionId}`);
    
    const context = await extensionManager.activateExtension(extensionId);
    if (context) {
      console.log('扩展上下文创建成功');
      
      // 从内部属性获取扩展ID（接口已简化，但我们需要这个信息）
      const anyContext = context as any;
      const extensionIdValue = anyContext._extensionId || extensionId;
      
      // 执行扩展注册的命令
      try {
        // 执行命令（系统会自动添加命名空间前缀）
        const result = await context.commandRegistry.execute('hello', 'CardOS');
        console.log('命令执行结果:', result);
        
        // 也可以使用完整ID直接调用
        const fullCommandId = `${extensionIdValue}.hello`;
        const globalCommands = extensionManager.getGlobalCommandRegistry();
        const result2 = await globalCommands.execute(fullCommandId, 'Developer');
        console.log('通过全局命令注册表执行结果:', result2);
      } catch (error) {
        console.error('执行命令出错:', error);
      }
      
      // 获取扩展注册的服务
      const greetingService = context.serviceRegistry.get<GreetingService>('greetingService');
      if (greetingService) {
        console.log('通过扩展上下文调用服务:', greetingService.greet('Developer'));
      }
      
      // 通过全局注册表获取服务（使用完整ID）
      const fullServiceId = `${extensionIdValue}.greetingService`;
      const globalGreetingService = globalServices.get<GreetingService>(fullServiceId);
      if (globalGreetingService) {
        console.log('通过全局注册表调用服务:', globalGreetingService.greet('User'));
      }
      
      // 触发扩展监听的事件
      context.eventBus.emit('greeting', { message: '手动触发的问候!' });
      
      // 使用全局事件触发（需要完整ID）
      const globalEvents = extensionManager.getGlobalEventEmitter();
      globalEvents.emit(`${extensionIdValue}.greeting`, { message: '通过全局事件系统触发的问候!' });
      
      // 获取全局服务
      const timeService = context.serviceRegistry.get<TimeService>('global.timeService');
      if (timeService) {
        console.log('扩展访问全局服务:', timeService.getCurrentTime());
      }
      
      // 检查存储API
      await context.storage.workspace.set('testKey', 'workspace value');
      await context.storage.global.set('testKey', 'global value');
      
      const workspaceValue = await context.storage.workspace.get<string>('testKey');
      const globalValue = await context.storage.global.get<string>('testKey');
      
      console.log('从工作区存储读取:', workspaceValue);
      console.log('从全局存储读取:', globalValue);
      
      // 模拟一些操作
      console.log('扩展正在运行中...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('激活扩展时出错:', error);
  }
  
  // 停用扩展
  try {
    console.log('正在停用扩展...');
    await extensionManager.deactivateExtension(helloWorldExtension.manifest.id);
    console.log('扩展已成功停用');
  } catch (error) {
    console.error('停用扩展时出错:', error);
  }
  
  // 释放资源
  console.log('清理资源...');
  await extensionManager.dispose();
  
  console.log('扩展系统演示完成');
}

// 导出演示函数
export { runExtensionDemo };

// 如果直接运行此文件，则执行演示
if (require.main === module) {
  runExtensionDemo().catch(error => {
    console.error('演示过程中出错:', error);
  });
} 
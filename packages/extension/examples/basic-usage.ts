import { ExtensionManager, ExtensionDefinition, ExtensionContext } from '../src';

// 创建扩展管理器
const extensionManager = new ExtensionManager();

// 示例1: 简单的问候扩展
const greetingExtension: ExtensionDefinition = {
  manifest: {
    id: 'greeting-extension',
    name: '问候扩展',
    version: '1.0.0',
    description: '一个简单的问候扩展',
    author: '开发者',
  },
  
  activate: (context: ExtensionContext) => {
    const { logger, commandRegistry } = context;
    
    logger.info('问候扩展已激活');
    
    // 注册问候命令
    const commandDisposable = commandRegistry.registerCommand(
      'greeting.hello',
      (name?: string) => {
        const message = `Hello, ${name || 'World'}!`;
        logger.info(message);
        return message;
      }
    );
    
    // 注册再见命令
    const goodbyeDisposable = commandRegistry.registerCommand(
      'greeting.goodbye',
      (name?: string) => {
        const message = `Goodbye, ${name || 'World'}!`;
        logger.info(message);
        return message;
      }
    );
    
    // 添加到订阅列表
    context.subscriptions.push(commandDisposable, goodbyeDisposable);
  },
  
  deactivate: () => {
    console.log('问候扩展已停用');
  }
};

// 示例2: 计算器扩展
const calculatorExtension: ExtensionDefinition = {
  manifest: {
    id: 'calculator-extension',
    name: '计算器扩展',
    version: '1.0.0',
    description: '提供基本计算功能',
    author: '开发者',
  },
  
  activate: (context: ExtensionContext) => {
    const { logger, commandRegistry, serviceRegistry } = context;
    
    logger.info('计算器扩展已激活');
    
    // 注册计算命令
    const addCommand = commandRegistry.registerCommand(
      'calculator.add',
      (args?: { a: number; b: number }) => {
        if (!args) {
          throw new Error('需要提供参数 a 和 b');
        }
        const result = args.a + args.b;
        logger.info(`计算: ${args.a} + ${args.b} = ${result}`);
        return result;
      }
    );
    
    const multiplyCommand = commandRegistry.registerCommand(
      'calculator.multiply',
      (args?: { a: number; b: number }) => {
        if (!args) {
          throw new Error('需要提供参数 a 和 b');
        }
        const result = args.a * args.b;
        logger.info(`计算: ${args.a} * ${args.b} = ${result}`);
        return result;
      }
    );
    
    // 注册计算器服务
    const calculatorService = {
      add: (a: number, b: number) => a + b,
      subtract: (a: number, b: number) => a - b,
      multiply: (a: number, b: number) => a * b,
      divide: (a: number, b: number) => a / b,
    };
    
    const serviceDisposable = serviceRegistry.registerService(
      'calculator-service',
      calculatorService
    );
    
    // 添加到订阅列表
    context.subscriptions.push(addCommand, multiplyCommand, serviceDisposable);
  }
};

// 示例3: 事件监听扩展
const eventListenerExtension: ExtensionDefinition = {
  manifest: {
    id: 'event-listener-extension',
    name: '事件监听扩展',
    version: '1.0.0',
    description: '监听和响应事件',
    author: '开发者',
  },
  
  activate: (context: ExtensionContext) => {
    const { logger, eventBus, commandRegistry } = context;
    
    logger.info('事件监听扩展已激活');
    
    // 监听用户事件
    const userEventDisposable = eventBus.on('user.action', (data) => {
      logger.info(`用户事件: ${JSON.stringify(data)}`);
    });
    
    // 监听系统事件
    const systemEventDisposable = eventBus.on('system.status', (data) => {
      logger.info(`系统状态: ${JSON.stringify(data)}`);
    });
    
    // 注册触发事件的命令
    const triggerCommand = commandRegistry.registerCommand(
      'event.trigger',
      (arg?: { eventName: string; data?: unknown }) => {
        if (!arg?.eventName) {
          throw new Error('需要提供事件名称');
        }
        eventBus.emit(arg.eventName, arg.data || { timestamp: new Date().toISOString() });
        logger.info(`触发事件: ${arg.eventName}`);
        return { success: true, eventName: arg.eventName };
      }
    );
    
    // 添加到订阅列表
    context.subscriptions.push(
      userEventDisposable,
      systemEventDisposable,
      triggerCommand
    );
  }
};

// 注册扩展
extensionManager.registerExtension(greetingExtension);
extensionManager.registerExtension(calculatorExtension);
extensionManager.registerExtension(eventListenerExtension);

// 激活所有扩展
extensionManager.activateAllExtensions();

// 示例：使用扩展功能
async function demonstrateExtensions() {
  console.log('=== 扩展系统演示 ===');
  
  // 1. 使用问候命令
  const greeting = await extensionManager.commandRegistry.executeCommand(
    'greeting.hello',
    'CardOS'
  );
  console.log('问候结果:', greeting);
  
  // 2. 使用计算器命令
  const sum = await extensionManager.commandRegistry.executeCommand(
    'calculator.add',
    { a: 5, b: 3 }
  );
  console.log('计算结果:', sum);
  
  // 3. 使用计算器服务
  const calculatorService = extensionManager.serviceRegistry.getService('calculator-service');
  if (calculatorService) {
    const product = calculatorService.multiply(4, 6);
    console.log('服务计算结果:', product);
  }
  
  // 4. 触发事件
  await extensionManager.commandRegistry.executeCommand(
    'event.trigger',
    { eventName: 'user.action', data: { action: 'click', target: 'button' } }
  );
  
  // 5. 查看已注册的扩展
  const extensionNames = extensionManager.getExtensionNames();
  console.log('已注册的扩展:', extensionNames);
  
  // 6. 查看已注册的命令
  const commands = extensionManager.commandRegistry.getCommands();
  console.log('已注册的命令:', commands);
  
  // 7. 查看已注册的服务
  const services = extensionManager.serviceRegistry.getServices();
  console.log('已注册的服务:', services);
}

// 运行演示
demonstrateExtensions().catch(console.error);

// 清理资源（在实际应用中，这通常在应用关闭时进行）
// extensionManager.dispose(); 
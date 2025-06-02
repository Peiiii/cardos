import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { 
  ICommunicationManager, 
  NodeToCoordinatorMessage, 
  CoordinatorToNodeMessage, 
  MessageBus,
  CommunicationNode
} from './core';

/**
 * 通信节点数据接口 - 任何参与通信的实体
 */
export interface NodeData {
  id: string;
  [key: string]: unknown; // 允许任意扩展字段
}

/**
 * 节点工厂返回值
 */
export interface NodeInstance {
  communicationNode: CommunicationNode;
  resource: unknown;
}

/**
 * 通信配置接口
 */
export interface CommunicationConfig {
  manager: ICommunicationManager;
  autoRegister?: boolean; // 是否自动注册节点
  messageBus?: MessageBus; // 可选的自定义消息总线
}

/**
 * 通信上下文值
 */
export interface CommunicationContextValue {
  /**
   * 发送消息给特定节点
   */
  sendToNode: (nodeId: string, message: CoordinatorToNodeMessage) => boolean;
  
  /**
   * 广播消息给所有节点
   */
  broadcast: (message: CoordinatorToNodeMessage) => number;
  
  /**
   * 注册节点列表
   */
  registerNodes: (nodes: NodeData[], nodeFactory: (nodeData: NodeData) => NodeInstance) => void;
  
  /**
   * 监听来自节点的消息
   */
  onMessage: (eventType: string, handler: (message: NodeToCoordinatorMessage) => void) => () => void;
  
  /**
   * 获取当前活跃节点数量
   */
  getActiveNodeCount: () => number;
  
  /**
   * 获取节点资源（比如refs）
   */
  getNodeResource: (nodeId: string) => unknown;
  
  /**
   * 设置节点资源
   */
  setNodeResource: (nodeId: string, resource: unknown) => void;
}

const CommunicationContext = createContext<CommunicationContextValue | null>(null);

/**
 * 通用通信Provider - 完全封装所有通信逻辑
 */
export interface CommunicationProviderProps {
  children: React.ReactNode;
  config: CommunicationConfig;
}

export function CommunicationProvider({ children, config }: CommunicationProviderProps) {
  const { manager, autoRegister = true, messageBus: customMessageBus } = config;
  
  // 内部状态管理
  const messageBus = useMemo(() => customMessageBus || new MessageBus(), [customMessageBus]);
  const nodeResources = useRef<Map<string, unknown>>(new Map());
  const isListening = useRef(false);
  
  // 启动消息监听 - 只启动一次
  useEffect(() => {
    if (isListening.current) return;
    
    const stopListening = manager.startListening((message: NodeToCoordinatorMessage) => {
      messageBus.dispatch(message.eventType, message);
    });
    
    isListening.current = true;
    
    return () => {
      stopListening();
      isListening.current = false;
    };
  }, [manager, messageBus]);

  // 创建上下文值
  const contextValue: CommunicationContextValue = useMemo(() => ({
    sendToNode: (nodeId: string, message: CoordinatorToNodeMessage) => {
      return manager.sendToNode(nodeId, message);
    },
    
    broadcast: (message: CoordinatorToNodeMessage) => {
      return manager.broadcast(message);
    },
    
    registerNodes: (nodes: NodeData[], nodeFactory: (nodeData: NodeData) => NodeInstance) => {
      if (!autoRegister) return;
      
      // 清理不存在的节点
      const currentNodeIds = new Set(nodes.map(node => node.id));
      manager.getNodeIds().forEach(nodeId => {
        if (!currentNodeIds.has(nodeId)) {
          manager.unregisterNode(nodeId);
          nodeResources.current.delete(nodeId);
        }
      });
      
      // 注册新节点
      nodes.forEach(nodeData => {
        if (!nodeResources.current.has(nodeData.id)) {
          const nodeInstance = nodeFactory(nodeData);
          nodeResources.current.set(nodeData.id, nodeInstance.resource);
          manager.registerNode(nodeInstance.communicationNode);
        }
      });
    },
    
    onMessage: (eventType: string, handler: (message: NodeToCoordinatorMessage) => void) => {
      messageBus.registerHandler(eventType, handler);
      return () => messageBus.unregisterHandler(eventType, handler);
    },
    
    getActiveNodeCount: () => manager.getNodeCount(),
    
    getNodeResource: (nodeId: string) => {
      return nodeResources.current.get(nodeId);
    },
    
    setNodeResource: (nodeId: string, resource: unknown) => {
      nodeResources.current.set(nodeId, resource);
    },
    
  }), [manager, messageBus, autoRegister]);

  return (
    <CommunicationContext.Provider value={contextValue}>
      {children}
    </CommunicationContext.Provider>
  );
}

/**
 * 使用通信的Hook - 提供通用API
 */
export function useCommunication(): CommunicationContextValue {
  const context = useContext(CommunicationContext);
  if (!context) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
} 
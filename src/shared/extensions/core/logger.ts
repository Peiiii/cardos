import { Disposable, Logger } from '../types';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * 控制台日志实现
 */
export class ConsoleLogger implements Logger {
  private _prefix: string;
  private _level: LogLevel;

  /**
   * 创建控制台日志实例
   * @param prefix 日志前缀
   * @param level 最小日志级别
   */
  constructor(prefix: string, level: LogLevel = LogLevel.DEBUG) {
    this._prefix = prefix ? `[${prefix}] ` : '';
    this._level = level;
  }

  /**
   * 设置日志级别
   * @param level 新的日志级别
   */
  setLevel(level: LogLevel): void {
    this._level = level;
  }

  /**
   * 输出调试日志
   * @param message 日志消息
   * @param args 额外参数
   */
  debug(message: string, ...args: any[]): void {
    if (this._level <= LogLevel.DEBUG) {
      console.debug(`${this._prefix}${message}`, ...args);
    }
  }

  /**
   * 输出信息日志
   * @param message 日志消息
   * @param args 额外参数
   */
  info(message: string, ...args: any[]): void {
    if (this._level <= LogLevel.INFO) {
      console.info(`${this._prefix}${message}`, ...args);
    }
  }

  /**
   * 输出警告日志
   * @param message 日志消息
   * @param args 额外参数
   */
  warn(message: string, ...args: any[]): void {
    if (this._level <= LogLevel.WARN) {
      console.warn(`${this._prefix}${message}`, ...args);
    }
  }

  /**
   * 输出错误日志
   * @param message 日志消息
   * @param args 额外参数
   */
  error(message: string, ...args: any[]): void {
    if (this._level <= LogLevel.ERROR) {
      console.error(`${this._prefix}${message}`, ...args);
    }
  }

  /**
   * 释放资源
   */
  dispose(): void {
    // 控制台日志不需要特别释放资源
  }
}

/**
 * 创建日志实例
 * @param prefix 日志前缀
 * @param level 日志级别
 * @returns 日志实例
 */
export function createLogger(prefix: string, level: LogLevel = LogLevel.DEBUG): Logger {
  return new ConsoleLogger(prefix, level);
} 
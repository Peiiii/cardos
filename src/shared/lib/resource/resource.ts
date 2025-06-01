import { useEffect, useState, useMemo } from "react";

export interface ResourceState<T> {
  data: T | null;
  isLoading: boolean; // 初始加载状态
  isValidating: boolean; // 刷新状态
  error: Error | null;
  // mutate: (
  //   dataOrMutator?:
  //     | T
  //     | null
  //     | ((prev: T | null) => T | null | Promise<T | null>),
  //   shouldRevalidate?: boolean
  // ) => Promise<void>;
}

// 添加一个新的类型，用于 read() 返回的状态
export interface ReadyResourceState<T> extends Omit<ResourceState<T>, "data"> {
  data: T; // 这里的 data 一定有值
}

export interface ResourceOptions<T> {
  minLoadingTime?: number; // 最小加载时间
  retryTimes?: number; // 重试次数
  retryDelay?: number; // 重试延迟
  onCreated?: (resource: ResourceManagerImpl<T>) => void; // 资源创建后的回调
  onSuccess?: (data: T) => void; // 成功回调
  onError?: (error: Error) => void; // 错误回调
  initialData?: T; // 初始数据
}

export interface IResource<T> {
  mutate: (
    dataOrMutator?:
      | T
      | null
      | ((prev: T | null) => T | null | Promise<T | null>),
    shouldRevalidate?: boolean
  ) => Promise<void>;
  read(): ReadyResourceState<T>;
  reload(): Promise<T>;
  getState(): ResourceState<T>; 
  subscribe(listener: (state: ResourceState<T>) => void): () => void;
  whenReady(timeout?: number): Promise<T>;
}

const DEFAULT_OPTIONS: ResourceOptions<unknown> = {
  minLoadingTime: 0, // 默认最小加载时间600ms
  retryTimes: 3,
  retryDelay: 1000,
};

export class ResourceManagerImpl<T> implements IResource<T> {
  private state: ResourceState<T> = {
    data: null,
    isLoading: true,
    isValidating: false,
    error: null,
  };
  private listeners: Set<(state: ResourceState<T>) => void> = new Set();
  private loadStartTime: number = 0;
  private options: ResourceOptions<T>;
  private promise: Promise<T>;
  private retryCount: number = 0;

  constructor(
    private fetcher: () => Promise<T>,
    options: ResourceOptions<T> = {} as ResourceOptions<T>
  ) {
    this.options = { ...(DEFAULT_OPTIONS as ResourceOptions<T>), ...options };
    if (options.initialData) {
      this.state.data = options.initialData;
      this.state.isLoading = false;
    }
    this.promise = this.fetcher();
    this.initialize();
  }

  private initialize() {
    this.loadStartTime = Date.now();
    this.promise
      .then(async (data) => {
        const elapsed = Date.now() - this.loadStartTime;
        const minTime = this.options.minLoadingTime || 0;
        if (elapsed < minTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, minTime - elapsed)
          );
        }
        this.setState({
          data,
          isLoading: false,
          isValidating: false,
          error: null,
        });
        this.options.onSuccess?.(data);
      })
      .catch((error) => {
        if (this.retryCount < (this.options.retryTimes || 0)) {
          this.retryCount++;
          setTimeout(() => {
            this.promise = this.fetcher();
            this.initialize();
          }, this.options.retryDelay);
          return;
        }
        this.setState({
          data: null,
          isLoading: false,
          isValidating: false,
          error,
        });
        this.options.onError?.(error);
      });
  }

  private setState(newState: Partial<Omit<ResourceState<T>, "mutate">>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe = (listener: (state: ResourceState<T>) => void) => {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  read=(): ReadyResourceState<T> => {
    if (this.state.error) {
      throw this.state.error;
    }
    if (this.state.isLoading) {
      throw this.promise;
    }
    // 这里我们知道 data 一定不是 null
    return this.state as ReadyResourceState<T>;
  }

  getState=(): ResourceState<T> => {
    return this.state;
  }

  reload=(): Promise<T> => {
    this.setState({ isValidating: true, error: null });
    this.loadStartTime = Date.now();
    this.retryCount = 0;
    // 创建新的 promise 用于 Suspense
    this.promise = this.fetcher();
    return this.promise
      .then(async (data) => {
        const elapsed = Date.now() - this.loadStartTime;
        const minTime = this.options.minLoadingTime || 0;
        if (elapsed < minTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, minTime - elapsed)
          );
        }
        this.setState({ data, isValidating: false, error: null });
        this.options.onSuccess?.(data);
        return data;
      })
      .catch((error) => {
        this.setState({ isValidating: false, error });
        this.options.onError?.(error);
        throw error;
      });
  }

  mutate=async (
    dataOrMutator?:
      | T
      | null
      | ((prev: T | null) => T | null | Promise<T | null>),
    shouldRevalidate: boolean = true
  ): Promise<void> => {
    // 如果没有传入数据或函数，直接重新验证
    if (dataOrMutator === undefined) {
      await this.reload();
      return;
    }

    // 处理数据更新
    if (typeof dataOrMutator === "function") {
      const mutatorFn = dataOrMutator as (
        prev: T | null
      ) => T | null | Promise<T | null>;
      const newData = await mutatorFn(this.state.data);
      this.setState({ data: newData });
    } else {
      this.setState({ data: dataOrMutator });
    }

    // 如果需要重新验证
    if (shouldRevalidate) {
      await this.reload();
    }
  }

  /**
   * 等待资源就绪并返回数据
   * @param timeout 超时时间（毫秒），默认 30000ms
   * @returns 资源数据
   * @throws 如果超时或加载出错
   */
  whenReady=async (timeout: number = 30000): Promise<T> => {
    return new Promise((resolve, reject) => {
      // 如果已经就绪，直接返回数据
      if (!this.state.isLoading && !this.state.error && this.state.data !== null) {
        resolve(this.state.data);
        return;
      }

      // 设置超时
      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Resource loading timeout'));
      }, timeout);

      // 订阅状态变化
      const unsubscribe = this.subscribe((state) => {
        if (!state.isLoading && !state.error && state.data !== null) {
          cleanup();
          resolve(state.data);
        } else if (state.error) {
          cleanup();
          reject(state.error);
        }
      });

      // 清理函数
      const cleanup = () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    });
  }
}

// React Hook
export const useResourceState= <T>(
  resource: ResourceManagerImpl<T>
): ReadyResourceState<T> => {
  const [state, setState] = useState<ResourceState<T>>(() => resource.read());

  useEffect(() => {
    return resource.subscribe((newState) => {
      // 只有当数据准备好时才更新状态
      if (!newState.isLoading && !newState.isValidating && !newState.error) {
        setState(newState as ReadyResourceState<T>);
      }
    });
  }, [resource]);

  return state as ReadyResourceState<T>;
}

/**
 * Resource 缓存
 */
export const resourceCache = new Map<string, unknown>();

/**
 * 获取或创建 Resource
 */
export const getOrCreateResource= <T>(
  key: string,
  config: ResourceOptions<T> & { fetcher: () => Promise<T> }
): ResourceManagerImpl<T> => {
  const existingResource = resourceCache.get(key) as ResourceManagerImpl<T> | undefined;
  if (existingResource) {
    return existingResource;
  }

  const newResource = createResource(config.fetcher, config);
  resourceCache.set(key, newResource);
  return newResource;
}

export const createResource= <T>(
  fetcher: () => Promise<T>,
  options?: ResourceOptions<T>
): ResourceManagerImpl<T> => {
  const resource = new ResourceManagerImpl(fetcher, options);
  options?.onCreated?.(resource);
  return resource;
}

/**
 * 用于处理参数化资源的钩子
 * @param resourceFactory 资源工厂函数
 * @param params 资源参数
 * @param fallback 当参数为空时的默认值
 */
export const useParameterizedResource= <T, P>(
  resourceFactory: (params: P) => ResourceManagerImpl<T>,
  params: P | null,
  fallback: T | (() => T)
): ReadyResourceState<T> =>   {
  // 创建一个 memo 化的资源实例
  const resource = useMemo(() => {
    if (!params) {
      // 当参数为空时，创建一个返回默认值的资源
      const fallbackValue =
        typeof fallback === "function" ? (fallback as () => T)() : fallback;
      return createResource<T>(() => Promise.resolve(fallbackValue));
    }
    return resourceFactory(params);
  }, [params]); // 仅在参数变化时重新创建

  // 使用现有的 useResourceState 来管理状态
  return useResourceState(resource);
}

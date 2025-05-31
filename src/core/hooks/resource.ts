import { useEffect, useState } from "react";

/**
 * Resource 状态
 */
export type ResourceState<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

/**
 * Resource 配置
 */
export type ResourceConfig<T> = {
  fetcher: () => Promise<T>;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
};

/**
 * Resource 类
 */
export class Resource<T> {
  private promise: Promise<void> | null = null;
  private state: ResourceState<T> = {
    data: null,
    error: null,
    loading: true,
  };

  constructor(private config: ResourceConfig<T>) {
    if (config.initialData) {
      this.state.data = config.initialData;
      this.state.loading = false;
    }
  }

  /**
   * 读取资源
   */
  read(): Promise<T> {
    if (this.state.error) return Promise.reject(this.state.error);
    if (this.state.data !== null) return Promise.resolve(this.state.data);
    if (this.promise) return this.promise.then(() => this.state.data as T);
    
    this.promise = this.load();
    return this.promise.then(() => this.state.data as T);
  }

  /**
   * 加载资源
   */
  private async load() {
    try {
      const data = await this.config.fetcher();
      this.state.data = data;
      this.state.loading = false;
      this.config.onSuccess?.(data);
    } catch (error) {
      this.state.error = error as Error;
      this.state.loading = false;
      this.config.onError?.(error as Error);
    } finally {
      this.promise = null;
    }
  }

  /**
   * 更新资源
   */
  update(data: T) {
    this.state.data = data;
    this.state.loading = false;
    this.state.error = null;
    this.config.onSuccess?.(data);
  }

  /**
   * 重置资源
   */
  reset() {
    this.state = {
      data: this.config.initialData ?? null,
      error: null,
      loading: !this.config.initialData,
    };
    this.promise = null;
  }

  /**
   * 获取当前状态
   */
  getState(): ResourceState<T> {
    return { ...this.state };
  }
}

/**
 * Resource 缓存
 */
export const resourceCache = new Map<string, unknown>();

/**
 * 获取或创建 Resource
 */
export function getOrCreateResource<T>(
  key: string,
  config: ResourceConfig<T>
): Resource<T> {
  const existingResource = resourceCache.get(key) as Resource<T> | undefined;
  if (existingResource) {
    return existingResource;
  }

  const newResource = new Resource(config);
  resourceCache.set(key, newResource);
  return newResource;
}

/**
 * 使用 Resource 的 Hook
 */
export function useResource<T>(
  key: string,
  config: ResourceConfig<T>
): ResourceState<T> {
  const [state, setState] = useState<ResourceState<T>>(() => ({
    data: config.initialData ?? null,
    error: null,
    loading: !config.initialData,
  }));

  const resource = getOrCreateResource(key, {
    ...config,
    onSuccess: (data) => {
      setState({ data, error: null, loading: false });
      config.onSuccess?.(data);
    },
    onError: (error) => {
      setState({ data: null, error, loading: false });
      config.onError?.(error);
    },
  });

  useEffect(() => {
    resource.read().then(
      (data) => {
        setState({ data, error: null, loading: false });
      },
      (error) => {
        if (error instanceof Error) {
          setState({ data: null, error, loading: false });
        } else {
          setState((prev) => ({ ...prev, loading: true }));
        }
      }
    );
  }, [key]);

  return state;
}
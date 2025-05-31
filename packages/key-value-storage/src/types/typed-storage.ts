import { KeyValueStorage } from "../key-value-storage";

/**
 * 将嵌套对象类型转换为点分隔的路径类型
 * @example
 * type T = {
 *   a: { b: string; c: number };
 *   d: boolean;
 * };
 * type Result = Paths<T>; // "a.b" | "a.c" | "d"
 */
export type StoragePaths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${StoragePaths<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

/**
 * 根据路径获取嵌套对象中的值类型
 * @example
 * type T = {
 *   a: { b: string; c: number };
 *   d: boolean;
 * };
 * type Result = GetStorageValueType<T, "a.b">; // string
 */
export type GetStorageValueType<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? GetStorageValueType<T[K], R>
    : never
  : never;

/**
 * 类型安全的 KeyValueStorage
 * @example
 * const storage = new KeyValueStorage(new MemoryKeyValueStorageProvider()) as TypedKeyValueStorage<{
 *   theme: { mode: "light" | "dark" };
 *   layout: { sidebarCollapsed: boolean };
 * }>;
 */
export type TypedKeyValueStorage<T> = Omit<
  KeyValueStorage,
  "get" | "set" | "remove" | "clear" | "keys" | "size"
> & {
  /**
   * 获取存储的值
   * @param key 存储键
   * @returns 存储的值
   */
  get<K extends StoragePaths<T>>(
    key: K
  ): Promise<GetStorageValueType<T, K> | null>;

  /**
   * 设置存储的值
   * @param key 存储键
   * @param value 存储的值
   */
  set<K extends StoragePaths<T>>(
    key: K,
    value: GetStorageValueType<T, K>
  ): Promise<void>;

  /**
   * 删除存储的值
   * @param key 存储键
   */
  remove<K extends StoragePaths<T>>(key: K): Promise<void>;

  /**
   * 清除所有存储的值
   */
  clear(): Promise<void>;

  /**
   * 获取所有存储的键
   * @returns 存储的键数组
   */
  keys(): Promise<StoragePaths<T>[]>;

  /**
   * 获取存储的大小
   * @returns 存储的键值对数量
   */
  size(): Promise<number>;
};

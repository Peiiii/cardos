import { GetStorageValueType, StoragePaths } from "@cardos/key-value-storage";
import { useMemoizedFn } from "ahooks";
import {
  IKeyValueStorageData,
  keyValueStorageService,
} from "../services/key-value-storage";
import { getOrCreateResource } from "./resource";
import { useEffect } from "react";

/**
 * 创建存储资源
 */
export function createStorageResource<
  K extends StoragePaths<IKeyValueStorageData>
>(
  key: K,
  initialValue: GetStorageValueType<IKeyValueStorageData, K>,
  onChange: (
    value: NonNullable<GetStorageValueType<IKeyValueStorageData, K>>
  ) => void
) {
  return getOrCreateResource(key, {
    fetcher: async () => {
      const value = await keyValueStorageService.get<K>(key);
      return value ?? initialValue;
    },
    initialData: initialValue,
    onSuccess: (data: GetStorageValueType<IKeyValueStorageData, K>) => {
      if (data !== initialValue && data !== undefined && data !== null) {
        onChange(
          data as NonNullable<GetStorageValueType<IKeyValueStorageData, K>>
        );
      }
    },
  });
}

/**
 * 使用存储资源的 Hook
 */
export function useStorageResource<
  K extends StoragePaths<IKeyValueStorageData>
>(
  key: K,
  value: GetStorageValueType<IKeyValueStorageData, K>,
  onChange: (
    value: NonNullable<GetStorageValueType<IKeyValueStorageData, K>>
  ) => void
) {
  const resource = createStorageResource(key, value, onChange);
  const { data, loading, error } = resource.getState();

  const update = useMemoizedFn(
    (value: GetStorageValueType<IKeyValueStorageData, K>) => {
      resource.update(value);
      keyValueStorageService.set(key, value);
    }
  );

  if (loading) {
    throw resource.read();
  }

  if (error) {
    throw error;
  }

  useEffect(() => {
    if (value !== undefined && value !== null && data !== value) {
      update(value);
    }
  }, [value, data, update]);

  return {
    value: data ?? value,
    update,
  };
}

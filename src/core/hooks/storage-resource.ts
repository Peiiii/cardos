import { GetStorageValueType, StoragePaths } from "@cardos/key-value-storage";
import { useMemoizedFn } from "ahooks";
import {
  IKeyValueStorageData,
  keyValueStorageService,
} from "../services/key-value-storage";
import { getOrCreateResource } from "@/shared/lib/resource/resource";
import { useEffect } from "react";

/**
 * 创建存储资源
 */
export function createStorageResource<
  K extends StoragePaths<IKeyValueStorageData>
>(
  key: K,
  value: GetStorageValueType<IKeyValueStorageData, K>,
  onChange: (
    value: NonNullable<GetStorageValueType<IKeyValueStorageData, K>>
  ) => void
) {
  return getOrCreateResource(key, {
    fetcher: async () => {
      const data = await keyValueStorageService.get<K>(key);
      return data ?? value;
    },
    initialData: value,
    onSuccess: (data: GetStorageValueType<IKeyValueStorageData, K>) => {
      if (data !== value && data !== undefined && data !== null) {
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
  const { data, isLoading, isValidating, error } = resource.getState();
  console.log("data", data, isLoading, isValidating, error);

  const update = useMemoizedFn(
    (newValue: GetStorageValueType<IKeyValueStorageData, K>) => {
      resource.mutate(newValue, false);
      keyValueStorageService.set(key, newValue);
    }
  );

  if (isLoading || isValidating) {
    throw resource.read();
  }

  if (error) {
    throw error;
  }

  useEffect(() => {
    if (value !== undefined && value !== null && data !== value) {
      update(value as NonNullable<GetStorageValueType<IKeyValueStorageData, K>>);
    }
  }, [value, data, update, key]);

  return {
    value: data ?? value,
    update,
  };
}

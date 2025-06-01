import { GetStorageValueType, StoragePaths } from "@cardos/key-value-storage";
import { IKeyValueStorageData } from "../services/key-value-storage.service";
import { useStorageResource } from "./storage-resource";

/**
 * 连接键值存储的 Hook
 * @param param.key 存储键
 * @param param.value 初始值
 * @param param.onChange 值变化回调
 */
export function useConnectKeyValueStorage<
  K extends StoragePaths<IKeyValueStorageData>
>(param: {
  key: K;
  value: GetStorageValueType<IKeyValueStorageData, K>;
  onChange: (
    value: NonNullable<GetStorageValueType<IKeyValueStorageData, K>>
  ) => void;
}) {
  const { key, value, onChange } = param;

  const { value: currentValue } = useStorageResource(key, value, onChange);

  return {
    value: currentValue,
  };
}

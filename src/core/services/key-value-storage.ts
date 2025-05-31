import {
  KeyValueStorage,
  LocalKeyValueStorageProvider,
  TypedKeyValueStorage,
} from "@cardos/key-value-storage";

export type IKeyValueStorageData = {
  activityBar: {
    collapsed: boolean;
    activeItemKey?: string;
  };
};

export const keyValueStorageService = new KeyValueStorage(
  new LocalKeyValueStorageProvider()
) as TypedKeyValueStorage<IKeyValueStorageData>;

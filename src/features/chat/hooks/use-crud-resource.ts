import { useOptimisticUpdate } from "@/shared/lib/resource";
import {
  ResourceManagerImpl,
  useResourceState,
} from "@/shared/lib/resource/resource";
import { useMemoizedFn } from "ahooks";
import { useEffect } from "react";

export interface CRUDOperations<T extends { id: string }> {
  create: (item: Omit<T, "id">) => Promise<T>;
  createMany: (items: Omit<T, "id">[]) => Promise<T[]>;
  read: (id: string) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list: () => Promise<T[]>;
}

export function useCRUDResource<T extends { id: string }>(
  resource: ResourceManagerImpl<T[]>,
  service: CRUDOperations<T>,
  options: {
    onError?: (error: Error) => void;
    onSuccess?: (data: T[]) => void;
    reload?: boolean;
  } = {}
) {
  const { reload } = resource;
  const { data, mutate, isLoading, isValidating, error } =
    useResourceState(resource);

  const optimisticUpdate = useOptimisticUpdate(
    { data: data as T[], mutate },
    {
      onChange: options.onSuccess,
    }
  );

  const create = useMemoizedFn(async (item: Omit<T, "id">) => {
    try {
      return await optimisticUpdate(
        (items) => [...items, { ...item, id: "temp" } as T],
        () => service.create(item)
      );
    } catch (error) {
      options.onError?.(error as Error);
      throw error;
    }
  });

  const createMany = useMemoizedFn(async (items: Omit<T, "id">[]) => {
    try {
      return await optimisticUpdate(
        (currentItems) => [
          ...currentItems,
          ...items.map((item) => ({ ...item, id: "temp" } as T)),
        ],
        () => service.createMany(items)
      );
    } catch (error) {
      options.onError?.(error as Error);
      throw error;
    }
  });

  const read = useMemoizedFn(async (id: string) => {
    try {
      return await service.read(id);
    } catch (error) {
      options.onError?.(error as Error);
      throw error;
    }
  });

  const update = useMemoizedFn(async (id: string, data: Partial<T>) => {
    try {
      return await optimisticUpdate(
        (items) =>
          items.map((item) => (item.id === id ? { ...item, ...data } : item)),
        () => service.update(id, data)
      );
    } catch (error) {
      options.onError?.(error as Error);
      throw error;
    }
  });

  const remove = useMemoizedFn(async (id: string) => {
    try {
      await optimisticUpdate(
        (items) => items.filter((item) => item.id !== id),
        () => service.delete(id)
      );
    } catch (error) {
      options.onError?.(error as Error);
      throw error;
    }
  });

  useEffect(() => {
    if (options.reload) {
      resource.reload();
    }
  }, [options.reload, resource]);

  return {
    data,
    isLoading,
    isValidating,
    error,
    create,
    createMany,
    read,
    update,
    remove,
    mutate,
    reload,
  };
}

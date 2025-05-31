import {
  CascadingKeyValueStoreProvider,
  KeyValueStorage,
  LocalKeyValueStoreProvider,
  MemoryKeyValueStoreProvider,
  RemoteKeyValueStoreProvider,
} from "../index";

// 定义存储键类型
type AppStorageKey = {
  // 主题设置
  theme: {
    mode: "light" | "dark";
    name: string;
  };
  // 布局设置
  layout: {
    sidebarCollapsed: boolean;
    activityBarExpanded: boolean;
  };
  // 聊天设置
  chat: {
    defaultSessionId: string | null;
  };
};

// 1. 本地存储示例
async function localStorageExample() {
  const storage = new KeyValueStorage(new LocalKeyValueStoreProvider());

  // 设置值
  await storage.set("theme.mode", "dark");
  await storage.set("theme.name", "default");

  // 获取值
  const themeMode = await storage.get<AppStorageKey["theme"]["mode"]>(
    "theme.mode"
  );
  console.log("Theme mode:", themeMode);

  // 删除值
  await storage.remove("theme.mode");

  // 清除所有存储
  await storage.clear();
}

// 2. 内存存储示例
async function memoryStorageExample() {
  const storage = new KeyValueStorage(new MemoryKeyValueStoreProvider());

  // 设置值
  await storage.set("layout.sidebarCollapsed", true);
  await storage.set("layout.activityBarExpanded", true);

  // 获取值
  const sidebarCollapsed = await storage.get("layout.sidebarCollapsed");
  console.log("Sidebar collapsed:", sidebarCollapsed);

  // 获取所有键
  const keys = await storage.keys();
  console.log("All keys:", keys);

  // 获取存储大小
  const size = await storage.size();
  console.log("Storage size:", size);
}

// 3. 远程存储示例
async function remoteStorageExample() {
  const storage = new KeyValueStorage(
    new RemoteKeyValueStoreProvider("https://api.example.com")
  );

  // 设置值
  await storage.set("chat.defaultSessionId", "session-123");

  // 获取值
  const sessionId = await storage.get<
    AppStorageKey["chat"]["defaultSessionId"]
  >("chat.defaultSessionId");
  console.log("Default session ID:", sessionId);

  // 删除值
  await storage.remove("chat.defaultSessionId");
}

// 4. 级联存储示例
async function cascadingStorageExample() {
  const storage = new KeyValueStorage(
    new CascadingKeyValueStoreProvider([
      {
        name: "memory",
        store: new MemoryKeyValueStoreProvider(),
        maxSize: 1000,
        ttl: 5 * 60 * 1000, // 5分钟过期
      },
      {
        name: "local",
        store: new LocalKeyValueStoreProvider(),
      },
      {
        name: "remote",
        store: new RemoteKeyValueStoreProvider("https://api.example.com"),
      },
    ])
  );

  // 设置值
  await storage.set("theme.mode", "dark");
  await storage.set("layout.sidebarCollapsed", true);
  await storage.set("chat.defaultSessionId", "session-123");

  // 获取值
  const themeMode = await storage.get<AppStorageKey["theme"]["mode"]>(
    "theme.mode"
  );
  const sidebarCollapsed = await storage.get<
    AppStorageKey["layout"]["sidebarCollapsed"]
  >("layout.sidebarCollapsed");
  const sessionId = await storage.get<
    AppStorageKey["chat"]["defaultSessionId"]
  >("chat.defaultSessionId");

  console.log("Theme mode:", themeMode);
  console.log("Sidebar collapsed:", sidebarCollapsed);
  console.log("Default session ID:", sessionId);

  // 获取所有键
  const keys = await storage.keys();
  console.log("All keys:", keys);

  // 获取存储大小
  const size = await storage.size();
  console.log("Storage size:", size);

  // 清除所有存储
  await storage.clear();
}

// 运行所有示例
async function runAllExamples() {
  console.log("=== Local Storage Example ===");
  await localStorageExample();

  console.log("\n=== Memory Storage Example ===");
  await memoryStorageExample();

  console.log("\n=== Remote Storage Example ===");
  await remoteStorageExample();

  console.log("\n=== Cascading Storage Example ===");
  await cascadingStorageExample();
}

// 导出示例函数
export {
  cascadingStorageExample,
  localStorageExample,
  memoryStorageExample,
  remoteStorageExample,
  runAllExamples,
};

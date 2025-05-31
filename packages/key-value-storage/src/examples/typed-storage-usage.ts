import {
  KeyValueStorage,
  MemoryKeyValueStorageProvider,
  TypedKeyValueStorage,
} from "../index";

// 定义存储类型
type AppStorage = {
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

async function typedStorageExample() {
  // 创建类型安全的存储实例
  const storage = new KeyValueStorage(
    new MemoryKeyValueStorageProvider()
  ) as TypedKeyValueStorage<AppStorage>;

  // 设置值 - 类型安全
  await storage.set("theme.mode", "dark"); // ✅ 正确
  await storage.set("theme.name", "default"); // ✅ 正确
  await storage.set("layout.sidebarCollapsed", true); // ✅ 正确
  await storage.set("chat.defaultSessionId", "session-123"); // ✅ 正确

  // 以下代码会在编译时报错
  // await storage.set("theme.mode", "invalid"); // ❌ 错误：类型 "invalid" 不能赋值给类型 "light" | "dark"
  // await storage.set("invalid.key", "value"); // ❌ 错误：类型 "invalid.key" 不能赋值给类型 Paths<AppStorage>
  // await storage.set("theme.mode", 123); // ❌ 错误：类型 "number" 不能赋值给类型 "light" | "dark"

  // 获取值 - 类型安全
  const themeMode = await storage.get("theme.mode"); // 类型为 "light" | "dark" | null
  const sidebarCollapsed = await storage.get("layout.sidebarCollapsed"); // 类型为 boolean | null
  const sessionId = await storage.get("chat.defaultSessionId"); // 类型为 string | null

  // 以下代码会在编译时报错
  // const invalid = await storage.get("invalid.key"); // ❌ 错误：类型 "invalid.key" 不能赋值给类型 Paths<AppStorage>

  // 删除值 - 类型安全
  await storage.remove("theme.mode"); // ✅ 正确
  await storage.remove("layout.sidebarCollapsed"); // ✅ 正确

  // 以下代码会在编译时报错
  // await storage.remove("invalid.key"); // ❌ 错误：类型 "invalid.key" 不能赋值给类型 Paths<AppStorage>

  // 获取所有键 - 类型安全
  const keys = await storage.keys(); // 类型为 Paths<AppStorage>[]
  console.log("All keys:", keys);

  // 获取存储大小
  const size = await storage.size();
  console.log("Storage size:", size);

  // 清除所有存储
  await storage.clear();

  console.log("Theme mode:", themeMode);
  console.log("Sidebar collapsed:", sidebarCollapsed);
  console.log("Session ID:", sessionId);
}

// 导出示例函数
export { typedStorageExample };

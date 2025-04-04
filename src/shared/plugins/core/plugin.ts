export interface Plugin {
  id: string;
  name: string;
  children?: Plugin[];
  register: () => void;
  unregister: () => void;
}

export class PluginManager {
  private static instance: PluginManager;
  private plugins: Map<string, Plugin> = new Map();

  private constructor() {}

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager();
    }
    return PluginManager.instance;
  }

  register(plugin: Plugin) {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered`);
      return;
    }

    // 注册主插件
    plugin.register();
    this.plugins.set(plugin.id, plugin);

    // 注册子插件
    plugin.children?.forEach(child => this.register(child));
  }

  unregister(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin ${pluginId} not found`);
      return;
    }

    // 注销子插件
    plugin.children?.forEach(child => this.unregister(child.id));

    // 注销主插件
    plugin.unregister();
    this.plugins.delete(pluginId);
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }
} 
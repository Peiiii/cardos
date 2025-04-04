import { Plugin } from '@/shared/plugins/core/plugin';

class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin) {
    this.plugins.set(plugin.id, plugin);
    plugin.register();
  }

  unregister(id: string) {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.unregister();
      this.plugins.delete(id);
    }
  }

  getPlugin(id: string) {
    return this.plugins.get(id);
  }

  getAllPlugins() {
    return Array.from(this.plugins.values());
  }
}

export const pluginRegistry = new PluginRegistry(); 
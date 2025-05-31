# Activity Bar 组件

Activity Bar 是一个高度可定制的侧边栏组件，类似于 VS Code 的侧边栏，提供了可折叠、可切换的导航功能。支持两种使用模式：基础组件模式和复合组件模式。

## 特性

- 🎯 可折叠/展开的侧边栏
- 🎨 支持左右两侧布局
- 🔄 可控制的展开状态
- 🎮 支持键盘导航
- 🎭 支持自定义图标和标签
- 📱 响应式设计
- 🎪 支持徽章（Badge）显示
- 🎯 支持禁用状态
- 🎨 完全可定制的样式
- 🎯 支持复合组件模式
- 🎭 支持分组和分隔
- 🎪 支持搜索功能

## 组件结构

```
activity-bar/
├── activity-bar-component.tsx    # 主组件
├── activity-bar-context.tsx      # 上下文管理
├── activity-bar-namespace.tsx    # 命名空间定义
├── activity-bar-toggle-button.tsx # 切换按钮
├── activity-group.tsx           # 分组组件
├── activity-group-list.tsx      # 分组列表
├── activity-header-optimized.tsx # 优化的头部组件
├── activity-item.tsx            # 活动项组件
├── configurable-activity-bar.tsx # 可配置的活动栏
└── index.tsx                    # 导出文件
```

## 使用方法

### 复合组件模式（推荐）

复合组件模式提供了更直观和灵活的 API，推荐在新项目中使用：

```tsx
import { ActivityBar } from "@/components/activity-bar"
import {
  Home,
  Settings,
  Users,
  Mail,
  Calendar,
  LayoutDashboard,
  HelpCircle,
  Code,
  Database,
  Cloud,
  Server,
  Shield,
} from "lucide-react"

export function MyActivityBar() {
  const [expanded, setExpanded] = React.useState(true)
  const [activeSection, setActiveSection] = React.useState("home")

  return (
    <ActivityBar.Root
      expanded={expanded}
      defaultActiveId={activeSection}
      onExpandedChange={setExpanded}
      onActiveChange={setActiveSection}
    >
      {/* 头部区域 */}
      <ActivityBar.Header
        icon={<LayoutDashboard />}
        title="工作空间"
        showSearch={true}
      />

      {/* 分组列表 */}
      <ActivityBar.GroupList>
        {/* 导航分组 */}
        <ActivityBar.Group title="导航">
          <ActivityBar.Item id="home" icon={<Home />} label="首页" />
          <ActivityBar.Item id="users" icon={<Users />} label="用户" />
          <ActivityBar.Item id="messages" icon={<Mail />} label="消息" badge={3} />
          <ActivityBar.Item id="calendar" icon={<Calendar />} label="日历" />
        </ActivityBar.Group>

        {/* 开发分组 */}
        <ActivityBar.Group title="开发">
          <ActivityBar.Item id="code" icon={<Code />} label="代码" />
          <ActivityBar.Item id="database" icon={<Database />} label="数据库" />
          <ActivityBar.Item id="cloud" icon={<Cloud />} label="云服务" />
          <ActivityBar.Item id="server" icon={<Server />} label="服务器" disabled />
        </ActivityBar.Group>
      </ActivityBar.GroupList>

      {/* 底部区域 */}
      <ActivityBar.Footer>
        <ActivityBar.Separator />
        <ActivityBar.Group>
          <ActivityBar.Item id="settings" icon={<Settings />} label="设置" />
          <ActivityBar.Item id="security" icon={<Shield />} label="安全" />
          <ActivityBar.Item id="help" icon={<HelpCircle />} label="帮助" />
        </ActivityBar.Group>
      </ActivityBar.Footer>
    </ActivityBar.Root>
  )
}
```

### 基础组件模式

基础组件模式提供了更简单的 API，适合快速实现：

```tsx
import { ActivityBarComponent, ActivityItem } from "@/components/activity-bar"
import { Home, Settings, User } from "lucide-react"

export function BasicActivityBar() {
  return (
    <ActivityBarComponent>
      <ActivityItem
        id="home"
        icon={<Home />}
        label="首页"
      />
      <ActivityItem
        id="settings"
        icon={<Settings />}
        label="设置"
      />
      <ActivityItem
        id="profile"
        icon={<User />}
        label="个人中心"
        badge="New"
      />
    </ActivityBarComponent>
  )
}
```

## 组件 API

### 复合组件模式

#### ActivityBar.Root

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| position | "left" \| "right" | "left" | 侧边栏位置 |
| expanded | boolean | false | 是否展开 |
| defaultExpanded | boolean | false | 默认展开状态 |
| defaultActiveId | string | - | 默认激活项 |
| toggleable | boolean | true | 是否可切换 |
| onExpandedChange | (expanded: boolean) => void | - | 展开状态改变回调 |
| onActiveChange | (activeId: string) => void | - | 激活项改变回调 |

#### ActivityBar.Header

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| icon | React.ReactNode | - | 头部图标 |
| title | string | - | 标题文本 |
| showSearch | boolean | false | 是否显示搜索框 |

#### ActivityBar.Group

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| title | string | - | 分组标题 |

#### ActivityBar.Item

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| id | string | - | 唯一标识符 |
| icon | React.ReactNode | - | 图标 |
| label | string | - | 标签文本 |
| badge | React.ReactNode | - | 徽章内容 |
| disabled | boolean | false | 是否禁用 |
| onClick | () => void | - | 点击回调 |

### 基础组件模式

基础组件模式的 API 与复合组件模式相同，只是使用方式不同。

## 主题定制

组件使用 Tailwind CSS 进行样式管理，可以通过以下方式自定义主题：

1. 修改 `activityBarVariants` 中的样式定义
2. 使用 `cn()` 工具函数组合自定义类名
3. 通过 CSS 变量覆盖默认主题

## 最佳实践

1. 优先使用复合组件模式，提供更好的开发体验
2. 使用 `ActivityBar.Group` 对相关项目进行分组
3. 合理使用徽章显示重要信息
4. 保持导航项数量适中，避免过度拥挤
5. 为重要操作提供键盘快捷键
6. 使用有意义的图标和标签
7. 在头部区域添加搜索功能，提升用户体验

## 注意事项

1. 确保每个 `ActivityBar.Item` 都有唯一的 `id`
2. 图标组件需要支持 `className` 属性
3. 在移动端使用时注意响应式布局
4. 考虑使用 `ActivityBarContext` 进行状态管理
5. 合理使用分组和分隔线，提高导航的清晰度

## 相关组件

- `ActivityBar.Group`: 用于对导航项进行分组
- `ActivityBar.GroupList`: 分组列表容器
- `ActivityBar.Header`: 头部区域组件
- `ActivityBar.Footer`: 底部区域组件
- `ActivityBar.Separator`: 分隔线组件
- `ActivityBar.ToggleButton`: 控制侧边栏展开/折叠
- `ConfigurableActivityBar`: 提供更多配置选项的活动栏 
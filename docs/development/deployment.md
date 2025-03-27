# CardOS 个人部署文档（国内环境）

## 1. 环境准备

### 1.1 开发环境
- **系统要求**
  - Node.js 18+
  - pnpm 8+
  - Git
  - VS Code（推荐）

- **开发工具**
  - 前端：React 开发工具
  - AI：阿里云通义千问 API（Qwen-max-latest 模型）
  - 存储：本地存储/阿里云对象存储/云数据库

### 1.2 部署环境
- **推荐服务**
  - 阿里云：前端应用部署
  - Cloudflare：可选的前端部署和 CDN
  - 阿里云 OSS：静态资源存储
  - 阿里云云数据库/MongoDB Atlas：数据存储
  - GitHub/Gitee：代码管理和 CI/CD

## 2. 部署流程

### 2.1 本地开发
- **项目设置**
  - 克隆代码库
  ```bash
  git clone https://github.com/Peiiii/cardos.git
  cd cardos
  ```

  - 安装依赖
  ```bash
  pnpm install
  ```

  - 启动开发服务器
  ```bash
  pnpm dev
  ```

- **环境配置**
  - 创建 `.env.local` 文件
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3000/api
  
  # 阿里云通义千问配置
  QWEN_API_KEY=your_qwen_api_key
  QWEN_API_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
  
  # 可选的其他大模型配置
  LLM_PROVIDER=qwen  # 可选值：qwen, azure, 等
  
  # 阿里云 OSS 配置（如需使用）
  OSS_REGION=oss-cn-hangzhou
  OSS_ACCESS_KEY_ID=your_oss_access_key_id
  OSS_ACCESS_KEY_SECRET=your_oss_access_key_secret
  OSS_BUCKET=your_bucket_name
  ```

### 2.2 模型配置
- **通义千问 API 配置**
  - 注册阿里云账号
  - 开通通义千问 API 服务
  - 获取 API key
  - 配置 API 客户端适配器

- **多模型支持**
  ```typescript
  // 创建模型适配器工厂
  class LLMAdapterFactory {
    static createAdapter(provider: string) {
      switch (provider) {
        case 'qwen':
          return new QwenAdapter({
            apiKey: process.env.QWEN_API_KEY,
            endpoint: process.env.QWEN_API_ENDPOINT,
            model: 'qwen-max-latest',
          });
        case 'azure':
          return new AzureAdapter({
            // Azure 配置
          });
        default:
          return new QwenAdapter({
            // 默认配置
          });
      }
    }
  }
  
  // 使用方式
  const llm = LLMAdapterFactory.createAdapter(process.env.LLM_PROVIDER || 'qwen');
  const response = await llm.generateText(prompt);
  ```

### 2.3 阿里云部署
- **静态部署准备**
  - 在 GitHub/Gitee 上创建仓库
  - 将项目推送到仓库
  ```bash
  git add .
  git commit -m "Initial commit"
  git push origin main
  ```

- **Next.js 静态导出配置**
  - 修改 `next.config.js`
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: 'export',  // 导出静态 HTML
    images: {
      unoptimized: true,  // 避免图片优化问题
    },
    // 其他配置
  };
  
  module.exports = nextConfig;
  ```

- **阿里云 OSS 部署**
  - 创建 OSS Bucket
  - 安装部署工具
  ```bash
  pnpm add -D ossutil
  ```
  - 配置部署脚本（package.json）
  ```json
  "scripts": {
    "build": "next build",
    "deploy": "next build && ossutil cp -rf out oss://your-bucket-name/"
  }
  ```

- **Cloudflare Pages 部署**（可选）
  - 在 Cloudflare Pages 中导入 GitHub/Gitee 仓库
  - 配置构建命令：`pnpm build`
  - 配置输出目录：`out`
  - 设置环境变量

### 2.4 数据存储设置
- **阿里云云数据库**
  - 创建 RDS MySQL/MongoDB 实例
  - 设置数据库和用户
  - 配置网络安全组
  - 添加数据库连接信息到环境变量

- **MongoDB Atlas**（可选）
  - 创建 MongoDB Atlas 账号
  - 创建数据库集群（选择香港/东京区域服务器）
  - 配置网络访问设置
  - 添加数据库连接字符串到环境变量

- **本地存储方案**
  - 为纯前端应用实现 IndexedDB 封装
  ```typescript
  // 简单的 IndexedDB 存储服务
  class IndexedDBStorage {
    private db: IDBDatabase | null = null;
    private dbName: string;
    
    constructor(dbName: string) {
      this.dbName = dbName;
    }
    
    async init() {
      return new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          // 创建对象存储
          if (!db.objectStoreNames.contains('cards')) {
            db.createObjectStore('cards', { keyPath: 'id' });
          }
        };
        
        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };
        
        request.onerror = (event) => {
          reject(`IndexedDB error: ${(event.target as IDBOpenDBRequest).error}`);
        };
      });
    }
    
    // 基本 CRUD 操作实现...
  }
  ```

## 3. 持续集成/部署

### 3.1 GitHub Actions 设置
- **基础 CI 设置**
  - 创建 `.github/workflows/ci.yml` 文件
  ```yaml
  name: CI

  on:
    push:
      branches: [ main ]
    pull_request:
      branches: [ main ]

  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'
        - name: Install pnpm
          run: npm install -g pnpm
        - name: Install dependencies
          run: pnpm install
        - name: Run linter
          run: pnpm lint
        - name: Run tests
          run: pnpm test
  ```

- **自动部署到阿里云 OSS**
  - 创建 `.github/workflows/deploy.yml` 文件
  ```yaml
  name: Deploy to Aliyun OSS

  on:
    push:
      branches: [ main ]

  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Setup Node.js
          uses: actions/setup-node@v3
          with:
            node-version: '18'
        - name: Install pnpm
          run: npm install -g pnpm
        - name: Install dependencies
          run: pnpm install
        - name: Build
          run: pnpm build
        - name: Deploy to OSS
          uses: manyuanrong/setup-ossutil@v2.0
          with:
            endpoint: "oss-cn-hangzhou.aliyuncs.com"
            access-key-id: ${{ secrets.OSS_ACCESS_KEY_ID }}
            access-key-secret: ${{ secrets.OSS_ACCESS_KEY_SECRET }}
        - run: ossutil cp -rf ./out oss://${{ secrets.OSS_BUCKET }}/
  ```

### 3.2 版本管理
- **版本控制**
  - 使用语义化版本
  - 添加变更日志
  - 为重要版本打标签
  ```bash
  git tag -a v0.1.0 -m "First MVP release"
  git push origin v0.1.0
  ```

## 4. 监控与维护

### 4.1 监控工具
- **免费监控工具**
  - 阿里云监控：基础性能监控
  - 百度统计/友盟+：用户行为分析
  - Sentry：错误跟踪（免费额度）
  - UptimeRobot：网站可用性监控

### 4.2 日志与错误
- **日志收集**
  - 前端日志记录
  - 自定义日志服务
  - Sentry 错误报告

- **错误处理**
  - 实现全局错误边界
  - 添加错误报告功能
  - 自定义错误收集接口

### 4.3 备份策略
- **代码备份**
  - GitHub/Gitee 仓库作为主要代码备份
  - 定期本地备份代码

- **数据备份**
  - 用户数据导出功能
  - 定期导出重要数据

## 5. 性能优化

### 5.1 前端优化
- **基础优化**
  - 图片优化：使用响应式图片
  - 代码分割：使用动态导入
  - 客户端渲染优化
  - 资源预加载

- **进阶优化**
  - 缓存策略：实现 SWR 或 React Query
  - 本地状态管理优化
  - Web Workers 处理复杂计算
  - 服务端缓存策略

### 5.2 API 与模型优化
- **AI 响应优化**
  - 实现本地结果缓存
  - 预生成常用内容
  - 流式响应处理
  - 降级策略（网络不佳时）

- **网络请求优化**
  - 请求合并和批处理
  - 断点续传
  - 网络状态检测与适应

## 文档更新记录

| 日期 | 更新内容 | 更新人 |
|------|----------|--------|
| 2024-03-26 | 创建部署文档 | - |
| 2024-03-26 | 修改为个人部署文档 | - |
| 2024-03-26 | 调整为国内环境部署方案 | - | 
# CC Chat Web

Web 前端，用于浏览帖子和查看社区内容。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS + Typography
- **语言**: TypeScript
- **Markdown**: marked

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

访问 http://localhost:3000

## 部署到 Vercel

### 方式 1：通过 GitHub 集成（推荐）

1. 访问 https://vercel.com
2. 点击 **"Import Project"**
3. 连接 GitHub 并选择 `Optima-Chat/cc-chat` 仓库
4. 配置项目：
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
5. 点击 **"Deploy"**

Vercel 会自动：
- 检测 Next.js 项目
- 安装依赖
- 构建并部署
- 提供域名（如 `cc-chat.vercel.app`）

### 方式 2：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

## 绑定自定义域名

1. Vercel Dashboard → 你的项目 → **Settings** → **Domains**
2. 添加域名：`cc-chat.dev`
3. 按照提示配置 DNS：
   - **Type**: A
   - **Name**: @
   - **Value**: `76.76.21.21`

或使用 CNAME：
   - **Type**: CNAME
   - **Name**: @
   - **Value**: `cname.vercel-dns.com`

## 环境变量

无需配置，API 地址已硬编码为 `https://api.cc-chat.dev`

## 自动部署

连接 GitHub 后，每次推送到 `main` 分支都会自动部署。

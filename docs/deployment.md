# 部署指南

## Railway 部署（推荐）

### 前提条件
- GitHub 账号
- Railway 账号（https://railway.app）

### 步骤

#### 1. 通过 GitHub 部署（最简单）

1. 访问 [Railway](https://railway.app)
2. 点击 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 授权并选择 `Optima-Chat/cc-chat` 仓库
5. Railway 会自动检测 `railway.json` 并开始构建

#### 2. 添加 PostgreSQL

1. 在 Railway 项目面板，点击 "New"
2. 选择 "Database" → "Add PostgreSQL"
3. Railway 会自动注入 `DATABASE_URL` 环境变量到 API 服务

#### 3. 配置环境变量

在 API 服务的 "Variables" 标签页添加：

```
NODE_ENV=production
```

其他变量（如 `DATABASE_URL`）Railway 会自动注入。

#### 4. 配置域名

1. 在 API 服务的 "Settings" 标签页
2. 找到 "Networking" → "Public Networking"
3. 点击 "Generate Domain" 或绑定自定义域名 `api.cc-chat.dev`

#### 5. 更新 CLI 配置

部署完成后，在本地更新 CLI 的 API 地址：

```bash
# 设置环境变量
export CC_CHAT_API_URL=https://your-api.railway.app

# 或在 CLI 配置中永久设置
```

### 使用 Railway CLI 部署

```bash
# 1. 安装 Railway CLI
npm i -g @railway/cli

# 2. 登录
railway login

# 3. 从项目根目录初始化
railway init

# 4. 链接到现有项目或创建新项目
railway link

# 5. 添加 PostgreSQL
railway add --database postgresql

# 6. 部署
railway up

# 7. 查看日志
railway logs
```

### 成本估算

Railway 免费计划：
- $5 使用额度/月
- 500 小时执行时间
- 1GB 出站流量
- 100GB 入站流量

对于 MVP 阶段完全够用。

## 其他部署方式

### Render

1. 访问 [Render](https://render.com)
2. 连接 GitHub 仓库
3. 创建 Web Service（选择 `api` 目录）
4. 创建 PostgreSQL 数据库
5. 配置环境变量

### 云服务器（VPS）

如果你有腾讯云/阿里云服务器：

```bash
# 1. SSH 到服务器
ssh user@your-server

# 2. 克隆仓库
git clone https://github.com/Optima-Chat/cc-chat.git
cd cc-chat

# 3. 安装 Docker 和 Docker Compose
# （省略安装步骤）

# 4. 启动服务
docker compose up -d

# 5. 配置 Nginx 反向代理
# 将 api.cc-chat.dev 指向 localhost:3000
```

## CLI 发布到 npm

```bash
cd cli

# 1. 登录 npm
npm login

# 2. 更新版本号
npm version patch

# 3. 发布
npm publish

# 4. 测试安装
npx cc-chat@latest --version
```

## 监控和维护

### Railway

- 查看日志：Railway Dashboard → Deployments → Logs
- 查看指标：Dashboard → Metrics
- 设置告警：Dashboard → Settings → Notifications

### 数据库备份

Railway PostgreSQL 会自动备份，但建议定期手动备份：

```bash
# 使用 Railway CLI
railway run pg_dump > backup.sql
```

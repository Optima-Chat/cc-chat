# CC Chat API

后端 API 服务

## 快速开始

### 使用 Docker Compose

```bash
# 从项目根目录运行
docker compose up -d
```

API 将运行在 `http://localhost:3000`

### 本地开发

```bash
# 安装依赖
npm install

# 启动 PostgreSQL 和 Redis（使用 Docker）
docker compose up -d postgres redis

# 复制环境变量
cp .env.example .env

# 开发模式
npm run dev
```

## API 端点

### 健康检查
- `GET /health` - 服务状态

### 认证
- `POST /api/auth/login` - 登录

### 帖子
- `GET /api/posts` - 获取帖子列表
- `GET /api/posts/:id` - 获取单个帖子
- `POST /api/posts` - 创建帖子（需要认证）
- `POST /api/posts/:id/comments` - 评论（需要认证）

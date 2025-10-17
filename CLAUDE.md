# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

CC Chat 是 Claude Code 用户的中文聊天社区，支持自然语言 CLI、Web 界面和自动 Reddit 内容同步。

**三个主要组件：**
- `cli/` - TypeScript CLI 工具（Commander.js）
- `api/` - Fastify 后端 API（PostgreSQL）
- `web/` - Next.js 15 前端
- `scripts/` - Python Reddit 内容同步服务

## 常用开发命令

### 启动完整开发环境

```bash
# 1. 启动数据库（PostgreSQL）
docker compose up -d

# 2. 启动 API（端口 3000，需要等数据库就绪）
cd api && npm install && npm run dev

# 3. 启动 Web（端口 3000）
cd web && npm install && npm run dev

# 4. 开发 CLI（使用 tsx 实时编译）
cd cli && npm install && npm run dev
```

### 构建和测试

```bash
# API 构建
cd api && npm run build

# CLI 构建和本地链接
cd cli && npm run build && npm link

# Web 构建
cd web && npm run build
```

### 发布新版本

```bash
# 自动化发布流程（会自动发布到 npm 和创建 GitHub Release）
cd cli
npm version patch  # 或 minor/major（会自动创建 git tag）
git push && git push --tags  # 触发 GitHub Actions 自动发布
```

**重要：** `npm version` 会自动更新 package.json、创建 commit 和 tag。推送 tag 后 GitHub Actions 自动发布。

### Reddit 内容同步

```bash
cd scripts
pip install -r requirements.txt
python main.py  # 本地运行（需要配置 .env）
```

GitHub Actions 每 6 小时自动运行。

## 架构说明

### 认证流程（GitHub OAuth）

1. CLI 调用 `cc-chat login --username "xxx"`
2. 打开浏览器访问 `https://api.cc-chat.dev/api/auth/github`
3. GitHub OAuth 授权后返回 `github_id`
4. CLI 将 `github_id` 保存到本地配置（使用 `conf` 包）
5. 后续请求通过 `X-GitHub-ID` header 传递认证信息

**关键文件：**
- `api/src/routes/auth.ts` - GitHub OAuth 路由
- `cli/src/commands/login.ts` - CLI 登录逻辑
- `cli/src/config.ts` - 本地配置管理

### API 路由结构

所有路由位于 `api/src/routes/`：
- `posts.ts` - 帖子 CRUD、投票、热度排序算法
- `auth.ts` - GitHub OAuth 认证
- `users.ts` - 用户资料、帖子列表、评论列表
- `notifications.ts` - 通知系统（@提及、回复）
- `bookmarks.ts` - 收藏功能
- `tags.ts` - 标签系统

**热度排序算法：** 位于 `posts.ts` 的 `calculateHotScore()` 函数，基于投票数、评论数和时间衰减。

### CLI 命令实现

所有命令位于 `cli/src/commands/`，使用 `Commander.js`。每个命令文件对应一个功能模块。

**API 客户端：** `cli/src/api/client.ts` - 使用 axios 封装所有 API 调用，自动添加 GitHub ID header。

**配置管理：** `cli/src/config.ts` - 使用 `conf` 包存储用户 github_id 到本地。

**重要：** `cli/src/postinstall.ts` 在 CI 环境中会跳过（检测 `CI=true`），避免构建时运行。

### Web 前端架构

- 使用 Next.js 15 App Router
- 所有页面位于 `web/app/`
- API 调用直接使用 `fetch` 到 `https://api.cc-chat.dev`
- Tailwind CSS 样式
- Markdown 渲染使用 `marked` 库

**SEO：** `web/app/layout.tsx` 包含完整的 metadata、Open Graph、JSON-LD 结构化数据。

**Sitemap：** `web/app/sitemap.ts` 动态生成（包含所有帖子），`web/public/sitemap.xml` 作为后备。

### 数据库 Schema

数据库初始化在 `api/src/db.ts` 的 `initDb()` 函数。

**核心表：**
- `users` - 用户（github_id, username, avatar_url）
- `posts` - 帖子（支持软删除 deleted_at）
- `comments` - 评论（支持嵌套 parent_id、软删除）
- `votes` - 投票（user_id + post_id 唯一）
- `tags` - 标签
- `post_tags` - 帖子标签关联
- `notifications` - 通知（类型：POST_REPLY, COMMENT_REPLY, MENTION）
- `bookmarks` - 收藏

**重要索引：**
- `idx_posts_created_at` - 时间排序
- `idx_posts_upvotes` - 热度排序
- `idx_notifications_unread` - 未读通知查询

### Reddit 内容同步服务

位于 `scripts/`，独立的 Python 服务：

1. `scrapers/reddit_scraper.py` - 抓取 r/ClaudeAI 热门帖子
2. `translator.py` - OpenAI API 翻译为中文
3. `deduplicator.py` - 去重检查（基于 `data/seen_urls.json`）
4. `publisher.py` - 发布到 CC Chat API
5. `main.py` - 主流程编排

**GitHub Actions：** `.github/workflows/sync-content.yml` 每 6 小时运行一次。

## 部署说明

### API 部署（Railway）

- 自动部署：推送到 main 分支
- 环境变量：`DATABASE_URL`（Railway 自动提供）
- 健康检查：`GET /health`

### Web 部署（Vercel）

- 自动部署：推送到 main 分支
- Root Directory: `web`
- Framework: Next.js
- 域名：www.cc-chat.dev

### 环境变量管理

**GitHub Secrets（用于 CI/CD）：**
- `NPM_TOKEN` - npm 发布令牌
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` - Reddit API
- `OPENAI_API_KEY` - OpenAI 翻译
- `CC_CHAT_TOKEN` - 同步服务的 GitHub ID

## 关键约定

### Commit 规范

遵循 Conventional Commits：
- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `chore:` - 构建/工具相关

### GitHub Actions Workflows

- `release.yml` - 检测 v* tag 自动发布到 npm 和创建 Release
- `sync-content.yml` - 每 6 小时同步 Reddit 内容

### 代码风格

- TypeScript strict 模式
- 使用 `docker compose` 而不是 `docker-compose`
- API 响应使用 JSON
- CLI 输出使用 chalk 彩色格式化

## 自然语言 CLI 集成

CLI 会在安装后自动更新 `~/.claude/CLAUDE.md`，让 Claude Code 识别所有命令。

**测试命令：**
```bash
cc-chat browse --limit 5
cc-chat user veryverypro
cc-chat search "MCP"
```

## 推广渠道

当需要推广时，优先考虑：
1. Product Hunt（需要准备 demo 视频和截图）
2. Hacker News Show HN
3. Reddit r/ClaudeAI
4. 知乎、掘金、即刻（中文社区）

**不要忘记：** 使用 `gh` CLI 自动化 GitHub 操作，避免手动步骤。

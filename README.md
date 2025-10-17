<div align="center">

# 🤖 CC Chat

**Claude Code 用户的中文聊天社区**

让 Claude 帮你发帖交流，无需离开终端

[![npm version](https://img.shields.io/npm/v/@optima-chat/cc-chat.svg)](https://www.npmjs.com/package/@optima-chat/cc-chat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/Optima-Chat/cc-chat.svg)](https://github.com/Optima-Chat/cc-chat/stargazers)

[网站](https://www.cc-chat.dev) · [安装](#快速开始) · [文档](#完整命令列表) · [贡献](#贡献指南)

</div>

---

## ✨ 亮点特性

- 🎯 **零配置集成** - 一行命令安装，Claude 自动识别
- 💬 **自然语言交互** - 用人话发帖，不用记命令
- 🚀 **全功能 CLI** - 浏览、搜索、评论、投票、收藏、通知
- 🌐 **Web + CLI 双端** - 终端和浏览器都能用
- 🔄 **自动内容同步** - 从 Reddit 自动抓取翻译优质内容
- 🏷️ **智能标签系统** - MCP、技巧、项目、问题等分类
- 🔔 **实时通知** - @提及、回复通知
- ⭐ **收藏功能** - 保存喜欢的帖子
- 📊 **用户主页** - 查看用户的帖子、评论、统计数据
- 🎨 **代码高亮** - Markdown 渲染，语法高亮

## 🎬 演示

<!-- TODO: 添加演示 GIF -->

```bash
# 自然语言发帖
$ "帮我发个帖子分享我的 MCP 配置"

# Claude 自动执行
✓ 已发布帖子
  ID: 42
  标题: 我的 MCP 配置分享
  查看: https://www.cc-chat.dev/posts/42
```

## 🚀 快速开始

### 安装

```bash
npm install -g @optima-chat/cc-chat@latest
```

### 使用

**方式一：自然语言（推荐）**

直接对 Claude 说：
- "帮我登录 CC Chat，用户名是 yourname"
- "帮我发个帖子分享我的 MCP 配置"
- "看看论坛有什么新帖子"
- "搜索关于 MCP 的帖子"
- "查看用户 xxx 的主页"

Claude 会自动调用命令完成操作 ✨

**方式二：直接使用命令**

```bash
# 登录
cc-chat login --username "你的用户名"

# 发帖
cc-chat post --title "标题" --content "内容" --tags "技巧,MCP"

# 浏览帖子（支持热度排序）
cc-chat browse --sort hot --limit 20

# 搜索
cc-chat search "MCP" --limit 10

# 查看用户主页
cc-chat user <username> --comments

# 评论和回复
cc-chat comment <post-id> --text "评论内容"
cc-chat reply <comment-id> --post-id <post-id> --text "回复内容"

# 投票
cc-chat upvote <post-id>
cc-chat downvote <post-id>

# 收藏
cc-chat save <post-id>
cc-chat saved

# 通知
cc-chat notifications --unread
cc-chat mark-read <notification-id>
```

## 📋 完整命令列表

| 命令 | 说明 | 示例 |
|------|------|------|
| `login` | 登录（GitHub OAuth） | `cc-chat login --username "用户名"` |
| `post` | 发帖 | `cc-chat post --title "标题" --content "内容" --tags "技巧,MCP"` |
| `browse` | 浏览帖子 | `cc-chat browse --sort hot --tag MCP --limit 20` |
| `search` | 搜索帖子 | `cc-chat search "关键词" --limit 10` |
| `tags` | 查看所有标签 | `cc-chat tags` |
| `user` | 查看用户主页 | `cc-chat user <username> --comments` |
| `comment` | 评论帖子 | `cc-chat comment <post-id> --text "评论"` |
| `reply` | 回复评论 | `cc-chat reply <comment-id> --post-id <post-id> --text "回复"` |
| `upvote` | 点赞帖子 | `cc-chat upvote <post-id>` |
| `downvote` | 踩帖子 | `cc-chat downvote <post-id>` |
| `upvote-comment` | 点赞评论 | `cc-chat upvote-comment <comment-id>` |
| `downvote-comment` | 踩评论 | `cc-chat downvote-comment <comment-id>` |
| `save` | 收藏帖子 | `cc-chat save <post-id>` |
| `unsave` | 取消收藏 | `cc-chat unsave <post-id>` |
| `saved` | 查看收藏列表 | `cc-chat saved --limit 20` |
| `notifications` | 查看通知 | `cc-chat notifications --unread` |
| `mark-read` | 标记已读 | `cc-chat mark-read <notification-id>` |
| `mark-read-all` | 全部标记已读 | `cc-chat mark-read-all` |
| `delete-post` | 删除帖子 | `cc-chat delete-post <post-id>` |
| `delete-comment` | 删除评论 | `cc-chat delete-comment <comment-id>` |

## 💡 适合分享什么？

- 💡 **使用技巧** - Claude Code 的使用心得和技巧
- 🔧 **MCP 配置** - Model Context Protocol 插件和配置
- 🎉 **项目展示** - 用 Claude Code 做的有趣项目
- ❓ **问题求助** - 遇到的问题和 bug
- 📖 **教程文章** - 深度教程和最佳实践
- 🐛 **Bug 报告** - Claude Code 的问题反馈
- 💭 **想法建议** - 功能建议和讨论

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    用户交互层                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   Claude     │  │   Web UI     │  │     CLI      ││
│  │   (自然语言)  │  │  (Next.js)   │  │ (TypeScript) ││
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘│
└─────────┼──────────────────┼──────────────────┼────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Fastify API   │
                    │  (TypeScript)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
         │PostgreSQL│   │  Redis  │   │ Reddit  │
         │  (数据)  │   │ (缓存)  │   │  (内容)  │
         └─────────┘   └─────────┘   └─────────┘
```

**技术栈：**
- **CLI**: TypeScript + Commander.js + Chalk
- **Web**: Next.js 15 + React 19 + TailwindCSS
- **API**: Fastify + PostgreSQL + Redis
- **认证**: GitHub OAuth
- **部署**: Railway (API) + Vercel (Web)
- **自动化**: GitHub Actions

## 🌐 在线访问

- 🌐 **网站**: https://www.cc-chat.dev
- 🚀 **API**: https://api.cc-chat.dev
- 📦 **npm**: https://www.npmjs.com/package/@optima-chat/cc-chat

## 🛠️ 本地开发

### 克隆仓库

```bash
git clone https://github.com/Optima-Chat/cc-chat.git
cd cc-chat
```

### 启动后端（Docker Compose）

```bash
docker compose up -d
```

### 开发 CLI

```bash
cd cli
npm install
npm run dev
```

### 开发 Web

```bash
cd web
npm install
npm run dev
```

详见：
- [API 开发文档](./api/README.md)
- [CLI 开发文档](./cli/README.md)
- [Web 开发文档](./web/README.md)
- [技术方案](./docs/tech-spec.md)

## 📦 部署

### 后端 API
- ✅ **Railway**（推荐）- 一键部署，$5/月免费额度
- ✅ **Render** - 免费部署
- ✅ **VPS** - 自托管部署

详见 [部署指南](./docs/deployment.md)

### Web 前端
- ✅ **Vercel**（推荐）- Next.js 官方平台，自动部署
- 推送到 main 分支即可自动部署

详见 [Web 部署文档](./web/README.md)

## 🗺️ 开发路线图

- [x] **Phase 1: 核心功能**
  - [x] CLI 工具
  - [x] 发帖、评论、回复
  - [x] 投票系统
  - [x] 热度排序（Hot/New/Top/Comments）
  - [x] 标签系统
  - [x] 搜索功能

- [x] **Phase 2: 社区功能**
  - [x] 用户主页
  - [x] 收藏功能
  - [x] 通知系统（@提及、回复）
  - [x] 嵌套评论
  - [x] 代码高亮

- [x] **Phase 3: 内容生态**
  - [x] Reddit 自动同步
  - [x] 智能翻译（OpenAI API）
  - [x] 去重机制

- [ ] **Phase 4: 增强功能**（规划中）
  - [ ] 用户设置（头像、简介）
  - [ ] 举报机制
  - [ ] 管理后台
  - [ ] 邮件通知
  - [ ] RSS 订阅

详见 [产品路线图](./docs/product-roadmap.md)

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 参与方式

- 🐛 **报告 Bug** - [提交 Issue](https://github.com/Optima-Chat/cc-chat/issues/new)
- 💡 **功能建议** - [发起讨论](https://github.com/Optima-Chat/cc-chat/discussions)
- 📝 **改进文档** - 完善 README 和文档
- 💻 **贡献代码** - 提交 Pull Request

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交代码 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

详见 [贡献指南](./CONTRIBUTING.md)

## 📄 开源协议

[MIT License](./LICENSE)

## 🙏 致谢

- [Claude Code](https://claude.ai/code) - 强大的 AI 编程助手
- [Anthropic](https://www.anthropic.com/) - Claude 背后的公司
- 所有贡献者和社区成员

## 📮 联系我们

- 网站：https://www.cc-chat.dev
- GitHub：https://github.com/Optima-Chat/cc-chat
- Issue：https://github.com/Optima-Chat/cc-chat/issues

---

<div align="center">

**🌟 如果觉得有用，欢迎 Star！**

Made with ❤️ by the CC Chat community

</div>

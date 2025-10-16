# CC Chat 技术方案

## 架构

```
┌──────────────────┐
│   Claude Code    │
│                  │
│  读取全局配置     │
│  ~/.claude/      │
│  CLAUDE.md       │
└────────┬─────────┘
         │ 调用 CLI
         ↓
┌──────────────────┐
│  cc-chat CLI    │
│  (npx)           │
│                  │
│  - post          │
│  - browse        │
│  - comment       │
└────────┬─────────┘
         │ REST API
         ↓
┌──────────────────┐
│   后端服务        │
│                  │
│  Node.js/FastAPI │
│  PostgreSQL      │
│  Redis           │
└──────────────────┘
```

## 核心流程

### 首次使用
```bash
npx cc-chat@latest setup-claude
```
→ 自动写入 `~/.claude/CLAUDE.md`
→ Claude Code 自动识别命令

### 用户发帖
```
用户: "帮我发个帖子介绍我的MCP配置"
  ↓
Claude 读取 CLAUDE.md，知道如何使用
  ↓
Claude 调用: npx cc-chat post --title "..." --content "..."
  ↓
CLI → API → 发布成功
```

## 技术栈

**CLI**
- Commander.js
- Axios
- chalk (美化输出)

**后端**
- Node.js + Fastify
- PostgreSQL (用户/帖子)
- Redis (缓存/会话)

**部署**
- Docker Compose
- Vercel/Railway

## 核心功能

### CLI 命令
```bash
cc-chat setup-claude     # 配置 CLAUDE.md
cc-chat post             # 发帖（交互式）
cc-chat browse           # 浏览帖子
cc-chat comment <id>     # 评论
cc-chat login            # 登录
```

### CLAUDE.md 内容
```markdown
## CC Chat
- 发帖: npx cc-chat post --title "标题" --content "内容"
- 浏览: npx cc-chat browse --limit 10
- 评论: npx cc-chat comment <post-id> --text "评论"
- 登录: npx cc-chat login
```

### API 端点
```
POST   /api/posts          # 创建帖子
GET    /api/posts          # 列表
GET    /api/posts/:id      # 详情
POST   /api/posts/:id/comments
POST   /api/auth/login     # GitHub OAuth
```

## 数据模型

```sql
users (id, github_id, username, created_at)
posts (id, user_id, title, content, created_at)
comments (id, post_id, user_id, content, created_at)
```

## 实现优先级

1. **MVP**：CLI + 简单后端 + setup-claude 命令
2. **V2**：Web 界面、搜索、分类
3. **V3**：代码高亮、智能摘要、通知

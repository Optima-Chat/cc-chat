# CC Chat CLI

Claude Code 用户的中文聊天社区命令行工具

## 快速开始

### 安装

全局安装（推荐）：
```bash
npm install -g @optima-chat/cc-chat@latest
```

或直接使用（无需安装）：
```bash
npx @optima-chat/cc-chat@latest
```

### 首次配置

全局安装后：
```bash
cc-chat setup-claude
```

或使用 npx：
```bash
npx @optima-chat/cc-chat@latest setup-claude
```

这会在 `~/.claude/CLAUDE.md` 中添加配置，让 Claude Code 自动识别命令。

### 登录

交互式登录：
```bash
cc-chat login
```

非交互式登录（推荐用于 Claude Code）：
```bash
cc-chat login --username "你的用户名"
```

### 在 Claude Code 中使用

配置后，直接对 Claude 说：

- "帮我登录 CC Chat，用户名是 verypro"
- "帮我发个帖子分享我的 MCP 配置"
- "看看论坛有什么新帖子"
- "帮我回复第一个帖子"

Claude 会自动调用相应命令。

## 命令参考

### 登录

交互式登录：
```bash
cc-chat login
```

非交互式登录：
```bash
cc-chat login --username "你的用户名"
```

**提示**：如果想更换用户名，重新登录即可覆盖之前的账号。

### 发帖

交互式发帖：
```bash
cc-chat post
```

非交互式发帖：
```bash
cc-chat post --title "标题" --content "内容"
```

### 浏览帖子

浏览最新 10 个帖子：
```bash
cc-chat browse
```

指定数量：
```bash
cc-chat browse --limit 20
```

### 评论（开发中）

```bash
cc-chat comment <post-id> --text "评论内容"
```

## 更新

更新到最新版本：
```bash
npm update -g @optima-chat/cc-chat
```

查看当前版本：
```bash
cc-chat --version
```

更新后会自动更新 CLAUDE.md 配置。

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

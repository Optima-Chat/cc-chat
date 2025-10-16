# CC Chat CLI

Claude Code 用户的中文聊天社区命令行工具

## 快速开始

### 安装

```bash
npm install -g @optima-chat/cc-chat@latest
```

### 使用

直接对 Claude 说：
- "帮我登录 CC Chat，用户名是 yourname"
- "帮我发个帖子分享我的 MCP 配置"
- "看看论坛有什么新帖子"

Claude 会自动调用相应命令 ✨

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

### 配置

手动配置 Claude Code 集成（通常不需要，安装时会自动配置）：
```bash
cc-chat setup-claude
```

强制更新配置：
```bash
cc-chat setup-claude --force
```

### 更新

更新到最新版本：
```bash
npm update -g @optima-chat/cc-chat
```

查看当前版本：
```bash
cc-chat --version
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

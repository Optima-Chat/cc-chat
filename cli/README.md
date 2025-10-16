# CC Chat CLI

Claude Code 用户的中文聊天社区命令行工具

## 安装

```bash
npm install -g cc-chat
```

或直接使用：

```bash
npx cc-chat@latest
```

## 使用

### 首次配置

```bash
npx cc-chat setup-claude
```

这会在 `~/.claude/CLAUDE.md` 中添加配置，让 Claude Code 自动识别命令。

### 命令

```bash
# 登录
npx cc-chat login

# 发帖
npx cc-chat post

# 或直接指定内容
npx cc-chat post --title "标题" --content "内容"

# 浏览帖子
npx cc-chat browse

# 评论
npx cc-chat comment <post-id> --text "评论内容"
```

### 在 Claude Code 中使用

配置后，直接对 Claude 说：

- "帮我发个帖子分享我的 MCP 配置"
- "看看论坛有什么新帖子"
- "帮我回复第一个帖子"

Claude 会自动调用相应命令。

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

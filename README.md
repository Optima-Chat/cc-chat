# CC Chat

Claude Code 用户的中文聊天社区 - 直接在终端发帖交流

## 快速开始

```bash
# 首次使用，配置 Claude Code 集成
npx cc-chat@latest setup-claude

# 之后就可以直接对 Claude 说：
"帮我发个帖子分享我的 MCP 配置"
"看看论坛有什么新帖子"
"帮我回复第一个帖子"
```

Claude 会自动调用命令完成操作 ✨

## 为什么用 CC Chat？

- 🚀 **零配置** - 一行命令，Claude 自动识别
- 💬 **自然交互** - 用自然语言发帖，无需记命令
- 🎯 **专注内容** - 不离开终端，不打断思路
- 🇨🇳 **中文友好** - 专为中文 Claude Code 用户设计

## 手动使用

如果你想直接使用命令：

```bash
# 发帖
npx cc-chat post --title "标题" --content "内容"

# 浏览
npx cc-chat browse

# 评论
npx cc-chat comment <post-id> --text "评论内容"

# 登录（使用 GitHub）
npx cc-chat login
```

## 适合分享什么？

- 💡 Claude Code 使用技巧
- 🔧 MCP 配置和插件
- 🐛 问题求助
- 🎉 项目展示
- 💬 使用心得

## 技术栈

CLI + Node.js + PostgreSQL + Docker Compose

详见 [技术方案](./docs/tech-spec.md)

## 开发状态

🚧 MVP 开发中

## License

MIT

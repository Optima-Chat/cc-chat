# 贡献指南

感谢你考虑为 CC Chat 做贡献！我们欢迎所有形式的贡献，无论是修复bug、添加功能、改进文档还是提出建议。

## 🤝 行为准则

请阅读并遵守我们的行为准则，确保社区友好和包容。

## 🐛 报告 Bug

在提交 bug 报告前，请先：
1. 搜索现有的 [Issues](https://github.com/Optima-Chat/cc-chat/issues) 确认问题未被报告
2. 更新到最新版本 `npm update -g @optima-chat/cc-chat`

### Bug 报告模板

```markdown
**描述问题**
简短描述遇到的问题

**复现步骤**
1. 执行命令 '...'
2. 点击 '....'
3. 看到错误

**期望行为**
描述你期望发生什么

**实际行为**
描述实际发生了什么

**环境信息**
- 操作系统: [如 macOS 14.0]
- Node.js 版本: [如 v20.0.0]
- CC Chat 版本: [如 0.13.0]
- Claude Code 版本: [如果相关]

**截图/日志**
如果可能，附上截图或错误日志
```

## 💡 功能建议

我们欢迎新功能建议！请先：
1. 搜索 [Discussions](https://github.com/Optima-Chat/cc-chat/discussions) 查看是否有类似建议
2. 开启新的 Discussion 描述你的想法

### 建议模板

```markdown
**问题背景**
描述你想解决的问题或痛点

**建议方案**
描述你建议的解决方案

**替代方案**
有考虑过其他方案吗？

**额外信息**
其他相关信息或参考资料
```

## 💻 贡献代码

### 开发环境设置

1. Fork 仓库到你的 GitHub 账号

2. 克隆 Fork 的仓库
```bash
git clone https://github.com/YOUR_USERNAME/cc-chat.git
cd cc-chat
```

3. 添加上游仓库
```bash
git remote add upstream https://github.com/Optima-Chat/cc-chat.git
```

4. 安装依赖
```bash
# API
cd api && npm install && cd ..

# CLI
cd cli && npm install && cd ..

# Web
cd web && npm install && cd ..
```

5. 启动开发环境
```bash
# 启动数据库（Docker Compose）
docker compose up -d

# 启动 API (端口 3001)
cd api && npm run dev

# 启动 Web (端口 3000)
cd web && npm run dev

# 开发 CLI
cd cli && npm run dev
```

### 开发流程

1. **创建分支**
```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/bug-description
```

分支命名规范：
- `feature/` - 新功能
- `fix/` - Bug 修复
- `docs/` - 文档更新
- `refactor/` - 代码重构
- `test/` - 测试相关

2. **编写代码**
- 遵循现有代码风格
- 添加必要的注释
- 确保代码通过 TypeScript 检查

3. **测试**
```bash
# API 测试
cd api && npm run build

# CLI 测试
cd cli && npm run build && npm link

# Web 测试
cd web && npm run build
```

4. **提交代码**
```bash
git add .
git commit -m "feat: add amazing feature"
```

提交信息规范（遵循 [Conventional Commits](https://www.conventionalcommits.org/)）：
- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `style:` - 代码格式（不影响功能）
- `refactor:` - 重构
- `test:` - 测试相关
- `chore:` - 构建/工具链相关

示例：
```
feat: add user profile page
fix: resolve login token expiry issue
docs: update CLI installation guide
```

5. **推送到 Fork**
```bash
git push origin feature/your-feature-name
```

6. **创建 Pull Request**
- 访问你的 Fork 仓库
- 点击 "New Pull Request"
- 填写 PR 描述（见下方模板）
- 提交 PR

### Pull Request 模板

```markdown
## 描述
简要描述这个 PR 做了什么

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 测试相关

## 相关 Issue
Fixes #(issue 编号)

## 测试
描述你如何测试这些变更
- [ ] 本地测试通过
- [ ] 构建成功

## 截图（如果适用）
添加截图帮助说明变更

## 检查清单
- [ ] 代码遵循项目风格
- [ ] 已自我审查代码
- [ ] 添加了必要的注释
- [ ] 文档已更新
- [ ] 没有新的警告
- [ ] 测试通过
```

## 📝 改进文档

文档改进也是重要的贡献！你可以：
- 修正拼写/语法错误
- 改进说明和示例
- 添加缺失的文档
- 翻译文档

文档位置：
- 主要文档: `README.md`
- API 文档: `api/README.md`
- CLI 文档: `cli/README.md`
- Web 文档: `web/README.md`
- 技术文档: `docs/` 目录

## 🎨 代码风格

### TypeScript 风格
- 使用 TypeScript strict 模式
- 为函数参数和返回值添加类型
- 避免使用 `any`
- 使用有意义的变量名

### 命名规范
- 文件名: `kebab-case.ts`
- 组件: `PascalCase`
- 函数/变量: `camelCase`
- 常量: `UPPER_SNAKE_CASE`
- 接口: `PascalCase` (无 `I` 前缀)

### 代码组织
- 每个文件单一职责
- 适当使用注释说明复杂逻辑
- 导出清晰的 API

## 🧪 测试

目前项目暂无完整测试覆盖，欢迎贡献测试相关代码！

测试相关的贡献特别欢迎：
- 单元测试
- 集成测试
- E2E 测试

## 📦 发布流程

CC Chat 使用 **自动化发布**，发布由维护者完成：

```bash
# 1. 更新版本号（会自动创建 git tag）
cd cli
npm version patch  # 或 minor、major

# 2. 推送代码和标签
git push && git push --tags

# 3. 等待 GitHub Actions 自动完成：
#    - 发布到 npm
#    - 创建 GitHub Release
#    - 生成 changelog
```

详细步骤和配置请查看 [发布指南](./docs/release-guide.md)

## 💬 交流讨论

- **GitHub Discussions**: 功能建议、讨论
- **GitHub Issues**: Bug 报告、任务跟踪
- **CC Chat 社区**: https://www.cc-chat.dev

## 🙏 致谢

感谢所有贡献者！

你的贡献将在 README 中的致谢部分展示。

## ❓ 常见问题

### 如何同步上游更新？
```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 如何撤销本地修改？
```bash
git checkout -- <file>
# 或撤销所有
git reset --hard HEAD
```

### PR 被拒绝了怎么办？
别气馁！维护者会说明原因。根据反馈修改后可以重新提交。

### 我能帮助什么？
查看标有 `good first issue` 或 `help wanted` 的 Issues。

---

再次感谢你的贡献！有任何问题欢迎随时提问。

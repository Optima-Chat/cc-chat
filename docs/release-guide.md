# 发布指南

## 🚀 自动发布流程

CC Chat 使用 GitHub Actions 自动化发布流程。推送版本标签后，会自动：

1. 创建 GitHub Release
2. 发布到 npm
3. 生成 changelog

## 📋 发布步骤

### 1. 确保代码已提交

```bash
git status  # 确保工作区干净
```

### 2. 更新版本号

使用 `npm version` 命令，它会自动：
- 更新 `package.json` 中的版本号
- 创建 git commit
- 创建 git tag

```bash
cd cli

# Patch 版本（bug 修复）: 0.13.2 -> 0.13.3
npm version patch

# Minor 版本（新功能）: 0.13.3 -> 0.14.0
npm version minor

# Major 版本（破坏性更新）: 0.14.0 -> 1.0.0
npm version major
```

### 3. 推送代码和标签

```bash
# 推送 commit 和 tag
git push && git push --tags
```

### 4. 等待自动发布

GitHub Actions 会自动：
1. 检测到新 tag
2. 运行测试和构建
3. 发布到 npm
4. 创建 GitHub Release（包含 changelog）

查看进度：https://github.com/Optima-Chat/cc-chat/actions

### 5. 验证发布

```bash
# 检查 npm
npm view @optima-chat/cc-chat version

# 测试安装
npm install -g @optima-chat/cc-chat@latest
cc-chat --version
```

## 🔧 配置

### 需要的 GitHub Secrets

在仓库设置中添加：
- `NPM_TOKEN` - npm 发布令牌

### 获取 npm Token

1. 登录 https://www.npmjs.com
2. 点击头像 → **Access Tokens**
3. 点击 **Generate New Token** → **Classic Token**
4. 选择 **Automation** 类型
5. 复制 token 并添加到 GitHub Secrets

## 📝 版本规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **Patch (0.0.X)** - Bug 修复、文档更新、小改进
- **Minor (0.X.0)** - 新功能、向后兼容
- **Major (X.0.0)** - 破坏性更新、API 变更

## 🎯 提交规范

建议使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 添加用户主页功能
fix: 修复登录 token 过期问题
docs: 更新 README
chore: 更新依赖
```

这样可以自动生成更清晰的 changelog。

## ⚠️ 注意事项

1. **npm 发布失败** - 检查 NPM_TOKEN 是否正确
2. **版本冲突** - 确保版本号未被使用
3. **构建失败** - 本地先运行 `npm run build` 测试
4. **tag 已存在** - 删除本地和远程 tag 后重试：
   ```bash
   git tag -d v0.13.3
   git push origin :refs/tags/v0.13.3
   ```

## 🔙 回滚发布

如果发布有问题：

```bash
# npm 废弃版本（不删除）
npm deprecate @optima-chat/cc-chat@0.13.3 "此版本有问题，请使用 0.13.4"

# 发布修复版本
cd cli
npm version patch
git push && git push --tags
```

## 📊 发布检查清单

- [ ] 所有测试通过
- [ ] 本地构建成功 (`npm run build`)
- [ ] 更新了相关文档
- [ ] 版本号符合语义化版本规范
- [ ] commit message 清晰明确
- [ ] 推送 tag 到 GitHub
- [ ] GitHub Actions 运行成功
- [ ] npm 包已发布
- [ ] GitHub Release 已创建
- [ ] 本地测试新版本

## 💡 最佳实践

1. **小步快跑** - 频繁发布小版本，而不是一次大更新
2. **详细的 commit** - 清晰的 commit message 让 changelog 更有用
3. **测试后发布** - 本地测试通过再发布
4. **告知用户** - 在社区发帖告知重大更新

## 🆘 获取帮助

遇到问题？
- 查看 [GitHub Actions 日志](https://github.com/Optima-Chat/cc-chat/actions)
- 提交 [Issue](https://github.com/Optima-Chat/cc-chat/issues)

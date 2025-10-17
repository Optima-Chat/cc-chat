import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

const CLAUDE_MD_CONTENT = `

## CC Chat
CC Chat 是 Claude Code 用户的中文聊天社区。使用以下命令与社区互动：

安装：\`npm install -g @optima-chat/cc-chat@latest\`

命令：
- 登录: \`cc-chat login\` (使用 GitHub 账号登录)
- 发帖: \`cc-chat post --title "标题" --content "内容"\`
- 浏览帖子: \`cc-chat browse --limit 10\`
- 搜索帖子: \`cc-chat search "关键词" --limit 10\`
- 评论: \`cc-chat comment <post-id> --text "评论内容"\`
- 投票: \`cc-chat upvote <post-id>\` 或 \`cc-chat downvote <post-id>\`

**重要**：首次发帖前需要先登录。运行 \`cc-chat login\` 后会自动打开浏览器，使用 GitHub 账号授权即可。

也可以直接对我说："帮我发个帖子分享我的 MCP 配置"，我会自动调用相应命令。
`;

interface SetupOptions {
  force?: boolean;
}

export async function setupClaude(options: SetupOptions = {}) {
  try {
    const claudeDir = path.join(homedir(), '.claude');
    const claudeMdPath = path.join(claudeDir, 'CLAUDE.md');

    // 确保 .claude 目录存在
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
      console.log(chalk.green('✓ 创建 ~/.claude 目录'));
    }

    // 检查 CLAUDE.md 是否已存在
    let existingContent = '';
    if (fs.existsSync(claudeMdPath)) {
      existingContent = fs.readFileSync(claudeMdPath, 'utf-8');

      // 检查是否已经配置过
      if (existingContent.includes('## CC Chat')) {
        if (!options.force) {
          console.log(chalk.yellow('⚠ CLAUDE.md 中已存在 CC Chat 配置'));
          console.log(chalk.blue('ℹ 位置: ' + claudeMdPath));
          console.log(chalk.gray('ℹ 使用 --force 强制更新配置'));
          return;
        }

        // 删除旧的 CC Chat 配置
        if (!process.env.npm_lifecycle_event) {
          console.log(chalk.blue('🔄 检测到旧配置，正在更新...'));
        }

        // 找到 ## CC Chat 开始的位置
        const ccChatStart = existingContent.indexOf('## CC Chat');
        if (ccChatStart !== -1) {
          // 找到下一个 ## 标题或文件结尾
          let ccChatEnd = existingContent.indexOf('\n## ', ccChatStart + 1);
          if (ccChatEnd === -1) {
            ccChatEnd = existingContent.length;
          }

          // 删除旧配置（包含前面的空行）
          let trimStart = ccChatStart;
          while (trimStart > 0 && existingContent[trimStart - 1] === '\n') {
            trimStart--;
          }

          existingContent = existingContent.substring(0, trimStart) + existingContent.substring(ccChatEnd);

          // 写回删除后的内容
          fs.writeFileSync(claudeMdPath, existingContent, 'utf-8');
        }
      }
    }

    // 追加新内容
    fs.appendFileSync(claudeMdPath, CLAUDE_MD_CONTENT, 'utf-8');

    console.log(chalk.green('✓ 已配置 Claude Code 集成'));
    console.log(chalk.blue('ℹ 配置文件: ' + claudeMdPath));
    console.log();
    console.log(chalk.cyan('现在你可以直接对 Claude 说：'));
    console.log(chalk.white('  "帮我发个帖子介绍我的项目"'));
    console.log(chalk.white('  "看看论坛有什么新帖子"'));
    console.log();
    console.log(chalk.gray('Claude 会自动识别并使用 cc-chat 命令'));

  } catch (error) {
    console.error(chalk.red('✗ 配置失败:'), error);
    process.exit(1);
  }
}

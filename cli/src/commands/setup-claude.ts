import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

const CLAUDE_MD_CONTENT = `

## CC Chat
CC Chat 是 Claude Code 用户的中文聊天社区。使用以下命令与社区互动：

- 发帖: \`npx cc-chat post --title "标题" --content "内容"\`
- 浏览帖子: \`npx cc-chat browse --limit 10\`
- 评论: \`npx cc-chat comment <post-id> --text "评论内容"\`
- 登录: \`npx cc-chat login\`

也可以直接对我说："帮我发个帖子分享我的 MCP 配置"，我会自动调用相应命令。
`;

export async function setupClaude() {
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
        console.log(chalk.yellow('⚠ CLAUDE.md 中已存在 CC Chat 配置'));
        console.log(chalk.blue('ℹ 位置: ' + claudeMdPath));
        return;
      }
    }

    // 追加内容
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

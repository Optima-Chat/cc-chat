#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { setupClaude } from './commands/setup-claude.js';
import { post } from './commands/post.js';
import { browse } from './commands/browse.js';
import { login } from './commands/login.js';

const program = new Command();

program
  .name('cc-chat')
  .description('Claude Code 用户的中文聊天社区')
  .version('0.4.3');

program
  .command('setup-claude')
  .description('配置 Claude Code 集成，写入 ~/.claude/CLAUDE.md')
  .option('-f, --force', '强制更新配置（覆盖旧配置）')
  .action(setupClaude);

program
  .command('post')
  .description('发布新帖子')
  .option('-t, --title <title>', '帖子标题')
  .option('-c, --content <content>', '帖子内容')
  .action(post);

program
  .command('browse')
  .description('浏览帖子列表')
  .option('-l, --limit <number>', '显示数量', '10')
  .action(browse);

program
  .command('comment <post-id>')
  .description('评论帖子')
  .option('-t, --text <text>', '评论内容')
  .action((postId, options) => {
    console.log(chalk.yellow('comment 命令开发中...'));
  });

program
  .command('login')
  .description('登录 CC Chat')
  .option('-u, --username <username>', '用户名（可选，不提供则交互式输入）')
  .action(login);

program.parse();

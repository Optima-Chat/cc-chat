#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { setupClaude } from './commands/setup-claude.js';
import { post } from './commands/post.js';
import { browse } from './commands/browse.js';
import { search } from './commands/search.js';
import { login } from './commands/login.js';
import { comment } from './commands/comment.js';
import { reply } from './commands/reply.js';
import { vote, voteComment } from './commands/vote.js';
import { deletePost, deleteComment } from './commands/delete.js';
import { notifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from './commands/notifications.js';

const program = new Command();

program
  .name('cc-chat')
  .description('Claude Code 用户的中文聊天社区')
  .version('0.11.0');

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
  .command('search [query]')
  .description('搜索帖子')
  .option('-l, --limit <number>', '显示数量', '10')
  .action((query, options) => search({ query, ...options }));

program
  .command('comment <post-id>')
  .description('评论帖子')
  .option('-t, --text <text>', '评论内容')
  .action(comment);

program
  .command('reply <comment-id>')
  .description('回复评论')
  .option('-t, --text <text>', '回复内容')
  .option('-p, --post-id <post-id>', '帖子 ID')
  .action(reply);

program
  .command('upvote <post-id>')
  .description('给帖子点赞')
  .action((postId) => vote(postId, 1));

program
  .command('downvote <post-id>')
  .description('给帖子踩')
  .action((postId) => vote(postId, -1));

program
  .command('upvote-comment <comment-id>')
  .description('给评论点赞')
  .action((commentId) => voteComment(commentId, 1));

program
  .command('downvote-comment <comment-id>')
  .description('给评论踩')
  .action((commentId) => voteComment(commentId, -1));

program
  .command('delete-post <post-id>')
  .description('删除帖子')
  .option('-y, --yes', '跳过确认提示')
  .action(deletePost);

program
  .command('delete-comment <comment-id>')
  .description('删除评论')
  .option('-y, --yes', '跳过确认提示')
  .action(deleteComment);

program
  .command('notifications')
  .description('查看通知')
  .option('--unread', '仅显示未读通知')
  .option('-l, --limit <number>', '显示数量', '20')
  .action(notifications);

program
  .command('unread-count')
  .description('查看未读通知数量')
  .action(getUnreadCount);

program
  .command('mark-read <notification-id>')
  .description('标记通知为已读')
  .action(markNotificationRead);

program
  .command('mark-read-all')
  .description('标记所有通知为已读')
  .action(markAllNotificationsRead);

program
  .command('login')
  .description('登录 CC Chat')
  .option('-u, --username <username>', '用户名（可选，不提供则交互式输入）')
  .action(login);

program.parse();

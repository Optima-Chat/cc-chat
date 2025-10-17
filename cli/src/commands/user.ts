import chalk from 'chalk';
import { apiClient } from '../api/client.js';

interface UserOptions {
  posts?: boolean;
  comments?: boolean;
  limit?: string;
}

export async function viewUser(username: string, options: UserOptions = {}) {
  try {
    console.log(chalk.blue(`正在加载用户 ${username} 的信息...`));

    // 获取用户信息
    const user = await apiClient.getUser(username);

    // 显示用户信息
    console.log(chalk.white('\n' + '='.repeat(60)));
    console.log(chalk.bold.cyan(`\n👤 ${user.username}`));
    console.log(chalk.gray(`加入于 ${formatDate(user.created_at)}`));
    console.log(chalk.gray(`\nhttps://www.cc-chat.dev/users/${user.username}`));

    // 显示统计数据
    console.log(chalk.white('\n统计数据:'));
    console.log(chalk.gray(`  📝 帖子: ${user.stats.post_count}`));
    console.log(chalk.gray(`  💬 评论: ${user.stats.comment_count}`));
    console.log(chalk.gray(`  ⭐ 获得投票: ${user.stats.total_votes}`));

    const limit = options.limit ? parseInt(options.limit, 10) : 5;
    const showPosts = options.posts ?? true;
    const showComments = options.comments ?? false;

    // 获取并显示帖子
    if (showPosts && user.stats.post_count > 0) {
      console.log(chalk.white('\n' + '='.repeat(60)));
      console.log(chalk.bold.white(`\n📝 最近的帖子 (显示 ${Math.min(limit, user.stats.post_count)} 篇):\n`));

      const posts = await apiClient.getUserPosts(username, limit);

      posts.forEach((post: any, index: number) => {
        const score = post.upvotes - post.downvotes;
        const scoreColor = score > 0 ? chalk.green : score < 0 ? chalk.red : chalk.gray;

        console.log(`[${index + 1}] ${chalk.bold(post.title)}`);
        console.log(chalk.gray(`    ID: ${post.id} | ${formatPostDate(post.created_at)}`));
        console.log(chalk.gray(`    ${scoreColor(`↑ ${score}`)} | ${post.comment_count} 条评论`));

        // 显示标签
        if (post.tags && post.tags.length > 0) {
          const tagsStr = post.tags.map((tag: any) => `${tag.emoji} ${tag.name}`).join(' ');
          console.log(chalk.gray(`    ${tagsStr}`));
        }

        // 显示内容预览
        const preview = post.content.substring(0, 80).replace(/\n/g, ' ');
        console.log(chalk.gray(`    ${preview}${post.content.length > 80 ? '...' : ''}`));
        console.log();
      });

      console.log(chalk.gray('ℹ 查看详情: cc-chat view <post-id>'));
    }

    // 获取并显示评论
    if (showComments && user.stats.comment_count > 0) {
      console.log(chalk.white('\n' + '='.repeat(60)));
      console.log(chalk.bold.white(`\n💬 最近的评论 (显示 ${Math.min(limit, user.stats.comment_count)} 条):\n`));

      const comments = await apiClient.getUserComments(username, limit);

      comments.forEach((comment: any, index: number) => {
        const score = comment.upvotes - comment.downvotes;
        const scoreColor = score > 0 ? chalk.green : score < 0 ? chalk.red : chalk.gray;

        console.log(`[${index + 1}] ${chalk.blue('评论于:')} ${comment.post_title}`);
        console.log(chalk.gray(`    帖子 ID: ${comment.post_id} | ${formatPostDate(comment.created_at)}`));
        console.log(chalk.gray(`    ${scoreColor(`↑ ${score}`)}`));

        // 显示评论内容
        const preview = comment.content.substring(0, 100).replace(/\n/g, ' ');
        console.log(chalk.gray(`    "${preview}${comment.content.length > 100 ? '...' : ''}"`));
        console.log();
      });

      console.log(chalk.gray('ℹ 查看帖子: cc-chat view <post-id>'));
    }

    console.log(chalk.white('='.repeat(60) + '\n'));

  } catch (error: any) {
    if (error.response?.status === 404) {
      console.error(chalk.red('用户不存在'));
    } else if (error.response) {
      console.error(chalk.red('获取用户信息失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatPostDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '刚刚';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} 天前`;

  return date.toLocaleDateString('zh-CN');
}

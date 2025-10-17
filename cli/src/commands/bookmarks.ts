import chalk from 'chalk';
import { getToken } from '../config.js';
import { apiClient } from '../api/client.js';

interface BookmarksOptions {
  limit?: string;
}

export async function savePost(postId: string) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    console.log(chalk.blue('正在收藏...'));

    await apiClient.bookmarkPost(postId);

    console.log(chalk.green('\n✓ 收藏成功！'));
    console.log(chalk.gray('查看收藏: cc-chat saved'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('收藏失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

export async function unsavePost(postId: string) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    console.log(chalk.blue('正在取消收藏...'));

    await apiClient.unbookmarkPost(postId);

    console.log(chalk.green('\n✓ 已取消收藏'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('取消失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

export async function getSavedPosts(options: BookmarksOptions = {}) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    const limit = options.limit ? parseInt(options.limit, 10) : 20;

    console.log(chalk.blue('📚 正在加载收藏...'));

    const posts = await apiClient.getBookmarks(limit);

    if (posts.length === 0) {
      console.log(chalk.gray('\n暂无收藏'));
      console.log(chalk.gray('使用 cc-chat save <post-id> 收藏帖子'));
      return;
    }

    console.log(chalk.white(`\n共 ${posts.length} 个收藏:\n`));

    posts.forEach((post: any, index: number) => {
      const score = post.upvotes - post.downvotes;
      const scoreColor = score > 0 ? chalk.green : score < 0 ? chalk.red : chalk.gray;

      console.log(`[${index + 1}] ${chalk.bold(post.title)}`);
      console.log(chalk.gray(`    ID: ${post.id} | 作者: ${post.author.username} | 收藏于: ${formatDate(post.bookmarked_at)}`));
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
    console.log(chalk.gray('ℹ 取消收藏: cc-chat unsave <post-id>'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('获取收藏失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '刚刚';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} 天前`;

  return date.toLocaleDateString('zh-CN');
}

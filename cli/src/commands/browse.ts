import chalk from 'chalk';
import { apiClient } from '../api/client.js';

interface BrowseOptions {
  limit?: string;
}

export async function browse(options: BrowseOptions) {
  try {
    const limit = parseInt(options.limit || '10', 10);

    console.log(chalk.cyan('📖 正在加载帖子...\n'));

    const posts = await apiClient.getPosts(limit);

    if (!posts || posts.length === 0) {
      console.log(chalk.yellow('暂无帖子'));
      return;
    }

    console.log(chalk.bold(`共 ${posts.length} 个帖子:\n`));

    posts.forEach((post: any, index: number) => {
      console.log(chalk.cyan(`[${index + 1}] ${post.title}`));
      console.log(chalk.gray(`    ID: ${post.id} | 作者: ${post.author?.username || '未知'} | ${formatDate(post.created_at)}`));

      // 显示摘要
      const preview = post.content.substring(0, 100);
      console.log(chalk.white(`    ${preview}${post.content.length > 100 ? '...' : ''}`));
      console.log();
    });

    console.log(chalk.blue('ℹ 查看详情: npx cc-chat view <post-id>'));
    console.log(chalk.blue('ℹ 评论: npx cc-chat comment <post-id>'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('✗ 加载失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('✗ 网络错误:'), error.message);
      console.log(chalk.yellow('ℹ 提示: 后端服务可能尚未启动'));
    }
    process.exit(1);
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} 分钟前`;
    }
    return `${hours} 小时前`;
  }

  if (days < 7) {
    return `${days} 天前`;
  }

  return date.toLocaleDateString('zh-CN');
}

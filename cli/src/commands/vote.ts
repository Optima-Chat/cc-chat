import chalk from 'chalk';
import { getToken } from '../config.js';
import { apiClient } from '../api/client.js';

export async function vote(postId: string, voteValue: 1 | -1) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    const voteType = voteValue === 1 ? 'upvote' : 'downvote';
    const voteIcon = voteValue === 1 ? '👍' : '👎';

    console.log(chalk.blue(`正在${voteType === 'upvote' ? '点赞' : '踩'}帖子...`));

    const result = await apiClient.votePost(postId, voteValue);

    if (result.message.includes('取消')) {
      console.log(chalk.yellow(`${voteIcon} 已取消投票`));
    } else if (result.message.includes('更新')) {
      console.log(chalk.green(`${voteIcon} 投票已更新`));
    } else {
      console.log(chalk.green(`${voteIcon} ${voteType === 'upvote' ? '点赞' : '踩'}成功！`));
    }

    console.log(chalk.gray(`查看帖子: https://www.cc-chat.dev/posts/${postId}`));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('投票失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

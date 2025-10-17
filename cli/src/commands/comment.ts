import chalk from 'chalk';
import inquirer from 'inquirer';
import { getToken } from '../config.js';
import { apiClient } from '../api/client.js';

interface CommentOptions {
  text?: string;
}

export async function comment(postId: string, options: CommentOptions = {}) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    let commentText = options.text;

    if (!commentText) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'text',
          message: '请输入评论内容:',
          validate: (input) => {
            if (!input.trim()) {
              return '评论内容不能为空';
            }
            return true;
          },
        },
      ]);
      commentText = answers.text;
    }

    if (!commentText || !commentText.trim()) {
      console.error(chalk.red('评论内容不能为空'));
      process.exit(1);
    }

    console.log(chalk.blue('正在发表评论...'));

    const result = await apiClient.createComment(postId, commentText.trim());

    console.log(chalk.green('评论成功!'));
    console.log(chalk.blue(`评论 ID: ${result.id}`));
    console.log(chalk.gray(`查看帖子: https://www.cc-chat.dev/posts/${postId}`));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('评论失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

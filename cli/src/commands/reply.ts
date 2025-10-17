import inquirer from 'inquirer';
import chalk from 'chalk';
import { getToken } from '../config.js';
import { apiClient } from '../api/client.js';

interface ReplyOptions {
  text?: string;
  postId?: string;
}

export async function reply(commentId: string, options: ReplyOptions) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    let { text, postId } = options;

    // 如果没有提供 postId，交互式获取
    if (!postId) {
      const postIdAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'postId',
          message: '帖子 ID:',
          validate: (input: string) => {
            if (!input.trim()) {
              return '帖子 ID 不能为空';
            }
            return true;
          },
        },
      ]);
      postId = postIdAnswer.postId;
    }

    // 如果没有提供文本，交互式获取
    if (!text) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'text',
          message: '回复内容:',
          validate: (input: string) => {
            if (!input.trim()) {
              return '回复内容不能为空';
            }
            return true;
          },
        },
      ]);
      text = answers.text;
    }

    console.log(chalk.blue('正在发表回复...'));

    const result = await apiClient.replyComment(postId!, commentId, text!);

    console.log(chalk.green('\n✓ 回复成功!'));
    console.log(chalk.white(`回复 ID: ${result.id}`));
    console.log(chalk.gray(`查看帖子: https://www.cc-chat.dev/posts/${result.post_id}`));
  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('回复失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

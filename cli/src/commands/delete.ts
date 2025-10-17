import chalk from 'chalk';
import inquirer from 'inquirer';
import { getToken } from '../config.js';
import { apiClient } from '../api/client.js';

export async function deletePost(postId: string, options: { yes?: boolean } = {}) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    // 如果没有 --yes 标志，询问确认
    if (!options.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '确定要删除这个帖子吗？删除后将无法恢复。',
          default: false,
        },
      ]);

      if (!answers.confirm) {
        console.log(chalk.yellow('已取消删除'));
        return;
      }
    }

    console.log(chalk.blue('正在删除帖子...'));

    const result = await apiClient.deletePost(postId);

    console.log(chalk.green('\n✓ 帖子已删除'));
    console.log(chalk.gray(result.message || '删除成功'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('删除失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

export async function deleteComment(commentId: string, options: { yes?: boolean } = {}) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    // 如果没有 --yes 标志，询问确认
    if (!options.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '确定要删除这条评论吗？删除后将无法恢复。',
          default: false,
        },
      ]);

      if (!answers.confirm) {
        console.log(chalk.yellow('已取消删除'));
        return;
      }
    }

    console.log(chalk.blue('正在删除评论...'));

    const result = await apiClient.deleteComment(commentId);

    console.log(chalk.green('\n✓ 评论已删除'));
    console.log(chalk.gray(result.message || '删除成功'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('删除失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

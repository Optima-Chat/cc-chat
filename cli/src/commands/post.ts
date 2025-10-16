import inquirer from 'inquirer';
import chalk from 'chalk';
import { apiClient } from '../api/client.js';
import { getToken } from '../config.js';

interface PostOptions {
  title?: string;
  content?: string;
}

export async function post(options: PostOptions) {
  try {
    // 检查是否已登录
    const token = getToken();
    if (!token) {
      console.log(chalk.yellow('⚠ 请先登录'));
      console.log(chalk.blue('ℹ 运行: npx cc-chat login'));
      process.exit(1);
    }

    let { title, content } = options;

    // 如果没有提供参数，使用交互式提示
    if (!title || !content) {
      console.log(chalk.cyan('📝 发布新帖子\n'));

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: '帖子标题:',
          default: title,
          validate: (input) => {
            if (!input.trim()) {
              return '标题不能为空';
            }
            return true;
          },
        },
        {
          type: 'editor',
          name: 'content',
          message: '帖子内容 (支持 Markdown):',
          default: content,
          validate: (input) => {
            if (!input.trim()) {
              return '内容不能为空';
            }
            return true;
          },
        },
        {
          type: 'confirm',
          name: 'confirm',
          message: '确认发布?',
          default: true,
        },
      ]);

      if (!answers.confirm) {
        console.log(chalk.gray('已取消'));
        return;
      }

      title = answers.title;
      content = answers.content;
    }

    console.log(chalk.blue('📤 发布中...'));

    const result = await apiClient.createPost(title!, content!);

    console.log(chalk.green('✓ 发布成功!'));
    console.log(chalk.blue(`ℹ 帖子 ID: ${result.id}`));
    console.log(chalk.blue(`ℹ 查看: https://cc-chat.dev/posts/${result.id}`));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('✗ 发布失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('✗ 网络错误:'), error.message);
      console.log(chalk.yellow('ℹ 提示: 后端服务可能尚未启动'));
    }
    process.exit(1);
  }
}

import inquirer from 'inquirer';
import chalk from 'chalk';
import { apiClient } from '../api/client.js';
import { getToken } from '../config.js';

interface PostOptions {
  title?: string;
  content?: string;
  tags?: string;
}

export async function post(options: PostOptions) {
  try {
    // 检查是否已登录
    const token = getToken();
    if (!token) {
      console.log(chalk.yellow('⚠ 请先登录'));
      console.log(chalk.blue('ℹ 运行: cc-chat login --username "你的用户名"'));
      process.exit(1);
    }

    let { title, content, tags } = options;

    // 获取所有可用标签
    const availableTags = await apiClient.getTags();

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
          type: 'checkbox',
          name: 'selectedTags',
          message: '选择标签 (可多选，按空格选择):',
          choices: availableTags.map((tag: any) => ({
            name: `${tag.emoji} ${tag.name} - ${tag.description}`,
            value: tag.name,
          })),
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
      tags = answers.selectedTags.join(',');
    }

    // 解析标签：将标签名转换为 tag_ids
    let tagIds: number[] | undefined = undefined;
    if (tags && tags.trim()) {
      const tagNames = tags.split(',').map(t => t.trim());
      const matchedTagIds = availableTags
        .filter((tag: any) => tagNames.includes(tag.name))
        .map((tag: any) => tag.id);

      if (matchedTagIds.length === 0) {
        console.log(chalk.yellow('⚠ 未找到匹配的标签，将不添加标签'));
      } else {
        tagIds = matchedTagIds;
      }
    }

    console.log(chalk.blue('📤 发布中...'));

    const result = await apiClient.createPost(title!, content!, tagIds);

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

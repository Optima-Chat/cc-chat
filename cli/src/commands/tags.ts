import chalk from 'chalk';
import { apiClient } from '../api/client.js';

export async function listTags() {
  try {
    const tags = await apiClient.getTags();

    if (tags.length === 0) {
      console.log(chalk.gray('\n暂无标签'));
      return;
    }

    console.log(chalk.bold('\n可用标签：\n'));

    tags.forEach((tag: any) => {
      console.log(`${tag.emoji} ${chalk.cyan(tag.name)}`);
      if (tag.description) {
        console.log(chalk.gray(`   ${tag.description}`));
      }
      console.log();
    });

    console.log(chalk.gray('使用方式:'));
    console.log(chalk.gray('  发帖: cc-chat post --title "标题" --content "内容" --tags "技巧,MCP"'));
    console.log(chalk.gray('  筛选: cc-chat browse --tag "技巧"'));
  } catch (error: any) {
    console.error(chalk.red('\n✗ 获取标签失败:'), error.message);
    process.exit(1);
  }
}

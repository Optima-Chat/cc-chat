import chalk from 'chalk';
import inquirer from 'inquirer';
import { setToken } from '../config.js';

export async function login() {
  try {
    console.log(chalk.cyan('🔐 登录 CC Chat\n'));
    console.log(chalk.blue('请访问: https://cc-chat.dev/auth/cli'));
    console.log(chalk.gray('使用 GitHub 账号登录后，你会获得一个访问令牌\n'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'token',
        message: '请粘贴访问令牌:',
        validate: (input) => {
          if (!input.trim()) {
            return '令牌不能为空';
          }
          if (input.length < 20) {
            return '令牌格式不正确';
          }
          return true;
        },
      },
    ]);

    // 保存 token
    setToken(answers.token);

    console.log(chalk.green('✓ 登录成功!'));
    console.log(chalk.blue('ℹ 现在你可以发帖和评论了'));

  } catch (error: any) {
    console.error(chalk.red('✗ 登录失败:'), error.message);
    process.exit(1);
  }
}

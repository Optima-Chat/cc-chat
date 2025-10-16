import chalk from 'chalk';
import inquirer from 'inquirer';
import { setToken } from '../config.js';
import { apiClient } from '../api/client.js';

interface LoginOptions {
  username?: string;
}

export async function login(options: LoginOptions = {}) {
  try {
    console.log(chalk.cyan('🔐 登录 CC Chat\n'));

    let username = options.username;

    // 如果没有提供用户名参数，使用交互式输入
    if (!username) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'username',
          message: '请输入你的用户名:',
          validate: (input) => {
            if (!input.trim()) {
              return '用户名不能为空';
            }
            if (input.length < 2) {
              return '用户名至少 2 个字符';
            }
            return true;
          },
        },
      ]);
      username = answers.username;
    }

    // 验证用户名
    if (!username || username.length < 2) {
      console.error(chalk.red('✗ 用户名至少 2 个字符'));
      process.exit(1);
    }

    console.log(chalk.blue('🔄 正在创建账号...'));

    // 调用简化的登录 API
    const result = await apiClient.login(username);

    // 保存 token
    setToken(result.token);

    console.log(chalk.green('✓ 登录成功!'));
    console.log(chalk.blue(`ℹ 欢迎，${result.user.username}！`));
    console.log(chalk.gray('ℹ 现在你可以发帖和评论了'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('✗ 登录失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('✗ 网络错误:'), error.message);
    }
    process.exit(1);
  }
}

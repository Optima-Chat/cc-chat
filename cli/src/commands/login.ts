import chalk from 'chalk';
import inquirer from 'inquirer';
import { setToken } from '../config.js';
import { apiClient } from '../api/client.js';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface LoginOptions {
  username?: string;
}

// 打开浏览器
async function openBrowser(url: string) {
  const platform = process.platform;
  let command: string;

  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  try {
    await execAsync(command);
  } catch (error) {
    // 静默失败，用户会看到手动访问提示
  }
}

// GitHub Device Flow 登录
async function githubDeviceFlow(): Promise<{ token: string; username: string }> {
  const GITHUB_CLIENT_ID = 'Iv23listyDH5mTlavL8e';

  // 步骤 1: 请求 device code
  console.log(chalk.blue('🔄 正在请求授权...'));

  const deviceCodeResponse = await axios.post(
    'https://github.com/login/device/code',
    {
      client_id: GITHUB_CLIENT_ID,
      scope: 'read:user',
    },
    {
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  const {
    device_code,
    user_code,
    verification_uri,
    expires_in,
    interval,
  } = deviceCodeResponse.data;

  // 步骤 2: 显示用户代码并打开浏览器
  console.log('\n' + chalk.bgBlue.white.bold(` ${user_code} `) + '\n');
  console.log(chalk.cyan(`请访问: ${verification_uri}`));
  console.log(chalk.gray(`并输入上方代码: ${user_code}\n`));
  console.log(chalk.yellow('🔄 等待授权中...\n'));

  // 自动打开浏览器
  openBrowser(verification_uri);

  // 步骤 3: 轮询等待授权
  const pollInterval = (interval || 5) * 1000;
  const expiresAt = Date.now() + expires_in * 1000;

  while (Date.now() < expiresAt) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    try {
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: GITHUB_CLIENT_ID,
          device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        },
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      const { access_token, error } = tokenResponse.data;

      if (error === 'authorization_pending') {
        // 继续等待
        continue;
      } else if (error === 'slow_down') {
        // 减慢轮询速度
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      } else if (error) {
        throw new Error(`GitHub 授权失败: ${error}`);
      }

      if (access_token) {
        // 步骤 4: 使用 access_token 登录我们的后端
        console.log(chalk.green('✓ GitHub 授权成功'));
        console.log(chalk.blue('🔄 正在登录 CC Chat...'));

        const result = await apiClient.githubDeviceLogin(access_token);

        return {
          token: result.token,
          username: result.user.username,
        };
      }
    } catch (error: any) {
      if (error.response?.data?.error === 'authorization_pending') {
        continue;
      }
      throw error;
    }
  }

  throw new Error('授权超时，请重试');
}

export async function login(options: LoginOptions = {}) {
  try {
    console.log(chalk.cyan('🔐 登录 CC Chat\n'));

    const result = await githubDeviceFlow();

    // 保存 token
    setToken(result.token);

    console.log(chalk.green('\n✓ 登录成功!'));
    console.log(chalk.blue(`ℹ 欢迎，${result.username}！`));
    console.log(chalk.gray('ℹ 现在你可以发帖和评论了'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('\n✗ 登录失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('\n✗ 登录失败:'), error.message);
    }
    process.exit(1);
  }
}

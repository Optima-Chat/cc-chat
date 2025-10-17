import chalk from 'chalk';
import { getToken } from '../config.js';
import { apiClient } from '../api/client.js';

interface NotificationsOptions {
  unread?: boolean;
  limit?: string;
}

export async function notifications(options: NotificationsOptions = {}) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    const limit = options.limit ? parseInt(options.limit, 10) : 20;

    console.log(chalk.blue('📬 正在加载通知...'));

    const notifications = await apiClient.getNotifications(limit);

    if (notifications.length === 0) {
      console.log(chalk.gray('\n暂无通知'));
      return;
    }

    // 过滤未读通知
    const displayNotifications = options.unread
      ? notifications.filter((n: any) => !n.is_read)
      : notifications;

    if (displayNotifications.length === 0 && options.unread) {
      console.log(chalk.gray('\n暂无未读通知'));
      return;
    }

    console.log(chalk.white(`\n共 ${displayNotifications.length} 条通知:\n`));

    displayNotifications.forEach((notification: any, index: number) => {
      const icon = notification.is_read ? '📭' : '📬';
      const readStatus = notification.is_read ? chalk.gray('[已读]') : chalk.green('[未读]');

      let message = '';
      switch (notification.type) {
        case 'POST_REPLY':
          message = `${chalk.cyan(notification.actor.username)} 评论了你的帖子 "${notification.post_title}"`;
          break;
        case 'COMMENT_REPLY':
          message = `${chalk.cyan(notification.actor.username)} 回复了你的评论`;
          break;
        case 'MENTION':
          message = `${chalk.cyan(notification.actor.username)} 在评论中提到了你`;
          break;
      }

      const time = formatDate(notification.created_at);

      console.log(`${icon} [${index + 1}] ${readStatus} ${message}`);
      console.log(chalk.gray(`    ID: ${notification.id} | ${time}`));

      if (notification.comment_content) {
        const preview = notification.comment_content.substring(0, 60) + (notification.comment_content.length > 60 ? '...' : '');
        console.log(chalk.gray(`    "${preview}"`));
      }

      console.log(chalk.gray(`    查看: https://www.cc-chat.dev/posts/${notification.post_id}`));
      console.log();
    });

    console.log(chalk.gray('ℹ 标记已读: cc-chat mark-read <notification-id>'));
    console.log(chalk.gray('ℹ 标记全部已读: cc-chat mark-read-all'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('获取通知失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

export async function getUnreadCount() {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    const result = await apiClient.getUnreadNotificationsCount();

    console.log(chalk.white(`\n📬 未读通知数: ${chalk.green(result.count)}`));

    if (result.count > 0) {
      console.log(chalk.gray('\nℹ 查看通知: cc-chat notifications'));
    }

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('获取未读数失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    await apiClient.markNotificationRead(notificationId);

    console.log(chalk.green('\n✓ 已标记为已读'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('标记失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

export async function markAllNotificationsRead() {
  try {
    const token = getToken();
    if (!token) {
      console.error(chalk.red('请先登录'));
      console.log(chalk.gray('运行 cc-chat login 进行登录'));
      process.exit(1);
    }

    await apiClient.markAllNotificationsRead();

    console.log(chalk.green('\n✓ 已标记所有通知为已读'));

  } catch (error: any) {
    if (error.response) {
      console.error(chalk.red('标记失败:'), error.response.data.message || error.message);
    } else {
      console.error(chalk.red('网络错误:'), error.message);
    }
    process.exit(1);
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '刚刚';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} 天前`;

  return date.toLocaleDateString('zh-CN');
}

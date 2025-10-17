import { pool } from '../db.js';

export type NotificationType = 'POST_REPLY' | 'COMMENT_REPLY' | 'MENTION';

interface CreateNotificationParams {
  userId: number;
  actorId: number;
  type: NotificationType;
  postId: number;
  commentId?: number;
}

/**
 * 创建通知
 * @param params 通知参数
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const { userId, actorId, type, postId, commentId } = params;

  // 不给自己发通知
  if (userId === actorId) {
    return;
  }

  try {
    await pool.query(
      `INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, actorId, type, postId, commentId || null]
    );
  } catch (error) {
    console.error('创建通知失败:', error);
    // 不抛出错误，避免影响主流程
  }
}

/**
 * 检测并提取 @mentions
 * @param content 评论内容
 * @returns 被提及的用户名列表
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return [...new Set(mentions)]; // 去重
}

/**
 * 为被 @mention 的用户创建通知
 * @param content 评论内容
 * @param actorId 评论作者 ID
 * @param postId 帖子 ID
 * @param commentId 评论 ID
 */
export async function createMentionNotifications(
  content: string,
  actorId: number,
  postId: number,
  commentId: number
): Promise<void> {
  const mentions = extractMentions(content);

  if (mentions.length === 0) {
    return;
  }

  try {
    // 查找被提及的用户
    const result = await pool.query(
      `SELECT id FROM users WHERE username = ANY($1)`,
      [mentions]
    );

    // 为每个用户创建通知
    for (const user of result.rows) {
      await createNotification({
        userId: user.id,
        actorId,
        type: 'MENTION',
        postId,
        commentId,
      });
    }
  } catch (error) {
    console.error('创建 mention 通知失败:', error);
  }
}

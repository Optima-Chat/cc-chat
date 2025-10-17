import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取当前用户的通知列表
  fastify.get('/', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { limit = '20', offset = '0' } = request.query as { limit?: string; offset?: string };

    try {
      const result = await pool.query(
        `SELECT
          n.id, n.type, n.is_read, n.created_at,
          n.post_id, n.comment_id,
          actor.id as actor_id, actor.username as actor_username, actor.avatar_url as actor_avatar,
          p.title as post_title,
          c.content as comment_content
        FROM notifications n
        LEFT JOIN users actor ON n.actor_id = actor.id
        LEFT JOIN posts p ON n.post_id = p.id
        LEFT JOIN comments c ON n.comment_id = c.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3`,
        [request.user!.id, parseInt(limit, 10), parseInt(offset, 10)]
      );

      const notifications = result.rows.map((row) => ({
        id: row.id,
        type: row.type,
        is_read: row.is_read,
        created_at: row.created_at,
        post_id: row.post_id,
        comment_id: row.comment_id,
        actor: {
          id: row.actor_id,
          username: row.actor_username,
          avatar_url: row.actor_avatar,
        },
        post_title: row.post_title,
        comment_content: row.comment_content ? row.comment_content.substring(0, 100) : null,
      }));

      return notifications;
    } catch (error: any) {
      fastify.log.error('Get notifications error:', error);
      return reply.status(500).send({ message: error.message || '获取通知失败' });
    }
  });

  // 获取未读通知数量
  fastify.get('/unread-count', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
        [request.user!.id]
      );

      return { count: parseInt(result.rows[0].count, 10) };
    } catch (error: any) {
      fastify.log.error('Get unread count error:', error);
      return reply.status(500).send({ message: error.message || '获取未读数失败' });
    }
  });

  // 标记单个通知为已读
  fastify.put('/:id/read', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    try {
      const result = await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, request.user!.id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ message: '通知不存在' });
      }

      return { message: '已标记为已读' };
    } catch (error: any) {
      fastify.log.error('Mark notification read error:', error);
      return reply.status(500).send({ message: error.message || '标记失败' });
    }
  });

  // 标记所有通知为已读
  fastify.put('/read-all', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    try {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
        [request.user!.id]
      );

      return { message: '已标记所有通知为已读' };
    } catch (error: any) {
      fastify.log.error('Mark all notifications read error:', error);
      return reply.status(500).send({ message: error.message || '标记失败' });
    }
  });

  // 删除通知
  fastify.delete('/:id', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    try {
      const result = await pool.query(
        'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, request.user!.id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ message: '通知不存在' });
      }

      return { message: '通知已删除' };
    } catch (error: any) {
      fastify.log.error('Delete notification error:', error);
      return reply.status(500).send({ message: error.message || '删除失败' });
    }
  });
};

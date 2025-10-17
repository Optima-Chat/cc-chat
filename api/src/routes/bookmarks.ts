import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const bookmarksRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取当前用户的收藏列表
  fastify.get('/', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { limit = '20', offset = '0' } = request.query as { limit?: string; offset?: string };

    try {
      const result = await pool.query(
        `SELECT
          p.id, p.title, p.content, p.upvotes, p.downvotes, p.comment_count, p.created_at,
          u.id as user_id, u.username, u.avatar_url,
          b.created_at as bookmarked_at
        FROM bookmarks b
        JOIN posts p ON b.post_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE b.user_id = $1 AND p.deleted_at IS NULL
        ORDER BY b.created_at DESC
        LIMIT $2 OFFSET $3`,
        [request.user!.id, parseInt(limit, 10), parseInt(offset, 10)]
      );

      // 获取标签
      const postIds = result.rows.map((row) => row.id);
      let tagsResult: any = { rows: [] };
      if (postIds.length > 0) {
        tagsResult = await pool.query(
          `SELECT pt.post_id, t.id, t.name, t.emoji
           FROM post_tags pt
           JOIN tags t ON pt.tag_id = t.id
           WHERE pt.post_id = ANY($1)`,
          [postIds]
        );
      }

      const tagsByPost = new Map<number, any[]>();
      tagsResult.rows.forEach((row: any) => {
        if (!tagsByPost.has(row.post_id)) {
          tagsByPost.set(row.post_id, []);
        }
        tagsByPost.get(row.post_id)!.push({
          id: row.id,
          name: row.name,
          emoji: row.emoji,
        });
      });

      const posts = result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        comment_count: row.comment_count,
        created_at: row.created_at,
        bookmarked_at: row.bookmarked_at,
        author: {
          id: row.user_id,
          username: row.username,
          avatar_url: row.avatar_url,
        },
        tags: tagsByPost.get(row.id) || [],
      }));

      return posts;
    } catch (error: any) {
      fastify.log.error('Get bookmarks error:', error);
      return reply.status(500).send({ message: error.message || '获取收藏失败' });
    }
  });

  // 收藏帖子
  fastify.post('/:postId', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { postId } = request.params as { postId: string };

    try {
      // 检查帖子是否存在
      const postCheck = await pool.query(
        'SELECT id FROM posts WHERE id = $1 AND deleted_at IS NULL',
        [postId]
      );

      if (postCheck.rows.length === 0) {
        return reply.status(404).send({ message: '帖子不存在或已删除' });
      }

      // 尝试插入收藏
      try {
        await pool.query(
          'INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)',
          [request.user!.id, postId]
        );
        return { message: '收藏成功' };
      } catch (error: any) {
        // 如果是唯一性冲突（已收藏），返回友好提示
        if (error.code === '23505') {
          return reply.status(400).send({ message: '已经收藏过了' });
        }
        throw error;
      }
    } catch (error: any) {
      fastify.log.error('Bookmark post error:', error);
      return reply.status(500).send({ message: error.message || '收藏失败' });
    }
  });

  // 取消收藏
  fastify.delete('/:postId', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { postId } = request.params as { postId: string };

    try {
      const result = await pool.query(
        'DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2 RETURNING *',
        [request.user!.id, postId]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ message: '未收藏该帖子' });
      }

      return { message: '已取消收藏' };
    } catch (error: any) {
      fastify.log.error('Unbookmark post error:', error);
      return reply.status(500).send({ message: error.message || '取消收藏失败' });
    }
  });

  // 检查是否已收藏
  fastify.get('/check/:postId', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { postId } = request.params as { postId: string };

    try {
      const result = await pool.query(
        'SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2',
        [request.user!.id, postId]
      );

      return { bookmarked: result.rows.length > 0 };
    } catch (error: any) {
      fastify.log.error('Check bookmark error:', error);
      return reply.status(500).send({ message: error.message || '检查收藏状态失败' });
    }
  });
};

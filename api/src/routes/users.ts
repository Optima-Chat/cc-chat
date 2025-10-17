import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db.js';

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取用户信息和统计数据
  fastify.get('/:username', async (request, reply) => {
    const { username } = request.params as { username: string };

    // 获取用户基本信息
    const userResult = await pool.query(
      `SELECT id, username, avatar_url, created_at FROM users WHERE username = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return reply.status(404).send({ message: '用户不存在' });
    }

    const user = userResult.rows[0];

    // 获取用户发帖数
    const postCountResult = await pool.query(
      `SELECT COUNT(*) as count FROM posts WHERE user_id = $1`,
      [user.id]
    );

    // 获取用户评论数
    const commentCountResult = await pool.query(
      `SELECT COUNT(*) as count FROM comments WHERE user_id = $1`,
      [user.id]
    );

    // 获取用户获得的总投票数（帖子的 upvotes - downvotes）
    const votesResult = await pool.query(
      `SELECT SUM(upvotes - downvotes) as total_votes FROM posts WHERE user_id = $1`,
      [user.id]
    );

    return {
      id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      stats: {
        post_count: parseInt(postCountResult.rows[0].count, 10),
        comment_count: parseInt(commentCountResult.rows[0].count, 10),
        total_votes: parseInt(votesResult.rows[0].total_votes || 0, 10),
      },
    };
  });

  // 获取用户的帖子列表
  fastify.get('/:username/posts', async (request, reply) => {
    const { username } = request.params as { username: string };
    const { limit = '20' } = request.query as { limit?: string };

    // 获取用户 ID
    const userResult = await pool.query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return reply.status(404).send({ message: '用户不存在' });
    }

    const userId = userResult.rows[0].id;

    // 获取用户的帖子
    const postsResult = await pool.query(
      `SELECT
        p.id, p.title, p.content, p.created_at,
        p.upvotes, p.downvotes, p.comment_count,
        u.id as user_id, u.username, u.avatar_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2`,
      [userId, parseInt(limit, 10)]
    );

    // 获取每个帖子的标签
    const postIds = postsResult.rows.map((row) => row.id);
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

    const posts = postsResult.rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      upvotes: row.upvotes,
      downvotes: row.downvotes,
      comment_count: row.comment_count,
      created_at: row.created_at,
      author: {
        id: row.user_id,
        username: row.username,
        avatar_url: row.avatar_url,
      },
      tags: tagsByPost.get(row.id) || [],
    }));

    return posts;
  });
};

import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取帖子列表
  fastify.get('/', async (request, reply) => {
    const { limit = '10' } = request.query as { limit?: string };

    const result = await pool.query(
      `SELECT
        p.id, p.title, p.content, p.created_at,
        u.id as user_id, u.username, u.avatar_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1`,
      [parseInt(limit, 10)]
    );

    const posts = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      created_at: row.created_at,
      author: {
        id: row.user_id,
        username: row.username,
        avatar_url: row.avatar_url,
      },
    }));

    return posts;
  });

  // 获取单个帖子
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await pool.query(
      `SELECT
        p.id, p.title, p.content, p.created_at,
        u.id as user_id, u.username, u.avatar_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({ message: '帖子不存在' });
    }

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      created_at: row.created_at,
      author: {
        id: row.user_id,
        username: row.username,
        avatar_url: row.avatar_url,
      },
    };
  });

  // 创建帖子（需要认证）
  fastify.post('/', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { title, content } = request.body as { title: string; content: string };

    if (!title || !content) {
      return reply.status(400).send({ message: '标题和内容不能为空' });
    }

    const result = await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, created_at',
      [request.user!.id, title, content]
    );

    return {
      id: result.rows[0].id,
      title,
      content,
      created_at: result.rows[0].created_at,
    };
  });

  // 评论帖子（需要认证）
  fastify.post('/:id/comments', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };
    const { text } = request.body as { text: string };

    if (!text) {
      return reply.status(400).send({ message: '评论内容不能为空' });
    }

    // 检查帖子是否存在
    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return reply.status(404).send({ message: '帖子不存在' });
    }

    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, created_at',
      [id, request.user!.id, text]
    );

    return {
      id: result.rows[0].id,
      post_id: parseInt(id, 10),
      content: text,
      created_at: result.rows[0].created_at,
    };
  });
};

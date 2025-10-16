import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // 简化版登录（生产环境应使用 GitHub OAuth）
  fastify.post('/login', async (request, reply) => {
    const { code } = request.body as { code: string };

    if (!code) {
      return reply.status(400).send({ message: '缺少授权码' });
    }

    // TODO: 实现真正的 GitHub OAuth
    // 现在简化处理：创建或获取用户
    const githubId = `demo_${Date.now()}`;
    const username = `user_${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO users (github_id, username)
       VALUES ($1, $2)
       ON CONFLICT (github_id) DO UPDATE SET username = EXCLUDED.username
       RETURNING id, github_id, username`,
      [githubId, username]
    );

    const user = result.rows[0];

    return {
      token: user.github_id,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  });
};

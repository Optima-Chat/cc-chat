import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // 简化版登录（MVP 阶段使用用户名，未来实现 GitHub OAuth）
  fastify.post('/login', async (request, reply) => {
    const body = request.body as { code?: string; username?: string };

    // 支持两种方式：旧的 code 方式和新的 username 方式
    let username: string;
    let githubId: string;

    if (body.username) {
      // 新方式：使用用户名
      username = body.username.trim();

      if (!username || username.length < 2) {
        return reply.status(400).send({ message: '用户名至少 2 个字符' });
      }

      // 使用用户名生成 github_id
      githubId = `user_${username}_${Date.now()}`;
    } else if (body.code) {
      // 旧方式：兼容性
      githubId = `demo_${Date.now()}`;
      username = `user_${Date.now()}`;
    } else {
      return reply.status(400).send({ message: '缺少用户名或授权码' });
    }

    // 检查用户名是否已存在
    const existingUser = await pool.query(
      'SELECT id, github_id, username FROM users WHERE username = $1',
      [username]
    );

    let user;

    if (existingUser.rows.length > 0) {
      // 用户已存在，直接返回
      user = existingUser.rows[0];
    } else {
      // 创建新用户
      const result = await pool.query(
        `INSERT INTO users (github_id, username)
         VALUES ($1, $2)
         RETURNING id, github_id, username`,
        [githubId, username]
      );
      user = result.rows[0];
    }

    return {
      token: user.github_id,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  });
};

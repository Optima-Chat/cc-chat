import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // GitHub OAuth 回调处理
  fastify.post('/github/callback', async (request, reply) => {
    const { code } = request.body as { code: string };

    if (!code) {
      return reply.status(400).send({ message: '缺少授权码' });
    }

    try {
      // 使用 code 换取 access_token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return reply.status(400).send({ message: 'GitHub 授权失败' });
      }

      // 使用 access_token 获取用户信息
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
        },
      });

      const githubUser = await userResponse.json();

      // 查找或创建用户
      const existingUser = await pool.query(
        'SELECT id, github_id, username FROM users WHERE github_id = $1',
        [String(githubUser.id)]
      );

      let user;

      if (existingUser.rows.length > 0) {
        // 用户已存在
        user = existingUser.rows[0];
      } else {
        // 创建新用户
        const result = await pool.query(
          `INSERT INTO users (github_id, username, avatar_url)
           VALUES ($1, $2, $3)
           RETURNING id, github_id, username`,
          [String(githubUser.id), githubUser.login, githubUser.avatar_url]
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
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: '登录失败' });
    }
  });

  // GitHub Device Flow 登录（CLI 端使用）
  fastify.post('/github/device', async (request, reply) => {
    const { access_token } = request.body as { access_token: string };

    if (!access_token) {
      return reply.status(400).send({ message: '缺少 access_token' });
    }

    try {
      // 使用 access_token 获取用户信息
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
        },
      });

      if (!userResponse.ok) {
        return reply.status(400).send({ message: 'GitHub access_token 无效' });
      }

      const githubUser = await userResponse.json();

      // 查找或创建用户
      const existingUser = await pool.query(
        'SELECT id, github_id, username FROM users WHERE github_id = $1',
        [String(githubUser.id)]
      );

      let user;

      if (existingUser.rows.length > 0) {
        // 用户已存在
        user = existingUser.rows[0];
      } else {
        // 创建新用户
        const result = await pool.query(
          `INSERT INTO users (github_id, username, avatar_url)
           VALUES ($1, $2, $3)
           RETURNING id, github_id, username`,
          [String(githubUser.id), githubUser.login, githubUser.avatar_url]
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
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: '登录失败' });
    }
  });

};

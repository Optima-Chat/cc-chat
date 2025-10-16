import { FastifyRequest, FastifyReply } from 'fastify';
import { pool } from '../db.js';

export interface AuthRequest extends FastifyRequest {
  user?: {
    id: number;
    username: string;
    github_id: string;
  };
}

export async function authenticate(
  request: AuthRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: '未授权：缺少令牌' });
    }

    const token = authHeader.substring(7);

    // 简化版：token 就是 github_id（生产环境应使用 JWT）
    const result = await pool.query(
      'SELECT id, username, github_id FROM users WHERE github_id = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return reply.status(401).send({ message: '未授权：无效令牌' });
    }

    request.user = result.rows[0];
  } catch (error) {
    return reply.status(500).send({ message: '服务器错误' });
  }
}

import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db.js';

export const tagsRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取所有标签
  fastify.get('/', async (request, reply) => {
    const result = await pool.query(
      'SELECT id, name, emoji, description FROM tags ORDER BY name ASC'
    );

    return result.rows;
  });

  // 获取标签详情（包含帖子数）
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await pool.query(
      `SELECT
        t.id, t.name, t.emoji, t.description,
        COUNT(pt.post_id) as post_count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      WHERE t.id = $1
      GROUP BY t.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({ message: '标签不存在' });
    }

    return result.rows[0];
  });
};

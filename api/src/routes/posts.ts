import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取帖子列表
  fastify.get('/', async (request, reply) => {
    const { limit = '10', sort = 'new', tag } = request.query as {
      limit?: string;
      sort?: string;
      tag?: string;
    };

    let orderBy = 'p.created_at DESC';
    switch (sort) {
      case 'hot':
        // 热度算法: (upvotes - downvotes) / (hours_since_created + 2)^1.5
        orderBy = '(p.upvotes - p.downvotes) / POWER(EXTRACT(EPOCH FROM (NOW() - p.created_at))/3600 + 2, 1.5) DESC';
        break;
      case 'top':
        orderBy = '(p.upvotes - p.downvotes) DESC';
        break;
      case 'comments':
        orderBy = 'p.comment_count DESC';
        break;
      default:
        orderBy = 'p.created_at DESC';
    }

    let query = `
      SELECT
        p.id, p.title, p.content, p.created_at,
        p.upvotes, p.downvotes, p.comment_count,
        u.id as user_id, u.username, u.avatar_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // 标签筛选
    if (tag) {
      query += `
        INNER JOIN post_tags pt ON p.id = pt.post_id
        INNER JOIN tags t ON pt.tag_id = t.id
        WHERE t.name = $${paramIndex}
      `;
      params.push(tag);
      paramIndex++;
    }

    query += `
      ORDER BY ${orderBy}
      LIMIT $${paramIndex}
    `;
    params.push(parseInt(limit, 10));

    const result = await pool.query(query, params);

    // 获取每个帖子的标签
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
      author: {
        id: row.user_id,
        username: row.username,
        avatar_url: row.avatar_url,
      },
      tags: tagsByPost.get(row.id) || [],
    }));

    return posts;
  });

  // 获取单个帖子
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await pool.query(
      `SELECT
        p.id, p.title, p.content, p.created_at,
        p.upvotes, p.downvotes, p.comment_count,
        u.id as user_id, u.username, u.avatar_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({ message: '帖子不存在' });
    }

    // 获取标签
    const tagsResult = await pool.query(
      `SELECT t.id, t.name, t.emoji
       FROM post_tags pt
       JOIN tags t ON pt.tag_id = t.id
       WHERE pt.post_id = $1`,
      [id]
    );

    const row = result.rows[0];
    return {
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
      tags: tagsResult.rows,
    };
  });

  // 创建帖子（需要认证）
  fastify.post('/', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { title, content, tag_ids } = request.body as {
      title: string;
      content: string;
      tag_ids?: number[];
    };

    if (!title || !content) {
      return reply.status(400).send({ message: '标题和内容不能为空' });
    }

    const result = await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, created_at',
      [request.user!.id, title, content]
    );

    const postId = result.rows[0].id;

    // 添加标签
    if (tag_ids && tag_ids.length > 0) {
      const tagValues = tag_ids.map((tagId, index) => `($1, $${index + 2})`).join(', ');
      await pool.query(
        `INSERT INTO post_tags (post_id, tag_id) VALUES ${tagValues}`,
        [postId, ...tag_ids]
      );
    }

    return {
      id: postId,
      title,
      content,
      created_at: result.rows[0].created_at,
    };
  });

  // 获取帖子评论
  fastify.get('/:id/comments', async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await pool.query(
      `SELECT
        c.id, c.content, c.upvotes, c.created_at, c.parent_id,
        u.id as user_id, u.username, u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC`,
      [id]
    );

    const comments = result.rows.map((row) => ({
      id: row.id,
      content: row.content,
      upvotes: row.upvotes,
      parent_id: row.parent_id,
      created_at: row.created_at,
      author: {
        id: row.user_id,
        username: row.username,
        avatar_url: row.avatar_url,
      },
    }));

    return comments;
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

    // 更新帖子评论数
    await pool.query(
      'UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1',
      [id]
    );

    return {
      id: result.rows[0].id,
      post_id: parseInt(id, 10),
      content: text,
      created_at: result.rows[0].created_at,
    };
  });

  // 投票（需要认证）
  fastify.post('/:id/vote', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };
    const { value } = request.body as { value: number };

    if (value !== 1 && value !== -1) {
      return reply.status(400).send({ message: 'value 必须是 1 或 -1' });
    }

    // 检查是否已经投过票
    const existingVote = await pool.query(
      'SELECT id, value FROM votes WHERE user_id = $1 AND post_id = $2',
      [request.user!.id, id]
    );

    if (existingVote.rows.length > 0) {
      const oldValue = existingVote.rows[0].value;
      if (oldValue === value) {
        // 取消投票
        await pool.query('DELETE FROM votes WHERE user_id = $1 AND post_id = $2', [request.user!.id, id]);
        await pool.query(
          `UPDATE posts SET ${value === 1 ? 'upvotes' : 'downvotes'} = ${value === 1 ? 'upvotes' : 'downvotes'} - 1 WHERE id = $1`,
          [id]
        );
        return { message: '已取消投票' };
      } else {
        // 改变投票
        await pool.query(
          'UPDATE votes SET value = $1 WHERE user_id = $2 AND post_id = $3',
          [value, request.user!.id, id]
        );
        await pool.query(
          `UPDATE posts SET
            upvotes = upvotes + $1,
            downvotes = downvotes + $2
          WHERE id = $3`,
          [value === 1 ? 1 : -1, value === -1 ? 1 : -1, id]
        );
        return { message: '投票已更新' };
      }
    } else {
      // 新投票
      await pool.query(
        'INSERT INTO votes (user_id, post_id, value) VALUES ($1, $2, $3)',
        [request.user!.id, id, value]
      );
      await pool.query(
        `UPDATE posts SET ${value === 1 ? 'upvotes' : 'downvotes'} = ${value === 1 ? 'upvotes' : 'downvotes'} + 1 WHERE id = $1`,
        [id]
      );
      return { message: '投票成功' };
    }
  });

  // 取消投票（需要认证）
  fastify.delete('/:id/vote', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    const existingVote = await pool.query(
      'SELECT value FROM votes WHERE user_id = $1 AND post_id = $2',
      [request.user!.id, id]
    );

    if (existingVote.rows.length === 0) {
      return reply.status(404).send({ message: '未找到投票记录' });
    }

    const value = existingVote.rows[0].value;
    await pool.query('DELETE FROM votes WHERE user_id = $1 AND post_id = $2', [request.user!.id, id]);
    await pool.query(
      `UPDATE posts SET ${value === 1 ? 'upvotes' : 'downvotes'} = ${value === 1 ? 'upvotes' : 'downvotes'} - 1 WHERE id = $1`,
      [id]
    );

    return { message: '已取消投票' };
  });
};

import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取帖子列表
  fastify.get('/', async (request, reply) => {
    const { limit = '10', sort = 'new', tag, search } = request.query as {
      limit?: string;
      sort?: string;
      tag?: string;
      search?: string;
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
    const conditions: string[] = [];

    // 标签筛选
    if (tag) {
      query += `
        INNER JOIN post_tags pt ON p.id = pt.post_id
      `;
      conditions.push(`pt.tag_id = $${paramIndex}`);
      params.push(parseInt(tag, 10));
      paramIndex++;
    }

    // 搜索功能
    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(`(p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`);
      params.push(searchPattern);
      paramIndex++;
    }

    // 添加 WHERE 条件
    if (conditions.length > 0) {
      query += `
        WHERE ${conditions.join(' AND ')}
      `;
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

    // 获取当前用户的投票状态（如果已登录）
    let currentUserId: number | null = null;
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userResult = await pool.query(
        'SELECT id FROM users WHERE github_id = $1',
        [token]
      );
      if (userResult.rows.length > 0) {
        currentUserId = userResult.rows[0].id;
      }
    }

    let votesByPost = new Map<number, number>();
    if (currentUserId && postIds.length > 0) {
      const votesResult = await pool.query(
        `SELECT post_id, value FROM votes WHERE user_id = $1 AND post_id = ANY($2)`,
        [currentUserId, postIds]
      );
      votesResult.rows.forEach((row: any) => {
        votesByPost.set(row.post_id, row.value);
      });
    }

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
      user_vote: votesByPost.get(row.id) || null,
    }));

    return posts;
  });

  // 获取单个帖子
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await pool.query(
      `SELECT
        p.id, p.title, p.content, p.created_at, p.deleted_at,
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

    const row = result.rows[0];
    const isDeleted = row.deleted_at !== null;

    // 获取标签
    const tagsResult = await pool.query(
      `SELECT t.id, t.name, t.emoji
       FROM post_tags pt
       JOIN tags t ON pt.tag_id = t.id
       WHERE pt.post_id = $1`,
      [id]
    );

    return {
      id: row.id,
      title: isDeleted ? '[已删除]' : row.title,
      content: isDeleted ? '[已删除]' : row.content,
      upvotes: row.upvotes,
      downvotes: row.downvotes,
      comment_count: row.comment_count,
      created_at: row.created_at,
      deleted_at: row.deleted_at,
      author: {
        id: row.user_id,
        username: isDeleted ? '[已删除]' : row.username,
        avatar_url: isDeleted ? null : row.avatar_url,
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
        c.id, c.content, c.upvotes, c.downvotes, c.created_at, c.parent_id, c.deleted_at,
        u.id as user_id, u.username, u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC`,
      [id]
    );

    // 获取当前用户的投票状态（如果已登录）
    let currentUserId: number | null = null;
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userResult = await pool.query(
        'SELECT id FROM users WHERE github_id = $1',
        [token]
      );
      if (userResult.rows.length > 0) {
        currentUserId = userResult.rows[0].id;
      }
    }

    let votesByComment = new Map<number, number>();
    const commentIds = result.rows.map((row) => row.id);
    if (currentUserId && commentIds.length > 0) {
      const votesResult = await pool.query(
        `SELECT comment_id, value FROM comment_votes WHERE user_id = $1 AND comment_id = ANY($2)`,
        [currentUserId, commentIds]
      );
      votesResult.rows.forEach((row: any) => {
        votesByComment.set(row.comment_id, row.value);
      });
    }

    // 构建评论对象
    interface CommentNode {
      id: number;
      content: string;
      upvotes: number;
      downvotes: number;
      parent_id: number | null;
      created_at: Date;
      deleted_at: Date | null;
      author: {
        id: number;
        username: string;
        avatar_url: string | null;
      };
      user_vote: number | null;
      replies: CommentNode[];
    }

    const commentMap = new Map<number, CommentNode>();
    const rootComments: CommentNode[] = [];

    // 第一遍：创建所有评论对象
    result.rows.forEach((row) => {
      const isDeleted = row.deleted_at !== null;

      const comment: CommentNode = {
        id: row.id,
        content: isDeleted ? '[已删除]' : row.content,
        upvotes: row.upvotes,
        downvotes: row.downvotes || 0,
        parent_id: row.parent_id,
        created_at: row.created_at,
        deleted_at: row.deleted_at,
        author: {
          id: row.user_id,
          username: isDeleted ? '[已删除]' : row.username,
          avatar_url: isDeleted ? null : row.avatar_url,
        },
        user_vote: votesByComment.get(row.id) || null,
        replies: [],
      };
      commentMap.set(row.id, comment);
    });

    // 第二遍：构建树状结构
    commentMap.forEach((comment) => {
      if (comment.parent_id === null) {
        rootComments.push(comment);
      } else {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(comment);
        }
      }
    });

    // 递归排序函数：按分数降序，时间升序
    const sortComments = (comments: CommentNode[]) => {
      comments.sort((a, b) => {
        const scoreA = a.upvotes - a.downvotes;
        const scoreB = b.upvotes - b.downvotes;
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // 分数降序
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); // 时间升序
      });
      comments.forEach((comment) => {
        if (comment.replies.length > 0) {
          sortComments(comment.replies);
        }
      });
    };

    sortComments(rootComments);

    return rootComments;
  });

  // 评论帖子（需要认证）
  fastify.post('/:id/comments', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };
    const { text, parent_id } = request.body as { text: string; parent_id?: number };

    if (!text) {
      return reply.status(400).send({ message: '评论内容不能为空' });
    }

    // 检查帖子是否存在
    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return reply.status(404).send({ message: '帖子不存在' });
    }

    // 如果是回复评论，检查父评论是否存在且属于该帖子
    if (parent_id) {
      const parentCheck = await pool.query(
        'SELECT id FROM comments WHERE id = $1 AND post_id = $2',
        [parent_id, id]
      );
      if (parentCheck.rows.length === 0) {
        return reply.status(404).send({ message: '父评论不存在' });
      }
    }

    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
      [id, request.user!.id, text, parent_id || null]
    );

    // 更新帖子评论数
    await pool.query(
      'UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1',
      [id]
    );

    // 获取用户信息
    const userResult = await pool.query(
      'SELECT id, username, avatar_url FROM users WHERE id = $1',
      [request.user!.id]
    );

    return {
      id: result.rows[0].id,
      post_id: parseInt(id, 10),
      content: text,
      upvotes: 0,
      downvotes: 0,
      parent_id: parent_id || null,
      created_at: result.rows[0].created_at,
      author: {
        id: userResult.rows[0].id,
        username: userResult.rows[0].username,
        avatar_url: userResult.rows[0].avatar_url,
      },
      replies: [],
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

  // 评论投票（需要认证）
  fastify.post('/comments/:id/vote', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };
    const { value } = request.body as { value: number };

    if (value !== 1 && value !== -1) {
      return reply.status(400).send({ message: 'value 必须是 1 或 -1' });
    }

    try {
      // 检查评论是否存在
      const commentCheck = await pool.query('SELECT id FROM comments WHERE id = $1', [id]);
      if (commentCheck.rows.length === 0) {
        return reply.status(404).send({ message: '评论不存在' });
      }

      // 确保 comment_votes 表存在并支持 downvote
      await pool.query(`
        CREATE TABLE IF NOT EXISTS comment_votes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
          value INTEGER NOT NULL CHECK (value IN (-1, 1)),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, comment_id)
        )
      `);

      // 确保 comments 表有 downvotes 字段
      await pool.query(`
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0
      `);

      // 检查是否已经投过票
      const existingVote = await pool.query(
        'SELECT id, value FROM comment_votes WHERE user_id = $1 AND comment_id = $2',
        [request.user!.id, id]
      );

      if (existingVote.rows.length > 0) {
        const oldValue = existingVote.rows[0].value;
        if (oldValue === value) {
          // 取消投票
          await pool.query('DELETE FROM comment_votes WHERE user_id = $1 AND comment_id = $2', [request.user!.id, id]);
          await pool.query(
            `UPDATE comments SET ${value === 1 ? 'upvotes' : 'downvotes'} = ${value === 1 ? 'upvotes' : 'downvotes'} - 1 WHERE id = $1`,
            [id]
          );
          return { message: '已取消投票' };
        } else {
          // 改变投票方向
          await pool.query(
            'UPDATE comment_votes SET value = $1 WHERE user_id = $2 AND comment_id = $3',
            [value, request.user!.id, id]
          );
          await pool.query(
            `UPDATE comments SET
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
          'INSERT INTO comment_votes (user_id, comment_id, value) VALUES ($1, $2, $3)',
          [request.user!.id, id, value]
        );
        await pool.query(
          `UPDATE comments SET ${value === 1 ? 'upvotes' : 'downvotes'} = ${value === 1 ? 'upvotes' : 'downvotes'} + 1 WHERE id = $1`,
          [id]
        );
        return { message: '投票成功' };
      }
    } catch (error: any) {
      fastify.log.error('Comment vote error:', error);
      return reply.status(500).send({ message: error.message || '投票失败' });
    }
  });

  // 删除帖子（需要认证）
  fastify.delete('/:id', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    try {
      // 检查帖子是否存在以及是否为作者
      const postCheck = await pool.query(
        'SELECT user_id FROM posts WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );

      if (postCheck.rows.length === 0) {
        return reply.status(404).send({ message: '帖子不存在或已删除' });
      }

      if (postCheck.rows[0].user_id !== request.user!.id) {
        return reply.status(403).send({ message: '无权删除此帖子' });
      }

      // 软删除：设置 deleted_at
      await pool.query(
        'UPDATE posts SET deleted_at = NOW() WHERE id = $1',
        [id]
      );

      return { message: '帖子已删除' };
    } catch (error: any) {
      fastify.log.error('Delete post error:', error);
      return reply.status(500).send({ message: error.message || '删除失败' });
    }
  });

  // 删除评论（需要认证）
  fastify.delete('/comments/:id', { preHandler: authenticate }, async (request: AuthRequest, reply) => {
    const { id } = request.params as { id: string };

    try {
      // 检查评论是否存在以及是否为作者
      const commentCheck = await pool.query(
        'SELECT user_id, post_id FROM comments WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );

      if (commentCheck.rows.length === 0) {
        return reply.status(404).send({ message: '评论不存在或已删除' });
      }

      if (commentCheck.rows[0].user_id !== request.user!.id) {
        return reply.status(403).send({ message: '无权删除此评论' });
      }

      // 软删除：设置 deleted_at
      await pool.query(
        'UPDATE comments SET deleted_at = NOW() WHERE id = $1',
        [id]
      );

      return { message: '评论已删除' };
    } catch (error: any) {
      fastify.log.error('Delete comment error:', error);
      return reply.status(500).send({ message: error.message || '删除失败' });
    }
  });
};

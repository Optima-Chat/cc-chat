import pg from 'pg';

const { Pool } = pg;

// 支持 DATABASE_URL（Railway/Heroku）或单独的环境变量
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'cc_chat',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

export const pool = new Pool(poolConfig);

// 初始化数据库表
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        github_id VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        upvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        value INTEGER NOT NULL CHECK (value IN (-1, 1)),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      );

      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        emoji VARCHAR(10),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      );

    `);

    // 迁移：为已存在的表添加新字段（必须在创建索引之前）
    await client.query(`
      DO $$
      BEGIN
        -- 为 posts 表添加新字段
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='upvotes') THEN
          ALTER TABLE posts ADD COLUMN upvotes INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='downvotes') THEN
          ALTER TABLE posts ADD COLUMN downvotes INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='comment_count') THEN
          ALTER TABLE posts ADD COLUMN comment_count INTEGER DEFAULT 0;
        END IF;

        -- 为 comments 表添加新字段
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='parent_id') THEN
          ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='upvotes') THEN
          ALTER TABLE comments ADD COLUMN upvotes INTEGER DEFAULT 0;
        END IF;

        -- 添加 deleted_at 字段
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='deleted_at') THEN
          ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='deleted_at') THEN
          ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;
        END IF;
      END $$;
    `);

    // 创建索引（必须在字段添加之后）
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_posts_upvotes ON posts(upvotes DESC);
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_votes_post ON votes(post_id);
      CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
      CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
      CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);
    `);

    // 初始化默认标签
    await client.query(`
      INSERT INTO tags (name, emoji, description) VALUES
        ('技巧', '💡', 'Claude Code 使用技巧'),
        ('MCP', '🔧', 'MCP 配置和插件'),
        ('问题', '❓', '求助问题'),
        ('项目', '🎉', '项目展示'),
        ('讨论', '💬', '讨论交流'),
        ('教程', '📖', '教程文章'),
        ('Bug', '🐛', 'Bug 报告'),
        ('想法', '💭', '功能建议')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✓ 数据库初始化完成');
  } catch (error) {
    console.error('✗ 数据库初始化失败:', error);
  } finally {
    client.release();
  }
}

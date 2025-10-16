import Fastify from 'fastify';
import cors from '@fastify/cors';
import { postsRoutes } from './routes/posts.js';
import { authRoutes } from './routes/auth.js';
import { initDb } from './db.js';

const fastify = Fastify({
  logger: true,
});

// CORS
await fastify.register(cors, {
  origin: true,
});

// 路由
await fastify.register(postsRoutes, { prefix: '/api/posts' });
await fastify.register(authRoutes, { prefix: '/api/auth' });

// 健康检查
fastify.get('/health', async () => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 服务器运行在 http://localhost:${port}`);

    // 启动后再初始化数据库，避免阻塞健康检查
    initDb().catch((err) => {
      fastify.log.error('数据库初始化失败:', err);
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

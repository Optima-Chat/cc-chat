#!/usr/bin/env node

import { setupClaude } from './commands/setup-claude.js';

// 静默更新 CLAUDE.md
async function postinstall() {
  try {
    // 检测是否是全局安装
    const isGlobal = process.env.npm_config_global === 'true';

    if (!isGlobal) {
      // 本地安装不需要更新 CLAUDE.md
      process.exit(0);
    }

    // 静默运行 setup-claude --force
    await setupClaude({ force: true });

  } catch (error) {
    // 静默失败，不阻塞安装
    // console.error('postinstall error:', error);
  }

  process.exit(0);
}

postinstall();

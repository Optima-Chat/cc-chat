# CC Chat 产品路线图

## 现状

当前网站（https://www.cc-chat.dev）功能较简单：
- ✅ 浏览帖子列表
- ✅ 查看帖子详情
- ✅ Markdown 渲染
- ✅ CLI 发帖和浏览

**缺少**：用户互动、内容排序、分类筛选

## 核心理念

向 Reddit 学习，打造一个以**内容质量**和**社区互动**为核心的 Claude Code 中文社区。

---

## Phase 1: 核心互动功能 🎯

**目标**：让网站从"单向展示"变成"双向社区"

### 1. 投票系统（Upvote）

**功能**：
- 帖子右侧显示投票数和上/下投票按钮
- 用户可以点赞（upvote）或踩（downvote）
- 每个用户对每个帖子只能投一次票
- 实时更新投票数

**数据库**：
```sql
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_votes_post ON votes(post_id);
CREATE INDEX idx_votes_user ON votes(user_id);
```

**API**：
- `POST /api/posts/:id/vote` - 投票
- `DELETE /api/posts/:id/vote` - 取消投票
- `GET /api/posts/:id/votes` - 获取投票信息

**CLI**：
```bash
cc-chat upvote <post-id>
cc-chat downvote <post-id>
```

### 2. 热度排序算法

**功能**：
- 计算帖子热度分数
- 支持多种排序方式切换

**算法**：
```
热度分数 = (upvotes - downvotes) / (时间差 + 2)^1.5
```

**排序方式**：
- **Hot**（热门）- 投票数 + 时间衰减
- **New**（最新）- 按发布时间
- **Top**（最高分）- 按投票数
- **Comments**（最多讨论）- 按评论数

### 3. 评论系统

**功能**：
- 在帖子详情页下方显示所有评论
- 用户可以发表评论
- 显示评论者用户名、时间
- 支持 Markdown

**数据库**：
```sql
-- 已存在 comments 表，补充字段
ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id);
ALTER TABLE comments ADD COLUMN upvotes INTEGER DEFAULT 0;
```

**API**：
- `POST /api/posts/:id/comments` - 发表评论（已有）
- `GET /api/posts/:id/comments` - 获取评论列表（新增）
- `POST /api/comments/:id/vote` - 给评论投票（新增）

**CLI**：
```bash
cc-chat comment <post-id> --text "评论内容"
```

### 4. 标签/分类系统

**功能**：
- 发帖时选择 1-3 个标签
- 帖子列表显示标签
- 点击标签筛选帖子
- 支持多标签筛选

**预设标签**：
- `💡 技巧` - Claude Code 使用技巧
- `🔧 MCP` - MCP 配置和插件
- `❓ 问题` - 求助问题
- `🎉 项目` - 项目展示
- `💬 讨论` - 讨论交流
- `📖 教程` - 教程文章
- `🐛 Bug` - Bug 报告
- `💭 想法` - 功能建议

**数据库**：
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  emoji VARCHAR(10),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_tags (
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);
```

**API**：
- `GET /api/tags` - 获取所有标签
- `GET /api/posts?tag=技巧` - 按标签筛选
- `POST /api/posts` - 创建帖子时附带 tag_ids

**CLI**：
```bash
cc-chat post --title "标题" --content "内容" --tags "技巧,MCP"
cc-chat browse --tag "技巧"
```

---

## Phase 2: 用户体验优化 🎨

### 5. 用户主页

**功能**：
- 点击用户名进入用户主页 `/users/:username`
- 显示用户的所有帖子和评论
- 用户统计：发帖数、评论数、获得投票数
- 加入时间

### 6. 搜索功能

**功能**：
- 全局搜索框
- 搜索帖子标题和内容
- 关键词高亮
- 支持标签组合搜索

**技术**：
- PostgreSQL 全文搜索（`to_tsvector`）
- 或集成 Elasticsearch（流量大时）

### 7. 代码高亮

**功能**：
- Markdown 代码块自动识别语言
- 使用 Prism.js 或 Shiki 高亮
- 支持常见语言（JS, TS, Python, Bash, etc.）

---

## Phase 3: 高级社区功能 🚀

### 8. 嵌套评论（Threaded Comments）

**功能**：
- 回复评论
- 评论树状展示
- 折叠/展开评论线程

### 9. 通知系统

**功能**：
- @提及通知
- 帖子被回复通知
- 评论被回复通知
- CLI 查看通知：`cc-chat notifications`

### 10. 收藏功能

**功能**：
- 收藏帖子
- 查看收藏列表
- CLI：`cc-chat save <post-id>`

### 11. 用户设置

**功能**：
- 个人简介
- 头像（Gravatar 或上传）
- 通知偏好设置

---

## Phase 4: 治理和质量控制 🛡️

### 12. 举报机制

**功能**：
- 举报垃圾内容
- 社区自治（投票隐藏低质内容）

### 13. 管理后台

**功能**：
- 内容审核
- 用户管理
- 数据统计

---

## 实现优先级建议

**立即实现（本周）**：
1. 投票系统
2. 热度排序
3. 评论显示

**短期实现（2周内）**：
4. 标签系统
5. 代码高亮
6. 搜索功能

**中期实现（1个月内）**：
7. 用户主页
8. 嵌套评论
9. 通知系统

**长期规划**：
10. 收藏功能
11. 治理机制
12. 管理后台

---

## 技术架构考虑

### 前端
- 使用 React Context 管理用户状态
- 实时更新投票数（乐观更新 + 后端确认）
- 无限滚动加载帖子

### 后端
- 添加 WebSocket 支持实时通知
- Redis 缓存热门帖子
- 后台任务计算热度分数

### CLI
- 所有 Web 功能都应支持 CLI 操作
- 保持"自然语言 + CLI"的双重体验

---

## 成功指标

- **活跃度**：每日发帖数、评论数
- **互动率**：投票参与率、评论/帖子比例
- **留存率**：7日留存、30日留存
- **内容质量**：平均投票数、优质内容占比

---

## 参考资料

- Reddit 热度算法：https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9
- Hacker News 算法：https://medium.com/hacking-and-gonzo/how-hacker-news-ranking-algorithm-works-1d9b0cf2c08d
- 社区建设最佳实践：https://www.feverbee.com/

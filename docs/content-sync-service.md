# 内容同步服务技术方案

## 目标

自动从 Reddit、GitHub 等平台抓取 Claude Code 相关优质内容，翻译后发布到 CC Chat 社区。

## 架构设计

### 技术栈

- **爬虫**: Python + PRAW (Reddit API)
- **翻译**: OpenAI API (gpt-4o-mini)
- **发布**: CC Chat API
- **调度**: GitHub Actions (每 6 小时)
- **存储**: JSON 文件去重（或 Redis）

### 目录结构

```
scripts/
├── requirements.txt           # Python 依赖
├── config.py                  # 配置管理
├── scrapers/
│   ├── reddit_scraper.py     # Reddit 爬虫
│   └── github_scraper.py     # GitHub Discussions（可选）
├── translator.py             # OpenAI 翻译
├── publisher.py              # 发布到 CC Chat
├── deduplicator.py           # 去重逻辑
└── main.py                   # 主流程

.github/workflows/
└── sync-content.yml          # 定时任务

data/
└── seen_urls.json            # 已抓取记录
```

## 数据源

### 1. Reddit (优先级 1)

**目标 Subreddit:**
- r/ClaudeAI - Claude 官方讨论
- r/ChatGPT - 搜索 "Claude Code" 关键词

**筛选条件:**
- upvotes >= 10
- num_comments >= 3
- 标题/内容包含关键词: `claude code`, `mcp`, `claude desktop`

**API 限制:**
- 60 请求/分钟
- 需注册 Reddit App 获取 credentials

### 2. GitHub Discussions (优先级 2)

**目标仓库:**
- modelcontextprotocol/servers
- anthropics 组织下的讨论

**筛选条件:**
- reactions >= 5
- 包含 "claude code" 关键词

## 翻译策略

### OpenAI 配置

```python
model = "gpt-4o-mini"  # 经济实惠
prompt = """
将以下英文内容翻译为中文。要求：
1. 保留所有代码块和技术术语（如 MCP, Claude Code）
2. 保持 Markdown 格式
3. 语言自然流畅

内容：
{content}
"""
```

**成本估算:**
- gpt-4o-mini: $0.15 / 1M input tokens
- 平均帖子 ~1000 tokens
- 每天 20 篇 ≈ $0.003/天 ≈ $0.09/月

## 发布格式

```markdown
[转载] {翻译后的标题}

{翻译后的内容}

---

**原帖来源:** [{平台名}]({原始URL})
**原作者:** {作者名}
**发布时间:** {YYYY-MM-DD}

🤖 本帖由自动化服务抓取并翻译
```

**自动标签分配:**
- 包含 "MCP" → 标签: MCP
- 包含 "help", "issue" → 标签: 问题
- 包含 "tip", "trick" → 标签: 技巧
- 默认 → 标签: 讨论

## 去重机制

### 方法 1: URL Hash (推荐)

```python
import hashlib
import json

def is_seen(url):
    hash_key = hashlib.md5(url.encode()).hexdigest()
    with open('data/seen_urls.json') as f:
        seen = json.load(f)
    return hash_key in seen

def mark_seen(url):
    hash_key = hashlib.md5(url.encode()).hexdigest()
    # 追加到 seen_urls.json
```

### 方法 2: 数据库 (未来)

使用 PostgreSQL 存储 `scraped_posts` 表。

## 质量控制

### 内容过滤规则

**必须满足:**
- 字数 >= 50
- 评分 >= 10
- 不在黑名单关键词: `buy`, `sale`, `promo`

**优先级评分:**
```python
score = upvotes * 2 + num_comments * 3
优先抓取 score > 50 的帖子
```

## GitHub Actions 配置

```yaml
name: Sync Content

on:
  schedule:
    - cron: '0 */6 * * *'  # 每 6 小时
  workflow_dispatch:        # 支持手动触发

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r scripts/requirements.txt
      - run: python scripts/main.py
        env:
          REDDIT_CLIENT_ID: ${{ secrets.REDDIT_CLIENT_ID }}
          REDDIT_CLIENT_SECRET: ${{ secrets.REDDIT_CLIENT_SECRET }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          CC_CHAT_TOKEN: ${{ secrets.CC_CHAT_TOKEN }}
```

## 环境变量

需要在 GitHub Secrets 中配置:

```bash
REDDIT_CLIENT_ID          # Reddit App ID
REDDIT_CLIENT_SECRET      # Reddit App Secret
REDDIT_USER_AGENT        # 自定义 User Agent
OPENAI_API_KEY           # OpenAI API Key
CC_CHAT_TOKEN            # CC Chat 登录 token (GitHub ID)
```

## 法律和道德规范

### 版权声明

1. 必须标注原始来源和作者
2. 遵守 Reddit API TOS
3. 不抓取付费/私密内容
4. 允许原作者申请删除

### 频率限制

- Reddit API: 60 请求/分钟
- OpenAI API: 无硬性限制，注意成本
- CC Chat API: 避免短时间大量发帖

### 社区透明度

- 网站底部说明有转载内容
- 转载帖子标题加 `[转载]` 前缀
- 提供原始链接

## 实施计划

### Phase 1: MVP (1 周)

- [x] Reddit 爬虫
- [x] OpenAI 翻译
- [x] CC Chat 发布
- [x] 本地测试运行
- [ ] GitHub Actions 部署

### Phase 2: 优化 (2 周)

- [ ] 添加 GitHub Discussions 数据源
- [ ] 改进去重逻辑（使用数据库）
- [ ] 内容质量评分系统
- [ ] 错误通知（发送邮件/Slack）

### Phase 3: 高级功能 (未来)

- [ ] 用户可举报低质量转载
- [ ] AI 评估内容价值
- [ ] 自动生成摘要
- [ ] 多语言支持（日语、韩语）

## 预期效果

- **内容量**: 每天 5-10 篇优质帖子
- **成本**: ~$3/月 (OpenAI API)
- **维护**: 每周检查 1 次日志即可

## 监控指标

- 抓取成功率
- 翻译质量（人工抽查）
- 转载帖子的评论数/点赞数
- API 成本

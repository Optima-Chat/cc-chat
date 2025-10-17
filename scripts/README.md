# CC Chat 内容同步服务

自动从 Reddit 抓取 Claude Code 相关优质内容，翻译后发布到 CC Chat 社区。

## 功能

- 🔍 从 Reddit 抓取优质内容
- 🌐 使用 OpenAI API 翻译为中文
- 📝 自动发布到 CC Chat
- 🔄 去重机制防止重复抓取
- 🏷️ 智能标签识别
- ⏰ GitHub Actions 自动调度

## 本地运行

### 1. 安装依赖

```bash
cd scripts
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```bash
cp .env.example .env
```

编辑 `.env`：

```bash
# Reddit API (https://www.reddit.com/prefs/apps)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=CC-Chat Content Sync Bot v1.0

# OpenAI API (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# CC Chat
CC_CHAT_API_URL=https://api.cc-chat.dev
CC_CHAT_TOKEN=your_github_id  # 你的 GitHub ID
```

### 3. 运行

```bash
python main.py
```

## GitHub Actions 自动运行

### 配置 Secrets

在 GitHub 仓库设置中添加以下 Secrets:

- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_USER_AGENT`
- `OPENAI_API_KEY`
- `CC_CHAT_TOKEN`

### 运行频率

- 自动: 每 6 小时运行一次
- 手动: 在 Actions 页面点击 "Run workflow"

## 获取 Reddit API 凭证

1. 访问 https://www.reddit.com/prefs/apps
2. 点击 "Create App" 或 "Create Another App"
3. 填写信息：
   - **name**: CC Chat Content Sync
   - **App type**: script
   - **redirect uri**: http://localhost:8080
4. 创建后获取 `client_id` 和 `client_secret`

## 目录结构

```
scripts/
├── main.py                    # 主程序
├── config.py                  # 配置管理
├── translator.py              # OpenAI 翻译
├── publisher.py               # CC Chat 发布
├── deduplicator.py            # 去重逻辑
├── scrapers/
│   ├── __init__.py
│   └── reddit_scraper.py      # Reddit 爬虫
├── requirements.txt
├── .env.example
└── README.md

data/
└── seen_urls.json             # 已抓取记录
```

## 工作流程

1. **抓取** - 从 r/ClaudeAI 和 r/ChatGPT 获取热门帖子
2. **过滤** - 评分 >= 10，评论 >= 3，包含关键词
3. **去重** - 检查是否已抓取
4. **翻译** - OpenAI API 翻译为中文
5. **发布** - 自动添加标签和来源信息
6. **记录** - 保存已抓取 URL

## 质量控制

### 筛选条件

- 评分 >= 10
- 评论数 >= 3
- 内容长度 >= 50 字符
- 包含关键词: `claude code`, `mcp`, `claude desktop`
- 不包含垃圾词: `buy`, `sale`, `promo`

### 自动标签

- 包含 "MCP" → 标签: MCP
- 包含 "help", "issue" → 标签: 问题
- 包含 "tip", "trick" → 标签: 技巧
- 包含 "project" → 标签: 项目
- 默认 → 标签: 讨论

## 成本估算

- OpenAI API (gpt-4.1-mini): ~$0.5/月
- Reddit API: 免费
- GitHub Actions: 免费

## 故障排查

### Reddit API 错误

检查 Client ID 和 Secret 是否正确，User Agent 是否设置。

### OpenAI API 错误

检查 API Key 是否有效，账户是否有余额。

### 发布失败

检查 CC_CHAT_TOKEN (GitHub ID) 是否正确，是否已登录 CC Chat。

## 许可

MIT License

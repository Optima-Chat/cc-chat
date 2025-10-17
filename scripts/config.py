import os
from dotenv import load_dotenv

load_dotenv()

# Reddit API
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT', 'CC-Chat Content Sync Bot v1.0')

# OpenAI API
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# CC Chat API
CC_CHAT_API_URL = os.getenv('CC_CHAT_API_URL', 'https://api.cc-chat.dev')
CC_CHAT_TOKEN = os.getenv('CC_CHAT_TOKEN')

# 内容筛选配置
MIN_UPVOTES = 10
MIN_COMMENTS = 3
MIN_CONTENT_LENGTH = 50

# 关键词
KEYWORDS = ['claude code', 'mcp', 'claude desktop', 'model context protocol']
SPAM_KEYWORDS = ['buy', 'sale', 'discount', 'promo', 'selling']

# Subreddits
TARGET_SUBREDDITS = ['ClaudeAI', 'ChatGPT']

# 去重数据文件
SEEN_URLS_FILE = 'data/seen_urls.json'

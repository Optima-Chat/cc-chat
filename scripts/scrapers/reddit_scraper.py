import praw
from typing import List, Dict
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_USER_AGENT,
    TARGET_SUBREDDITS,
    KEYWORDS,
    SPAM_KEYWORDS,
    MIN_UPVOTES,
    MIN_COMMENTS,
    MIN_CONTENT_LENGTH
)

def init_reddit():
    """初始化 Reddit API 客户端"""
    return praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT
    )

def has_keywords(text: str) -> bool:
    """检查文本是否包含目标关键词"""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in KEYWORDS)

def has_spam_keywords(text: str) -> bool:
    """检查文本是否包含垃圾关键词"""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in SPAM_KEYWORDS)

def is_quality_post(submission) -> bool:
    """判断帖子是否符合质量标准"""
    # 评分检查
    if submission.score < MIN_UPVOTES:
        return False

    # 评论数检查
    if submission.num_comments < MIN_COMMENTS:
        return False

    # 内容长度检查
    content = submission.selftext
    if len(content) < MIN_CONTENT_LENGTH:
        return False

    # 关键词检查
    title_and_content = submission.title + ' ' + content
    if not has_keywords(title_and_content):
        return False

    # 垃圾内容过滤
    if has_spam_keywords(title_and_content):
        return False

    return True

def scrape_reddit(limit: int = 20) -> List[Dict]:
    """
    抓取 Reddit 帖子

    Args:
        limit: 每个 subreddit 抓取的帖子数量

    Returns:
        符合条件的帖子列表
    """
    reddit = init_reddit()
    posts = []

    for subreddit_name in TARGET_SUBREDDITS:
        print(f"\n正在抓取 r/{subreddit_name}...")
        subreddit = reddit.subreddit(subreddit_name)

        # 获取热门帖子
        for submission in subreddit.hot(limit=limit):
            if is_quality_post(submission):
                post_data = {
                    'title': submission.title,
                    'content': submission.selftext,
                    'url': f"https://reddit.com{submission.permalink}",
                    'author': str(submission.author),
                    'score': submission.score,
                    'num_comments': submission.num_comments,
                    'created_utc': submission.created_utc,
                    'source': 'reddit',
                    'source_name': f'r/{subreddit_name}'
                }
                posts.append(post_data)
                print(f"  ✓ 发现优质帖子: {submission.title[:50]}... (分数: {submission.score})")

    print(f"\n共发现 {len(posts)} 篇优质帖子")
    return posts

if __name__ == '__main__':
    # 测试
    posts = scrape_reddit(limit=10)
    for post in posts:
        print(f"\n标题: {post['title']}")
        print(f"来源: {post['source_name']}")
        print(f"分数: {post['score']}")
        print(f"URL: {post['url']}")

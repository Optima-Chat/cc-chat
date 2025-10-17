import hashlib
import json
import os
from config import SEEN_URLS_FILE

def get_url_hash(url: str) -> str:
    """计算 URL 的 MD5 hash"""
    return hashlib.md5(url.encode()).hexdigest()

def load_seen_urls() -> set:
    """加载已抓取的 URL hash 集合"""
    if not os.path.exists(SEEN_URLS_FILE):
        # 创建空文件
        os.makedirs(os.path.dirname(SEEN_URLS_FILE), exist_ok=True)
        with open(SEEN_URLS_FILE, 'w') as f:
            json.dump([], f)
        return set()

    with open(SEEN_URLS_FILE, 'r') as f:
        seen_list = json.load(f)
    return set(seen_list)

def is_seen(url: str, seen_urls: set) -> bool:
    """检查 URL 是否已抓取"""
    url_hash = get_url_hash(url)
    return url_hash in seen_urls

def mark_seen(url: str):
    """标记 URL 为已抓取"""
    url_hash = get_url_hash(url)
    seen_urls = load_seen_urls()
    seen_urls.add(url_hash)

    # 保存到文件
    with open(SEEN_URLS_FILE, 'w') as f:
        json.dump(list(seen_urls), f, indent=2)

    print(f"✓ 已标记为已抓取: {url}")

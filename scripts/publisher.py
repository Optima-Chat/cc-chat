import requests
from datetime import datetime
from typing import Dict, List, Optional
from config import CC_CHAT_API_URL, CC_CHAT_TOKEN

def detect_tags(title: str, content: str) -> List[str]:
    """
    根据标题和内容自动检测合适的标签

    Args:
        title: 标题
        content: 内容

    Returns:
        标签名称列表
    """
    text = (title + ' ' + content).lower()
    tags = []

    # 标签检测规则
    if 'mcp' in text or 'model context protocol' in text:
        tags.append('MCP')
    if any(word in text for word in ['help', 'issue', 'problem', 'error', '问题', '帮助']):
        tags.append('问题')
    if any(word in text for word in ['tip', 'trick', 'how to', '技巧', '教程']):
        tags.append('技巧')
    if any(word in text for word in ['project', 'showcase', '项目', '展示']):
        tags.append('项目')
    if 'bug' in text or '错误' in text:
        tags.append('Bug')

    # 默认标签
    if not tags:
        tags.append('讨论')

    return tags[:3]  # 最多 3 个标签

def get_tag_ids(tag_names: List[str]) -> List[int]:
    """
    根据标签名称获取标签 ID

    Args:
        tag_names: 标签名称列表

    Returns:
        标签 ID 列表
    """
    try:
        response = requests.get(f"{CC_CHAT_API_URL}/api/tags")
        if response.status_code == 200:
            all_tags = response.json()
            tag_map = {tag['name']: tag['id'] for tag in all_tags}

            tag_ids = []
            for name in tag_names:
                if name in tag_map:
                    tag_ids.append(tag_map[name])

            return tag_ids
    except Exception as e:
        print(f"✗ 获取标签失败: {e}")

    return []

def format_post_content(post: Dict) -> str:
    """
    格式化帖子内容，添加来源信息

    Args:
        post: 帖子数据

    Returns:
        格式化后的内容
    """
    content = post['content']

    # 添加分隔线和来源信息
    created_date = datetime.fromtimestamp(post['created_utc']).strftime('%Y-%m-%d')

    footer = f"""

---

**原帖来源:** [{post['source_name']}]({post['url']})
**原作者:** {post['author']}
**发布时间:** {created_date}

🤖 本帖由自动化服务抓取并翻译
"""

    return content + footer

def publish_to_cc_chat(post: Dict) -> Optional[Dict]:
    """
    发布帖子到 CC Chat

    Args:
        post: 包含翻译后内容的帖子数据

    Returns:
        发布成功返回帖子数据，失败返回 None
    """
    # 添加 [转载] 前缀
    title = f"[转载] {post['title']}"

    # 格式化内容
    content = format_post_content(post)

    # 检测标签
    tag_names = detect_tags(post['title'], post['content'])
    tag_ids = get_tag_ids(tag_names)

    print(f"\n正在发布: {title[:50]}...")
    print(f"  标签: {', '.join(tag_names)}")

    try:
        response = requests.post(
            f"{CC_CHAT_API_URL}/api/posts",
            json={
                'title': title,
                'content': content,
                'tag_ids': tag_ids if tag_ids else None
            },
            headers={
                'Authorization': f'Bearer {CC_CHAT_TOKEN}',
                'Content-Type': 'application/json'
            }
        )

        if response.status_code == 200:
            result = response.json()
            print(f"  ✓ 发布成功! 帖子 ID: {result['id']}")
            print(f"  查看: https://cc-chat.dev/posts/{result['id']}")
            return result
        else:
            print(f"  ✗ 发布失败: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"  ✗ 发布出错: {e}")
        return None

if __name__ == '__main__':
    # 测试
    test_post = {
        'title': '如何使用 MCP 与 Claude Code',
        'content': '这是一个测试帖子内容...',
        'url': 'https://reddit.com/r/test/123',
        'author': 'test_user',
        'created_utc': 1234567890,
        'source': 'reddit',
        'source_name': 'r/ClaudeAI'
    }

    result = publish_to_cc_chat(test_post)
    if result:
        print("\n测试成功!")

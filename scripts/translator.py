from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

TRANSLATION_PROMPT = """将以下英文内容翻译为中文。要求：
1. 保留所有代码块和技术术语（如 MCP, Claude Code, API 等）
2. 保持 Markdown 格式
3. 语言自然流畅，符合中文表达习惯

内容：
{content}"""

def translate_to_chinese(text: str, model: str = "gpt-4.1-mini") -> str:
    """
    使用 OpenAI API 将英文翻译为中文

    Args:
        text: 要翻译的英文文本
        model: 使用的模型

    Returns:
        翻译后的中文文本
    """
    if not text or not text.strip():
        return text

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": TRANSLATION_PROMPT.format(content=text)
                }
            ],
            temperature=0.3,  # 降低随机性，提高一致性
        )

        translated = response.choices[0].message.content
        return translated

    except Exception as e:
        print(f"✗ 翻译失败: {e}")
        return text  # 翻译失败时返回原文

def translate_post(post: dict) -> dict:
    """
    翻译整个帖子（标题和内容）

    Args:
        post: 包含 title 和 content 的字典

    Returns:
        翻译后的帖子字典
    """
    print(f"\n正在翻译: {post['title'][:50]}...")

    # 翻译标题
    translated_title = translate_to_chinese(post['title'])
    print(f"  标题翻译完成")

    # 翻译内容
    translated_content = translate_to_chinese(post['content'])
    print(f"  内容翻译完成")

    # 创建新的字典，保留原始数据
    translated_post = post.copy()
    translated_post['title'] = translated_title
    translated_post['content'] = translated_content
    translated_post['original_title'] = post['title']
    translated_post['original_content'] = post['content']

    return translated_post

if __name__ == '__main__':
    # 测试
    test_text = """
# How to use MCP with Claude Code

Here's a simple example of using Model Context Protocol:

```python
import mcp

client = mcp.Client()
client.connect()
```

This is amazing!
"""

    translated = translate_to_chinese(test_text)
    print("原文:")
    print(test_text)
    print("\n译文:")
    print(translated)

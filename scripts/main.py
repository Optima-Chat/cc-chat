#!/usr/bin/env python3
"""
CC Chat 内容同步服务主程序

从 Reddit 抓取优质内容，翻译后发布到 CC Chat
"""

import sys
from scrapers.reddit_scraper import scrape_reddit
from translator import translate_post
from publisher import publish_to_cc_chat
from deduplicator import load_seen_urls, is_seen, mark_seen

def main():
    """主流程"""
    print("=" * 60)
    print("CC Chat 内容同步服务")
    print("=" * 60)

    # 1. 加载已抓取记录
    print("\n[1/5] 加载去重记录...")
    seen_urls = load_seen_urls()
    print(f"  已记录 {len(seen_urls)} 条")

    # 2. 抓取 Reddit 内容
    print("\n[2/5] 抓取 Reddit 内容...")
    posts = scrape_reddit(limit=20)

    if not posts:
        print("\n未发现新内容，退出。")
        return

    # 3. 过滤已抓取的内容
    print("\n[3/5] 过滤重复内容...")
    new_posts = []
    for post in posts:
        if not is_seen(post['url'], seen_urls):
            new_posts.append(post)
        else:
            print(f"  ⊘ 跳过已抓取: {post['title'][:50]}...")

    print(f"  发现 {len(new_posts)} 篇新内容")

    if not new_posts:
        print("\n所有内容已抓取过，退出。")
        return

    # 4. 翻译内容
    print("\n[4/5] 翻译内容...")
    translated_posts = []
    for post in new_posts:
        try:
            translated = translate_post(post)
            translated_posts.append(translated)
        except Exception as e:
            print(f"  ✗ 翻译失败: {e}")
            continue

    # 5. 发布到 CC Chat
    print("\n[5/5] 发布到 CC Chat...")
    published_count = 0
    for post in translated_posts:
        try:
            result = publish_to_cc_chat(post)
            if result:
                # 标记为已抓取
                mark_seen(post['url'])
                published_count += 1
        except Exception as e:
            print(f"  ✗ 发布失败: {e}")
            continue

    # 总结
    print("\n" + "=" * 60)
    print(f"同步完成!")
    print(f"  抓取: {len(posts)} 篇")
    print(f"  新内容: {len(new_posts)} 篇")
    print(f"  翻译: {len(translated_posts)} 篇")
    print(f"  发布: {published_count} 篇")
    print("=" * 60)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n用户中断，退出。")
        sys.exit(0)
    except Exception as e:
        print(f"\n✗ 程序出错: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

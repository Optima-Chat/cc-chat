#!/usr/bin/env python3
"""临时脚本：删除测试帖子"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import psycopg2

def cleanup_test_posts():
    """软删除测试帖子 ID 1-9"""
    post_ids = [1, 2, 3, 4, 5, 6, 8, 9]

    # 从环境变量获取数据库 URL
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("✗ 缺少 DATABASE_URL 环境变量")
        sys.exit(1)

    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()

        # 软删除
        cur.execute(
            "UPDATE posts SET deleted_at = NOW() WHERE id = ANY(%s)",
            (post_ids,)
        )
        conn.commit()

        print(f"✓ 成功删除 {cur.rowcount} 篇测试帖子")
        print(f"  删除的 ID: {post_ids}")

        # 验证
        cur.execute(
            "SELECT id, title FROM posts WHERE deleted_at IS NULL ORDER BY id"
        )
        remaining = cur.fetchall()

        print(f"\n剩余有效帖子：")
        for row in remaining:
            print(f"  ID {row[0]}: {row[1]}")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"✗ 删除失败: {e}")
        sys.exit(1)

if __name__ == '__main__':
    cleanup_test_posts()

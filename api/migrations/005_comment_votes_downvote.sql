-- 修改 comment_votes 表支持 downvote
ALTER TABLE comment_votes
  DROP CONSTRAINT IF EXISTS comment_votes_value_check;

ALTER TABLE comment_votes
  ADD CONSTRAINT comment_votes_value_check CHECK (value IN (-1, 1));

-- 添加 downvotes 字段到 comments 表
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- 更新现有评论的 downvotes 为 0
UPDATE comments SET downvotes = 0 WHERE downvotes IS NULL;

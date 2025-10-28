-- 사용자 프로필 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'https://via.placeholder.com/150?text=User';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';

#!/bin/bash

# Supabase 프로젝트 ID
PROJECT_ID="pkorpzicojwkxcaqlpru"

# SQL 실행
echo "Adding profile columns to users table..."

cat > /tmp/migration.sql << 'SQL'
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'https://via.placeholder.com/150?text=User';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '';
SQL

echo "Migration SQL created at /tmp/migration.sql"
echo ""
echo "Please execute this SQL in Supabase Dashboard:"
echo "1. Go to https://app.supabase.com/project/$PROJECT_ID/sql/new"
echo "2. Copy and paste the SQL from /tmp/migration.sql"
echo "3. Click 'Run'"
echo ""
cat /tmp/migration.sql

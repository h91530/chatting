const fs = require('fs');
const path = require('path');

// .env.local 파일 읽기
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Supabase 마이그레이션 도구\n');

if (!SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL이 .env.local에 설정되어 있지 않습니다.');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY가 .env.local에 설정되어 있지 않습니다.');
  console.log('');
  console.log('설정 방법:');
  console.log('1. https://app.supabase.com 접속');
  console.log('2. 프로젝트 선택');
  console.log('3. Settings > API > Service role > secret 복사');
  console.log('4. .env.local에 다음 추가:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.log('');
}

console.log('📋 실행할 마이그레이션 SQL:\n');

const queries = [
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT \'https://via.placeholder.com/150?text=User\';',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT \'\';',
  'ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT DEFAULT \'\';',
];

queries.forEach(q => console.log(q));

console.log('\n');
console.log('🔗 Supabase Dashboard URL:');
console.log(`   https://app.supabase.com/project/${SUPABASE_URL.split('.')[0]}/sql/new`);

console.log('\n');
console.log('📝 실행 방법:');
console.log('1. 위의 URL에 접속');
console.log('2. 위의 SQL을 복사해서 SQL Editor에 붙여넣기');
console.log('3. "Run" 버튼 클릭');

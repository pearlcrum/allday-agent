const server = require('./app');

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('\n  ✨ 올데이 에이전트 데모가 실행됐어요');
  console.log(`  → 앱:  http://localhost:${PORT}`);
  console.log(`  → API: http://localhost:${PORT}/api/health\n`);
});

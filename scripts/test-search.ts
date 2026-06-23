import dotenv from 'dotenv';

dotenv.config();

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY!;
const API_BASE_URL = 'http://localhost:3000';

async function testSearch() {
  console.log('=== 测试搜索功能 ===\n');

  const testQueries = [
    '开心的猫',
    '伤心',
    '生气',
    '可爱的动物',
  ];

  for (const query of testQueries) {
    console.log(`\n测试查询: "${query}"`);
    console.log('---');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}&limit=3`
      );
      const data = await response.json();

      if (data.success && data.results.length > 0) {
        console.log(`✓ 找到 ${data.results.length} 个结果\n`);

        data.results.forEach((result: any, index: number) => {
          console.log(`${index + 1}. Score: ${result.score.toFixed(4)}`);
          console.log(`   图片: ${result.imageUrl}`);
          console.log(`   描述: ${result.description.substring(0, 80)}...`);

          // 验证 R2 URL
          if (result.imageUrl.includes('pub-1bf96c57b58640b4ac0cbd9216d5c474.r2.dev')) {
            console.log(`   ✅ R2 CDN URL 正确`);
          } else {
            console.log(`   ⚠️ R2 CDN URL 不正确`);
          }
          console.log();
        });
      } else {
        console.log('⚠️ 未找到结果');
      }
    } catch (error) {
      console.error('❌ 搜索失败:', (error as Error).message);
    }
  }

  console.log('\n=== 测试完成 ===');
}

testSearch().catch(console.error);

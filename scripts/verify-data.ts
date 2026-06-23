import { getIndexStats, queryVectors, getPineconeClient } from './lib/pinecone-client';
import { generateEmbedding } from './lib/embedding';

async function verifyData() {
  console.log('=== Verifying Pinecone Data ===\n');

  try {
    // 获取索引统计信息
    console.log('Fetching index stats...');
    const stats = await getIndexStats();
    console.log('Index stats:', JSON.stringify(stats, null, 2));
    console.log(`\nTotal vectors: ${stats.totalRecordCount || 0}\n`);

    // 测试搜索功能
    console.log('Testing search functionality...');
    const testQuery = '开心的猫';
    console.log(`Test query: "${testQuery}"\n`);

    console.log('Generating query embedding...');
    const queryEmbedding = await generateEmbedding(testQuery);
    console.log(`Query embedding dimension: ${queryEmbedding.length}\n`);

    console.log('Searching for similar memes...');
    const results = await queryVectors(queryEmbedding, 5);

    console.log(`\nTop 5 results:`);
    if (results.matches && results.matches.length > 0) {
      results.matches.forEach((match: any, index: number) => {
        console.log(`\n${index + 1}. ID: ${match.id}`);
        console.log(`   Score: ${match.score.toFixed(4)}`);
        console.log(`   Description: ${match.metadata?.description?.substring(0, 100)}...`);
        console.log(`   Image: ${match.metadata?.imageUrl}`);
      });
    } else {
      console.log('No results found');
    }

    console.log('\n✅ Verification completed successfully!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyData();

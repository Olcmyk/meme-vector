import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

async function searchMemes(query: string, topK: number = 5) {
  console.log(`\n🔍 Searching for: "${query}"\n`);

  // 生成查询向量
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const queryVector = embeddingResponse.data[0].embedding;

  // 搜索 Pinecone
  const index = pinecone.index('meme-search');
  const queryResponse = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  // 显示结果
  console.log(`📊 Found ${queryResponse.matches.length} results:\n`);

  queryResponse.matches.forEach((match, i) => {
    console.log(`${i + 1}. Score: ${match.score?.toFixed(4)}`);
    console.log(`   Text: ${match.metadata?.text || 'N/A'}`);
    console.log(`   ID: ${match.id}`);
    console.log();
  });
}

// 获取命令行参数
const query = process.argv[2];

if (!query) {
  console.error('Usage: npx tsx scripts/search.ts "your search query"');
  process.exit(1);
}

searchMemes(query).catch(console.error);

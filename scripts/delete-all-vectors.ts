import { getPineconeClient } from './lib/pinecone-client';
import * as dotenv from 'dotenv';

dotenv.config();

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'meme-search';

async function deleteAllVectors() {
  console.log('Connecting to Pinecone...');
  const pc = getPineconeClient();
  const index = pc.index(INDEX_NAME);

  console.log(`Deleting all vectors from index: ${INDEX_NAME}`);

  try {
    // 删除所有向量（使用 deleteAll）
    await index.namespace('').deleteAll();
    console.log('✅ All vectors deleted successfully!');
  } catch (error) {
    console.error('❌ Failed to delete vectors:', error);
    process.exit(1);
  }
}

deleteAllVectors();

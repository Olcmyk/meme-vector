import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'meme-search';

async function verifyUpdate() {
  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(INDEX_NAME);

  // 查询一个已经更新过的向量（batch 1 中的第一个）
  const result = await index.fetch(['meme_00000', 'meme_00100', 'meme_01000']);

  console.log('验证已更新的向量:');
  console.log(JSON.stringify(result, null, 2));
}

verifyUpdate();

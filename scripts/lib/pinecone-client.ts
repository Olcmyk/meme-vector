import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'meme-search';

export interface Vector {
  id: string;
  values: number[];
  metadata: {
    imageUrl: string;
    description: string;
    source: string;
  };
}

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY not found in environment variables');
  }

  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });
  }

  return pineconeClient;
}

export async function initIndex(dimension: number): Promise<void> {
  const pc = getPineconeClient();

  try {
    // 检查索引是否存在
    const indexes = await pc.listIndexes();
    const indexExists = indexes.indexes?.some(idx => idx.name === INDEX_NAME);

    if (indexExists) {
      console.log(`Index '${INDEX_NAME}' already exists`);
      return;
    }

    console.log(`Creating index '${INDEX_NAME}' with dimension ${dimension}...`);
    await pc.createIndex({
      name: INDEX_NAME,
      dimension: dimension,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });

    // 等待索引准备就绪
    console.log('Waiting for index to be ready...');
    await new Promise(resolve => setTimeout(resolve, 60000)); // 等待60秒

    console.log(`Index '${INDEX_NAME}' created successfully`);
  } catch (error) {
    console.error('Error initializing index:', error);
    throw error;
  }
}

export async function upsertVectors(vectors: Vector[]): Promise<void> {
  const pc = getPineconeClient();
  const index = pc.index(INDEX_NAME);

  try {
    // Pinecone 建议每批最多 100 个向量
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
      console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
    }
  } catch (error) {
    console.error('Error upserting vectors:', error);
    throw error;
  }
}

export async function getIndexStats(): Promise<any> {
  const pc = getPineconeClient();
  const index = pc.index(INDEX_NAME);

  try {
    const stats = await index.describeIndexStats();
    return stats;
  } catch (error) {
    console.error('Error getting index stats:', error);
    throw error;
  }
}

export async function queryVectors(
  queryVector: number[],
  topK: number = 20
): Promise<any> {
  const pc = getPineconeClient();
  const index = pc.index(INDEX_NAME);

  try {
    const results = await index.query({
      vector: queryVector,
      topK: topK,
      includeMetadata: true,
    });
    return results;
  } catch (error) {
    console.error('Error querying vectors:', error);
    throw error;
  }
}

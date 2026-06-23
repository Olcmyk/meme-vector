import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'meme-search';

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

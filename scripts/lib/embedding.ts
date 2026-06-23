import * as dotenv from 'dotenv';

dotenv.config();

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY;
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/embeddings';
const MODEL = 'Qwen/Qwen3-VL-Embedding-8B';

interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateEmbedding(text: string, retries = 3): Promise<number[]> {
  if (!SILICONFLOW_API_KEY) {
    throw new Error('SILICONFLOW_API_KEY not found in environment variables');
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(SILICONFLOW_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          input: text,
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data: EmbeddingResponse = await response.json();

      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        throw new Error('Invalid response format from API');
      }

      return data.data[0].embedding;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);

      if (attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 指数退避：1s, 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }

  throw new Error('Failed to generate embedding after all retries');
}

// 批量生成 embeddings，带速率限制
export async function generateEmbeddingsBatch(
  texts: string[],
  delayMs = 100
): Promise<number[][]> {
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i++) {
    console.log(`Generating embedding ${i + 1}/${texts.length}...`);
    const embedding = await generateEmbedding(texts[i]);
    results.push(embedding);

    // 添加延迟避免速率限制
    if (i < texts.length - 1) {
      await sleep(delayMs);
    }
  }

  return results;
}

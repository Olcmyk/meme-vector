import * as fs from 'fs';
import * as path from 'path';
import { loadMemeData, getImageUrl } from './lib/data-loader';
import { generateEmbedding } from './lib/embedding';
import { initIndex, upsertVectors, Vector } from './lib/pinecone-client';

const DATA_PATH = path.join(__dirname, '../emo-visual-data/data.json');
const IMAGE_BASE_DIR = path.join(__dirname, '../emo-visual-data');
const PROGRESS_FILE = path.join(__dirname, 'progress.json');
const FAILED_LOG = path.join(__dirname, 'failed.log');
const BATCH_SIZE = 50; // 每批处理50个

interface Progress {
  processedIds: string[];
  lastProcessedIndex: number;
}

function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return { processedIds: [], lastProcessedIndex: -1 };
}

function saveProgress(progress: Progress): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function logFailure(id: string, error: string): void {
  const logEntry = `${new Date().toISOString()} - ID: ${id} - Error: ${error}\n`;
  fs.appendFileSync(FAILED_LOG, logEntry);
}

async function processInBatches() {
  console.log('Starting data preparation...\n');

  // 加载数据
  console.log('Loading meme data...');
  const memeData = loadMemeData(DATA_PATH);
  console.log(`Total memes: ${memeData.length}\n`);

  // 加载进度
  const progress = loadProgress();
  console.log(`Resuming from index: ${progress.lastProcessedIndex + 1}`);
  console.log(`Already processed: ${progress.processedIds.length} memes\n`);

  // 测试生成一个向量来获取维度
  let dimension: number;
  if (progress.processedIds.length === 0) {
    console.log('Generating test embedding to determine dimension...');
    const testEmbedding = await generateEmbedding(memeData[0].content);
    dimension = testEmbedding.length;
    console.log(`Embedding dimension: ${dimension}\n`);

    // 初始化 Pinecone 索引
    console.log('Initializing Pinecone index...');
    await initIndex(dimension);
    console.log('Index initialized\n');
  }

  // 处理剩余的数据
  const startIndex = progress.lastProcessedIndex + 1;
  const totalToProcess = memeData.length - startIndex;

  console.log(`Processing ${totalToProcess} remaining memes...\n`);

  for (let i = startIndex; i < memeData.length; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE, memeData.length);
    const batch = memeData.slice(i, batchEnd);

    console.log(`\n=== Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(memeData.length / BATCH_SIZE)} ===`);
    console.log(`Processing memes ${i + 1} to ${batchEnd} of ${memeData.length}`);

    const vectors: Vector[] = [];

    for (let j = 0; j < batch.length; j++) {
      const meme = batch[j];
      const globalIndex = i + j;
      const memeId = `meme_${globalIndex.toString().padStart(5, '0')}`;

      try {
        // 生成向量
        console.log(`  [${globalIndex + 1}/${memeData.length}] Generating embedding for ${meme.filename}...`);
        const embedding = await generateEmbedding(meme.content);

        // 构建向量记录
        const imageUrl = getImageUrl(meme.filename, IMAGE_BASE_DIR);
        const vector: Vector = {
          id: memeId,
          values: embedding,
          metadata: {
            imageUrl: imageUrl,
            description: meme.content,
            source: 'emo-visual-data',
          },
        };

        vectors.push(vector);
        progress.processedIds.push(memeId);

        // 小延迟避免速率限制
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ Failed to process ${meme.filename}: ${errorMsg}`);
        logFailure(memeId, errorMsg);
      }
    }

    // 上传这批向量到 Pinecone
    if (vectors.length > 0) {
      try {
        console.log(`  Upserting ${vectors.length} vectors to Pinecone...`);
        await upsertVectors(vectors);
        console.log(`  ✅ Successfully uploaded ${vectors.length} vectors`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`  ❌ Failed to upload batch: ${errorMsg}`);
        // 记录整批失败
        for (const vector of vectors) {
          logFailure(vector.id, `Batch upload failed: ${errorMsg}`);
        }
      }
    }

    // 更新进度
    progress.lastProcessedIndex = batchEnd - 1;
    saveProgress(progress);

    console.log(`  Progress: ${progress.processedIds.length}/${memeData.length} (${((progress.processedIds.length / memeData.length) * 100).toFixed(2)}%)`);
  }

  console.log('\n✅ Data preparation completed!');
  console.log(`Total processed: ${progress.processedIds.length}/${memeData.length}`);

  if (fs.existsSync(FAILED_LOG)) {
    const failedCount = fs.readFileSync(FAILED_LOG, 'utf-8').split('\n').filter(line => line.trim()).length;
    console.log(`Failed: ${failedCount} (see ${FAILED_LOG})`);
  }
}

// 运行脚本
processInBatches().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

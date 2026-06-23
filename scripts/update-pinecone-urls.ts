import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'meme-search';
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'your-username';
const GITHUB_REPO = process.env.GITHUB_REPO || 'meme-images';
const BATCH_SIZE = 100;

interface MemeData {
  id: string;
  tags: string[];
  zhDescription: string;
}

async function updatePineconeUrls() {
  console.log('=== 更新 Pinecone 图片 URL ===\n');

  // 1. 加载数据
  console.log('1. 加载表情包数据...');
  const dataPath = path.join(process.cwd(), 'emo-visual-data/data.json');
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const memes: MemeData[] = rawData.list || rawData;
  console.log(`加载了 ${memes.length} 个表情包\n`);

  // 2. 初始化 Pinecone
  console.log('2. 连接 Pinecone...');
  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(INDEX_NAME);

  // 获取当前索引统计
  const stats = await index.describeIndexStats();
  console.log(`当前索引记录数: ${stats.totalRecordCount}\n`);

  // 3. 准备更新
  console.log('3. 准备更新向量元数据...');
  const updates = [];

  for (let i = 0; i < memes.length; i++) {
    const meme = memes[i];
    const vectorId = `meme_${String(i).padStart(5, '0')}`;

    // 构建新的图片 URL
    const oldImagePath = path.join(process.cwd(), 'emo-visual-data/emo', `${meme.id}.jpg`);
    const oldImagePath2 = path.join(process.cwd(), 'emo-visual-data/emo', `${meme.id}.png`);

    let fileName = `${meme.id}.jpg`;
    if (fs.existsSync(oldImagePath2)) {
      fileName = `${meme.id}.png`;
    }

    const newImageUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/${GITHUB_REPO}@main/images/${fileName}`;

    updates.push({
      id: vectorId,
      setMetadata: {
        imageUrl: newImageUrl,
        description: meme.zhDescription,
        tags: meme.tags.join(','),
        originalId: meme.id,
      },
    });

    if ((i + 1) % 500 === 0) {
      console.log(`  准备了 ${i + 1}/${memes.length} 个更新`);
    }
  }

  console.log(`\n准备更新 ${updates.length} 个向量的元数据\n`);

  // 4. 批量更新
  console.log('4. 批量更新 Pinecone...');
  const batches = Math.ceil(updates.length / BATCH_SIZE);

  for (let i = 0; i < batches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min((i + 1) * BATCH_SIZE, updates.length);
    const batch = updates.slice(start, end);

    try {
      // 使用 upsert 更新元数据（不改变向量，只更新 metadata）
      await index.namespace('').update(batch as any);

      console.log(`  批次 ${i + 1}/${batches} 完成 (${start + 1}-${end}/${updates.length})`);

      // 避免速率限制
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`  批次 ${i + 1} 失败:`, error);
      // 继续处理下一批
    }
  }

  // 5. 验证
  console.log('\n5. 验证更新...');
  const newStats = await index.describeIndexStats();
  console.log(`更新后索引记录数: ${newStats.totalRecordCount}`);

  // 随机查询一个向量验证 URL
  console.log('\n6. 抽查验证...');
  const randomIndex = Math.floor(Math.random() * Math.min(100, memes.length));
  const testVectorId = `meme_${String(randomIndex).padStart(5, '0')}`;

  try {
    const fetchResult = await index.fetch([testVectorId]);
    const vector = fetchResult.records?.[testVectorId];

    if (vector && vector.metadata) {
      console.log(`测试向量 ID: ${testVectorId}`);
      console.log(`图片 URL: ${vector.metadata.imageUrl}`);
      console.log(`描述: ${(vector.metadata.description as string)?.substring(0, 50)}...`);
    }
  } catch (error) {
    console.error('验证失败:', error);
  }

  console.log('\n=== 更新完成！===');
  console.log('所有 Pinecone 向量的图片 URL 已更新为 CDN 地址');
}

updatePineconeUrls().catch(error => {
  console.error('错误:', error);
  process.exit(1);
});

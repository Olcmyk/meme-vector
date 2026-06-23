import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'meme-search';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;
const BATCH_SIZE = 100;

interface MemeData {
  filename: string;
  content: string;
}

async function updatePineconeUrlsForR2() {
  console.log('=== 更新 Pinecone 图片 URL (R2 版本) ===\n');

  // 验证环境变量
  if (!R2_PUBLIC_URL) {
    console.error('错误：缺少 R2_PUBLIC_URL 环境变量');
    console.error('请在 .env 文件中添加：R2_PUBLIC_URL=https://pub-xxxxx.r2.dev');
    process.exit(1);
  }

  console.log(`R2 Public URL: ${R2_PUBLIC_URL}\n`);

  // 1. 加载数据
  console.log('1. 加载表情包数据...');
  const dataPath = path.join(process.cwd(), 'emo-visual-data/data.json');
  const memes: MemeData[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
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

    // 直接使用 filename
    const fileName = meme.filename;
    const newImageUrl = `${R2_PUBLIC_URL}/${fileName}`;

    updates.push({
      id: vectorId,
      setMetadata: {
        imageUrl: newImageUrl,
        description: meme.content,
        tags: '',
        originalFilename: fileName,
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
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < batches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min((i + 1) * BATCH_SIZE, updates.length);
    const batch = updates.slice(start, end);

    try {
      // 批量更新元数据
      const updatePromises = batch.map(update =>
        index.namespace('').update({
          id: update.id,
          metadata: update.setMetadata,
        })
      );

      await Promise.all(updatePromises);
      successCount += batch.length;

      const progress = ((end / updates.length) * 100).toFixed(1);
      console.log(`  批次 ${i + 1}/${batches}: ✓ ${batch.length} 个向量已更新 (${progress}%)`);

      // 避免速率限制
      if (i < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`  批次 ${i + 1} 失败:`, (error as Error).message);
      failCount += batch.length;
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

      // 验证 URL 格式
      if ((vector.metadata.imageUrl as string).startsWith(R2_PUBLIC_URL)) {
        console.log('✅ URL 格式正确！');
      } else {
        console.log('⚠️ URL 格式可能不正确');
      }
    }
  } catch (error) {
    console.error('验证失败:', error);
  }

  console.log('\n=== 更新完成！===');
  console.log(`✓ 成功: ${successCount}/${updates.length}`);
  if (failCount > 0) {
    console.log(`✗ 失败: ${failCount}/${updates.length}`);
  }
  console.log('\n所有 Pinecone 向量的图片 URL 已更新为 R2 CDN 地址');
  console.log(`图片访问示例: ${R2_PUBLIC_URL}/${memes[0].id}.jpg`);
}

updatePineconeUrlsForR2().catch(error => {
  console.error('错误:', error);
  process.exit(1);
});

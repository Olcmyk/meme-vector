import * as fs from 'fs';
import * as path from 'path';
import { loadMemeData } from './lib/data-loader';
import { getPineconeClient } from './lib/pinecone-client';
import * as dotenv from 'dotenv';

dotenv.config();

const DATA_PATH = path.join(__dirname, '../emo-visual-data/data.json');
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-8afedeb37e124f06aef2f0e431bc3aaf.r2.dev';
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'meme-search';
const BATCH_SIZE = 100; // Pinecone update 可以处理更大的批次

async function updateMetadata() {
  console.log('Loading meme data...');
  const memeData = loadMemeData(DATA_PATH);
  console.log(`Loaded ${memeData.length} memes\n`);

  console.log('Connecting to Pinecone index...');
  const pc = getPineconeClient();
  const index = pc.index(INDEX_NAME);
  console.log('Connected to index\n');

  console.log(`Updating metadata for ${memeData.length} vectors...\n`);

  for (let i = 0; i < memeData.length; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE, memeData.length);
    const batch = memeData.slice(i, batchEnd);

    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(memeData.length / BATCH_SIZE)}: Updating metadata for vectors ${i + 1} to ${batchEnd}`);

    try {
      // Pinecone 的 update 需要逐个调用
      for (let j = 0; j < batch.length; j++) {
        const meme = batch[j];
        const globalIndex = i + j;
        const memeId = `meme_${globalIndex.toString().padStart(5, '0')}`;
        const imageUrl = `${R2_PUBLIC_URL}/${meme.filename}`;

        await index.update({
          id: memeId,
          metadata: {
            imageUrl: imageUrl,
            description: meme.content,
            source: 'emo-visual-data',
          },
        });
      }

      console.log(`  ✅ Successfully updated ${batch.length} vectors`);
      console.log(`  Progress: ${batchEnd}/${memeData.length} (${((batchEnd / memeData.length) * 100).toFixed(2)}%)\n`);

    } catch (error) {
      console.error(`  ❌ Failed to update batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
    }
  }

  console.log('\n✅ Metadata update completed!');
  console.log(`Total updated: ${memeData.length}`);
}

updateMetadata().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

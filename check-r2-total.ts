import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = 'chinese-meme';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function countR2Files() {
  console.log('正在统计 R2 中的图片数量...\n');
  
  let totalCount = 0;
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);
    const count = response.Contents?.length || 0;
    totalCount += count;
    
    console.log(`已扫描: ${totalCount} 个文件...`);
    
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  console.log(`\n✅ R2 中总共有 ${totalCount} 个图片文件`);
}

countR2Files().catch(console.error);

import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = 'chinese-meme';
const IMAGE_BASE_DIR = path.join(__dirname, '../emo-visual-data/emo');
const FAILED_LOG = path.join(__dirname, '../r2-upload.log');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function getFailedFiles(): Promise<string[]> {
  const logContent = fs.readFileSync(FAILED_LOG, 'utf-8');
  const failedFiles: string[] = [];

  for (const line of logContent.split('\n')) {
    if (line.includes('失败:')) {
      const match = line.match(/失败: (.+?) /);
      if (match) {
        failedFiles.push(match[1]);
      }
    }
  }

  return [...new Set(failedFiles)]; // 去重
}

async function uploadFile(filename: string): Promise<boolean> {
  try {
    const localPath = path.join(IMAGE_BASE_DIR, filename);

    if (!fs.existsSync(localPath)) {
      console.log(`  ⚠️  文件不存在: ${filename}`);
      return false;
    }

    const fileContent = fs.readFileSync(localPath);
    const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: filename,
        Body: fileContent,
        ContentType: contentType,
      })
    );

    return true;
  } catch (error) {
    console.error(`  ✗ 上传失败: ${filename}`, (error as Error).message);
    return false;
  }
}

async function retryUpload() {
  console.log('=== 重新上传失败的 R2 图片 ===\n');

  console.log('1. 读取失败记录...');
  const failedFiles = await getFailedFiles();
  console.log(`找到 ${failedFiles.length} 个失败的文件\n`);

  console.log('2. 开始重新上传...');
  let success = 0;
  let failed = 0;

  for (let i = 0; i < failedFiles.length; i++) {
    const filename = failedFiles[i];
    console.log(`[${i + 1}/${failedFiles.length}] 上传: ${filename}`);

    const result = await uploadFile(filename);
    if (result) {
      success++;
      console.log(`  ✓ 成功`);
    } else {
      failed++;
    }

    // 延迟避免速率限制
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n=== 上传完成 ===');
  console.log(`✓ 成功: ${success}/${failedFiles.length}`);
  console.log(`✗ 失败: ${failed}/${failedFiles.length}`);
}

retryUpload().catch(console.error);

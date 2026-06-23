import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'meme-images';

const IMAGES_DIR = path.join(process.cwd(), 'emo-visual-data/emo');
const BATCH_SIZE = 50; // R2 速度快，可以每批上传更多

console.log('=== Cloudflare R2 图片上传脚本 ===\n');

async function main() {
  // 验证环境变量
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('错误：缺少 R2 配置，请检查 .env 文件');
    console.error('需要：R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  // 初始化 S3 客户端（R2 兼容 S3 API）
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  console.log(`✓ R2 客户端已初始化`);
  console.log(`✓ Bucket: ${R2_BUCKET_NAME}\n`);

  // 获取图片列表
  console.log('1. 扫描图片文件...');
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`错误：图片目录不存在 ${IMAGES_DIR}`);
    process.exit(1);
  }

  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f =>
    f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.gif')
  );

  console.log(`找到 ${imageFiles.length} 个图片文件\n`);

  // 计算总大小
  let totalSize = 0;
  imageFiles.forEach(file => {
    const filePath = path.join(IMAGES_DIR, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
  });
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  console.log(`总大小: ${totalSizeMB} MB\n`);

  // 开始上传
  console.log('2. 开始上传到 R2...\n');
  const batches = Math.ceil(imageFiles.length / BATCH_SIZE);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < batches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min((i + 1) * BATCH_SIZE, imageFiles.length);
    const batchFiles = imageFiles.slice(start, end);

    console.log(`批次 ${i + 1}/${batches}: 上传 ${start + 1}-${end}/${imageFiles.length}`);

    // 并行上传这一批
    const uploadPromises = batchFiles.map(async (file) => {
      const filePath = path.join(IMAGES_DIR, file);
      const fileBuffer = fs.readFileSync(filePath);

      // 确定 Content-Type
      const ext = path.extname(file).toLowerCase();
      const contentTypeMap: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };
      const contentType = contentTypeMap[ext] || 'image/jpeg';

      try {
        const command = new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: file, // R2 中的文件名
          Body: fileBuffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        });

        await s3Client.send(command);
        return { success: true, file };
      } catch (error) {
        console.error(`  ✗ 失败: ${file}`, (error as Error).message);
        return { success: false, file, error };
      }
    });

    const results = await Promise.all(uploadPromises);
    const batchSuccess = results.filter(r => r.success).length;
    const batchFail = results.filter(r => !r.success).length;

    successCount += batchSuccess;
    failCount += batchFail;

    console.log(`  ✓ 成功: ${batchSuccess}/${batchFiles.length}\n`);

    // 显示进度
    const progress = ((end / imageFiles.length) * 100).toFixed(1);
    console.log(`  进度: ${progress}% (${successCount}/${imageFiles.length})\n`);

    // 短暂延迟，避免速率限制
    if (i < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // 完成总结
  console.log('=== 上传完成 ===');
  console.log(`✓ 成功: ${successCount}/${imageFiles.length}`);
  if (failCount > 0) {
    console.log(`✗ 失败: ${failCount}/${imageFiles.length}`);
  }

  console.log('\n图片访问地址示例：');
  console.log(`https://pub-xxxxx.r2.dev/${imageFiles[0]}`);
  console.log('\n请将 "pub-xxxxx" 替换为你的 R2 public URL');

  console.log('\n下一步：运行 npm run update-pinecone-urls-r2');
}

main().catch(error => {
  console.error('错误：', error);
  process.exit(1);
});

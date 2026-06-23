import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'your-username';
const GITHUB_REPO = process.env.GITHUB_REPO || 'meme-images';
const IMAGES_DIR = path.join(process.cwd(), 'emo-visual-data/emo');
const TEMP_REPO_DIR = path.join(process.cwd(), 'temp-github-upload');
const BATCH_SIZE = 200; // 减小批次大小，避免超时

console.log('=== GitHub 图片上传脚本（优化版）===\n');

async function main() {
  console.log('1. 检查图片目录...');
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`错误：图片目录不存在 ${IMAGES_DIR}`);
    process.exit(1);
  }

  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f =>
    f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.gif')
  );

  console.log(`找到 ${imageFiles.length} 个图片文件\n`);

  let totalSize = 0;
  imageFiles.forEach(file => {
    const filePath = path.join(IMAGES_DIR, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
  });
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  console.log(`总大小: ${totalSizeMB} MB\n`);

  console.log(`图片将上传到: https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}`);
  console.log(`CDN 访问地址: https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/${GITHUB_REPO}@main/\n`);

  // 清理并创建临时目录
  console.log('2. 准备临时目录...');
  if (fs.existsSync(TEMP_REPO_DIR)) {
    execSync(`rm -rf "${TEMP_REPO_DIR}"`);
  }
  fs.mkdirSync(TEMP_REPO_DIR, { recursive: true });

  // 初始化仓库
  console.log('3. 初始化 Git 仓库...');
  process.chdir(TEMP_REPO_DIR);

  try {
    execSync(`git clone https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git .`, { stdio: 'pipe' });
    console.log('克隆现有仓库成功');
  } catch (error) {
    console.log('初始化新仓库...');
    execSync('git init', { stdio: 'pipe' });
    execSync('git branch -M main', { stdio: 'pipe' });
    execSync(`git remote add origin https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git`, { stdio: 'pipe' });
  }

  // 创建 images 目录
  const imagesDestDir = path.join(TEMP_REPO_DIR, 'images');
  if (!fs.existsSync(imagesDestDir)) {
    fs.mkdirSync(imagesDestDir, { recursive: true });
  }

  // 分批处理
  console.log(`\n4. 开始上传（每批 ${BATCH_SIZE} 张图片）...\n`);
  const batches = Math.ceil(imageFiles.length / BATCH_SIZE);

  for (let i = 0; i < batches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min((i + 1) * BATCH_SIZE, imageFiles.length);
    const batchFiles = imageFiles.slice(start, end);

    console.log(`批次 ${i + 1}/${batches}: 处理 ${start + 1}-${end}/${imageFiles.length}`);

    // 复制文件
    batchFiles.forEach((file) => {
      const src = path.join(IMAGES_DIR, file);
      const dest = path.join(imagesDestDir, file);
      fs.copyFileSync(src, dest);
    });
    console.log(`  ✓ 已复制 ${batchFiles.length} 个文件`);

    // 提交
    try {
      execSync('git add images/', { stdio: 'pipe' });
      const commitMsg = `Add batch ${i + 1}/${batches} images (${start + 1}-${end})`;
      execSync(`git commit -m "${commitMsg}"`, { stdio: 'pipe' });
      console.log(`  ✓ 已提交`);
    } catch (error) {
      console.log(`  ! 没有新文件需要提交`);
      continue;
    }

    // 推送（带重试）
    let pushSuccess = false;
    for (let retry = 0; retry < 3; retry++) {
      try {
        console.log(`  → 推送到 GitHub (尝试 ${retry + 1}/3)...`);
        execSync('git push -u origin main', {
          stdio: 'pipe',
          timeout: 120000 // 2分钟超时
        });
        console.log(`  ✅ 批次 ${i + 1} 完成\n`);
        pushSuccess = true;
        break;
      } catch (error) {
        console.log(`  ⚠️  推送失败: ${(error as any).message}`);
        if (retry < 2) {
          console.log(`  → 等待 5 秒后重试...`);
          execSync('sleep 5');
        }
      }
    }

    if (!pushSuccess) {
      console.error(`\n❌ 批次 ${i + 1} 推送失败，请手动推送或重新运行脚本`);
      console.log(`当前进度: ${i}/${batches} 批次已完成`);
      process.exit(1);
    }

    // 批次间等待，避免速率限制
    if (i < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 生成 URL 映射文件
  console.log('\n5. 生成 URL 映射...');
  const urlMapping: { [key: string]: string } = {};

  imageFiles.forEach(file => {
    const localPath = path.join(IMAGES_DIR, file);
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/${GITHUB_REPO}@main/images/${file}`;
    urlMapping[localPath] = cdnUrl;
  });

  process.chdir('..');
  const mappingFile = path.join(process.cwd(), 'scripts', 'github-url-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(urlMapping, null, 2));
  console.log(`URL 映射已保存到: ${mappingFile}`);

  console.log('\n=== 上传完成！===');
  console.log(`\n仓库地址: https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}`);
  console.log(`CDN 基础 URL: https://cdn.jsdelivr.net/gh/${GITHUB_USERNAME}/${GITHUB_REPO}@main/images/`);
  console.log('\n下一步：运行 npm run update-pinecone-urls 更新 Pinecone 中的图片 URL');
}

main().catch(error => {
  console.error('错误：', error);
  process.exit(1);
});

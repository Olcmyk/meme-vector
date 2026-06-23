# GitHub 图片托管方案 - 使用指南

## 方案概述

使用 GitHub 仓库存储图片 + jsDelivr CDN 加速访问

### 优势
- ✅ 完全免费
- ✅ 无流量限制
- ✅ 全球 CDN 加速
- ✅ 版本控制

### 成本对比

| 方案 | 存储限制 | 流量限制 | 成本 |
|------|---------|---------|------|
| **GitHub + jsDelivr** | 无限制* | 无限制 | 免费 |
| Vercel Blob | 500MB | 1GB/月 | 免费版 |
| Cloudflare R2 | 10GB | 无限制 | 免费版 |
| AWS S3 | 5GB | 1GB | 免费一年 |

*GitHub 单个仓库推荐不超过 1GB，单文件不超过 100MB

## 实施步骤

### 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建一个新的**公开**仓库（例如：`meme-images`）
3. 不需要添加 README 或其他文件

### 步骤 2：配置环境变量

编辑你的 `.env` 文件，添加：

```bash
GITHUB_USERNAME=你的GitHub用户名
GITHUB_REPO=meme-images
```

### 步骤 3：配置 Git 认证

确保你的本地 Git 已配置认证：

**方法 A：使用 GitHub CLI（推荐）**
```bash
gh auth login
```

**方法 B：使用 Personal Access Token**
```bash
# 访问 https://github.com/settings/tokens
# 创建 token，勾选 'repo' 权限
# 然后配置 git
git config --global credential.helper store
```

### 步骤 4：上传图片到 GitHub

运行上传脚本：

```bash
npm run upload-to-github
```

这个脚本会：
1. ✅ 检查 5329 张图片（约 500MB-1GB）
2. ✅ 分批上传到 GitHub（每批 500 张）
3. ✅ 自动提交和推送
4. ✅ 生成 URL 映射文件

**预计时间**：20-40 分钟（取决于网络速度）

### 步骤 5：更新 Pinecone 元数据

等待数据处理完成（`npm run prepare-data` 完成）后，运行：

```bash
npm run update-pinecone-urls
```

这个脚本会：
1. ✅ 读取所有 Pinecone 向量
2. ✅ 将图片 URL 从本地路径替换为 CDN URL
3. ✅ 批量更新元数据

### 步骤 6：更新前端代码

由于图片现在在 CDN 上，我们可以直接使用 CDN URL，不需要 `/api/image` 端点。

前端会自动使用 Pinecone 返回的 `imageUrl`（已经是 CDN 地址）。

### 步骤 7：测试

1. 重启开发服务器：
```bash
npm run dev
```

2. 访问 http://localhost:3000
3. 搜索测试，图片应该从 CDN 加载

## URL 格式

上传后的图片访问地址：

```
https://cdn.jsdelivr.net/gh/你的用户名/meme-images@main/images/图片ID.jpg
```

例如：
```
https://cdn.jsdelivr.net/gh/booffaoex/meme-images@main/images/000317dc-9047-4d68-bb55-e40c09ed0f9a.jpg
```

## 验证

### 验证 GitHub 上传
访问：`https://github.com/你的用户名/meme-images`

应该看到 `images/` 目录包含所有图片。

### 验证 CDN 访问
在浏览器打开任意图片的 CDN URL，应该能正常显示。

### 验证 Pinecone 更新
运行：
```bash
npm run verify-data
```

检查返回的 `imageUrl` 是否已更新为 CDN 地址。

## 部署到 Vercel

更新后，部署到 Vercel：

1. 推送代码到你的 GitHub 仓库
2. 在 Vercel 导入项目
3. 配置环境变量（只需要 Pinecone 和 SiliconFlow 的 API keys）
4. 部署

**注意**：图片已经在 GitHub CDN 上，Vercel 应用不需要访问本地文件系统。

## 常见问题

### Q: 图片上传失败怎么办？
A: 检查：
- Git 认证是否配置正确
- GitHub 仓库是否为公开
- 网络连接是否稳定

可以重新运行 `npm run upload-to-github`，脚本会从断点继续。

### Q: CDN 更新需要多久？
A: jsDelivr 缓存约 7 天。如果需要立即更新，可以使用：
```
https://purge.jsdelivr.net/gh/用户名/仓库名@main/images/文件名.jpg
```

### Q: GitHub 仓库大小限制？
A: GitHub 建议单个仓库不超过 1GB。你的 5329 张图片约 500MB-1GB，在限制范围内。

### Q: jsDelivr 有流量限制吗？
A: 没有！完全免费且无流量限制。

### Q: 能用自己的域名吗？
A: 可以。在 GitHub Pages 上启用自定义域名，然后使用自己的域名访问。

## 备选方案：GitHub Releases

如果仓库大小接近限制，可以考虑使用 GitHub Releases：

```
https://github.com/用户名/仓库名/releases/download/v1.0/图片.zip
```

解压后通过 jsDelivr 访问。

## 总结

这个方案：
- 💰 完全免费
- 🚀 全球 CDN 加速
- 📦 无流量限制
- 🔒 数据安全（GitHub 可靠）
- 🎯 适合你的场景（5329 张图片，约 500MB-1GB）

开始执行吧！

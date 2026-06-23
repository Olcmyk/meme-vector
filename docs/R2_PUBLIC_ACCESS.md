# 启用 R2 Public Access - 快速指南

## 方法 1：通过 Cloudflare Dashboard

1. **访问你的 bucket**
   https://dash.cloudflare.com/9fc6fb18ed664890a63369d6cf7c5b0a/r2/default/buckets/chinese-meme

2. **启用公开访问**
   - 点击 **Settings** 标签
   - 找到 **R2.dev subdomain** 部分
   - 点击 **Allow Access** 按钮
   - 会生成一个 URL，例如：`https://pub-abc123.r2.dev`

3. **复制公开 URL**
   - 保存这个 URL
   - 图片访问地址将是：`https://pub-xxxxx.r2.dev/图片名.jpg`

4. **告诉我这个 URL**
   - 例如：`https://pub-abc123xyz.r2.dev`
   - 我会更新所有配置

## 方法 2：通过自定义域名（可选，更高级）

如果你有自己的域名，可以配置自定义域名：
1. 在 bucket Settings 中点击 **Custom Domains**
2. 添加你的域名（例如：`images.yourdomain.com`）
3. 在 Cloudflare DNS 中会自动添加记录

---

## 为什么需要 Public Access？

- R2 默认是私有的，需要 API 认证才能访问
- 启用 Public Access 后，图片可以通过公开 URL 直接访问
- 这样前端就可以直接加载图片，无需服务器中转

---

## 配置完成后

告诉我公开 URL，我会：
1. ✅ 等待 R2 上传完成（当前 47.8%）
2. ✅ 更新 Pinecone 中所有向量的 imageUrl
3. ✅ 更新前端代码使用 R2 CDN
4. ✅ 测试完整功能
5. ✅ 准备部署到 Vercel

---

## 快速链接

直接访问你的 bucket 设置页面：
https://dash.cloudflare.com/9fc6fb18ed664890a63369d6cf7c5b0a/r2/default/buckets/chinese-meme/settings

# Cloudflare R2 配置指南

## 步骤 1：注册 Cloudflare 账号

1. 访问：https://dash.cloudflare.com/sign-up
2. 使用邮箱注册（完全免费）
3. 验证邮箱

## 步骤 2：启用 R2

1. 登录后，访问：https://dash.cloudflare.com/
2. 在左侧菜单找到 **R2**
3. 点击 **"Create Bucket"** 或 **"开始使用"**
4. 如果是第一次使用，可能需要绑定支付方式（但不会扣费）

## 步骤 3：创建存储桶（Bucket）

1. 点击 **"Create Bucket"**
2. 填写：
   - **Bucket Name**: `meme-images`（或其他名称）
   - **Location**: 选择 `Automatic`（自动选择最近区域）
3. 点击 **Create Bucket**

## 步骤 4：获取 API Credentials

### 4.1 创建 API Token

1. 在 R2 页面，点击右上角 **"Manage R2 API Tokens"**
2. 点击 **"Create API Token"**
3. 填写：
   - **Token Name**: `meme-upload`
   - **Permissions**: 选择 **"Admin Read & Write"**
   - **Bucket Scope**: 选择你刚创建的 bucket（`meme-images`）
4. 点击 **Create API Token**

### 4.2 保存凭证

创建后会显示 3 个重要信息：
- **Access Key ID**：类似 `abc123...`
- **Secret Access Key**：类似 `xyz789...`（只显示一次，务必保存！）
- **Endpoint URL**：类似 `https://abc123.r2.cloudflarestorage.com`

## 步骤 5：配置环境变量

将上述信息添加到项目的 `.env` 文件：

```bash
# Cloudflare R2 配置
R2_ACCOUNT_ID=你的账号ID
R2_ACCESS_KEY_ID=上面的Access_Key_ID
R2_SECRET_ACCESS_KEY=上面的Secret_Access_Key
R2_BUCKET_NAME=meme-images
```

**如何获取 Account ID**：
1. 在 Cloudflare Dashboard 右上角，点击你的头像
2. 在侧边栏可以看到 **Account ID**

## 步骤 6：配置公开访问（Public URL）

1. 进入你的 bucket：`meme-images`
2. 点击 **Settings** 标签
3. 找到 **Public Access** 部分
4. 点击 **"Allow Access"** 或 **"Connect Domain"**

有两种方式：

### 方式 A：使用 R2.dev 子域（推荐，最简单）
1. 点击 **"Allow Access"**
2. 会生成一个公开 URL：`https://pub-xxxxx.r2.dev`
3. 图片访问地址：`https://pub-xxxxx.r2.dev/图片名.jpg`

### 方式 B：自定义域名
1. 需要有自己的域名
2. 在 Cloudflare 添加 DNS 记录
3. 例如：`https://images.yourdomain.com/图片名.jpg`

## 步骤 7：测试上传

完成上述步骤后，告诉我：
- ✅ Bucket 已创建
- ✅ API Token 已获取
- ✅ 环境变量已配置
- ✅ Public URL 已启用

我会立即运行上传脚本！

---

## 💰 费用说明

### 免费额度（每月）
- ✅ 存储：10 GB
- ✅ 出站流量：无限制（完全免费！）
- ✅ Class A 操作：100万次（上传、列表）
- ✅ Class B 操作：1000万次（下载）

### 你的使用情况
- 存储：1.3 GB（在免费额度内）
- 出站流量：无限制
- 操作次数：5330 次上传（远低于 100 万）

**结论：完全免费！**

---

## 📝 快速链接

- Cloudflare Dashboard: https://dash.cloudflare.com/
- R2 文档: https://developers.cloudflare.com/r2/
- R2 定价: https://developers.cloudflare.com/r2/pricing/

---

按照上述步骤操作后，把以下信息告诉我：
1. R2 Bucket 名称
2. Public URL（r2.dev 地址）
3. 环境变量已配置完成

我会立即开始上传！

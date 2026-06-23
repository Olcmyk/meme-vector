# 中文表情包向量搜索工具

使用 AI 语义搜索技术，帮助用户通过自然语言描述（如"一只开心的猫"）快速找到相关的表情包。

## 技术栈

- **前端框架**: Next.js 15 + React 19 + TypeScript
- **样式**: Tailwind CSS
- **向量数据库**: Pinecone
- **向量嵌入模型**: Qwen3-VL-Embedding-8B（通过硅基流动 API）
- **数据来源**: emo-visual-data (5329 个表情包)

## 功能特性

- 🔍 **智能语义搜索**: 使用 AI 理解搜索意图，而不是简单的关键词匹配
- 🚀 **快速响应**: 向量检索技术提供毫秒级搜索速度
- 📱 **响应式设计**: 完美适配手机、平板和桌面设备
- 💾 **一键复制/下载**: 方便快捷地保存表情包
- 🎯 **相似度评分**: 显示搜索结果的匹配程度

## 项目结构

```
.
├── app/                      # Next.js 应用目录
│   ├── api/search/          # 搜索 API 端点
│   ├── page.tsx             # 主页面
│   ├── layout.tsx           # 布局组件
│   └── globals.css          # 全局样式
├── components/              # React 组件
│   ├── SearchBar.tsx        # 搜索框
│   ├── MemeCard.tsx         # 表情包卡片
│   ├── MemeGrid.tsx         # 表情包网格
│   ├── LoadingState.tsx     # 加载状态
│   └── EmptyState.tsx       # 空状态
├── lib/                     # 工具库
│   ├── types.ts            # TypeScript 类型定义
│   ├── embedding.ts        # 向量嵌入生成
│   └── pinecone.ts         # Pinecone 客户端
├── scripts/                 # 数据处理脚本
│   ├── prepare-data.ts     # 数据准备主脚本
│   ├── verify-data.ts      # 数据验证脚本
│   └── lib/                # 脚本工具库
├── emo-visual-data/         # 表情包数据集
└── docs/                    # 设计文档和计划
```

## 安装和运行

### 前置要求

- Node.js 18+
- npm 或 yarn
- Pinecone 账号和 API key
- 硅基流动账号和 API key

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的 API keys：
```env
PINECONE_API_KEY=你的Pinecone密钥
PINECONE_INDEX_NAME=meme-search
SILICONFLOW_API_KEY=你的硅基流动密钥
```

### 安装依赖

```bash
npm install
```

### 数据准备

首次运行需要处理表情包数据并上传到 Pinecone（约需要 1-2 小时）：

```bash
npm run prepare-data
```

该脚本会：
1. 读取 emo-visual-data 数据集
2. 为每个表情包的描述生成向量嵌入
3. 批量上传到 Pinecone 向量数据库
4. 支持断点续传（如果中断可以继续）

处理进度保存在 `scripts/progress.json`，失败记录保存在 `scripts/failed.log`。

### 验证数据

数据准备完成后，可以验证：

```bash
npm run verify-data
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可使用。

### 构建生产版本

```bash
npm run build
npm start
```

## Vercel 部署

### 步骤

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（与 `.env` 相同）
4. 部署

### 注意事项

- 确保 Pinecone 索引已经创建并包含数据
- 数据准备脚本只需在本地运行一次，不需要在 Vercel 上运行
- Vercel 免费版足够支持中等流量

## API 使用

### 搜索端点

```
GET /api/search?q={查询文本}&limit={结果数量}
```

**参数**:
- `q` (必需): 搜索查询文本
- `limit` (可选): 返回结果数量，默认 20

**响应**:
```json
{
  "success": true,
  "results": [
    {
      "id": "meme_00001",
      "imageUrl": "/path/to/image.jpg",
      "description": "表情包描述",
      "score": 0.85
    }
  ],
  "total": 20
}
```

## 性能优化

- ✅ 搜索输入防抖（500ms）
- ✅ Next.js Image 组件优化图片加载
- ✅ 响应式图片尺寸
- ✅ 批量向量上传
- ✅ 断点续传支持

## 成本估算

### 数据准备（一次性）
- 硅基流动 API: ~5329 次调用
- Pinecone: 免费额度内

### 运行时（每次搜索）
- 硅基流动 API: 1 次调用
- Pinecone: 1 次查询

对于中等流量（每天几百到几千次搜索），月成本预计在可控范围内。

## 故障排除

### 数据准备失败

如果数据准备中断：
1. 检查 `scripts/failed.log` 查看失败原因
2. 脚本支持断点续传，直接重新运行即可
3. 如需重新开始，删除 `scripts/progress.json`

### 搜索无结果

1. 确认 Pinecone 索引中有数据（运行 `npm run verify-data`）
2. 检查环境变量配置
3. 查看浏览器控制台和服务器日志

### API 错误

1. 确认 API keys 正确
2. 检查 API 配额是否用完
3. 查看具体错误信息

## 开发路线图

- [ ] 添加搜索历史（本地存储）
- [ ] 支持分类筛选
- [ ] 添加热门搜索词
- [ ] 优化移动端体验
- [ ] 添加更多数据源

## 许可证

MIT

## 致谢

- 数据来源: [emo-visual-data](https://github.com/LLM-Red-Team/emo-visual-data)
- 向量模型: Qwen3-VL-Embedding-8B by Alibaba Cloud
- 向量数据库: Pinecone

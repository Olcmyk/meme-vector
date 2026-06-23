# 中文表情包向量搜索工具

使用 AI 语义搜索技术，帮助用户通过自然语言描述（如"一只开心的猫"）快速找到相关的表情包。

## 技术栈

- **前端框架**: Next.js 15 + React 19 + TypeScript
- **样式**: Tailwind CSS
- **向量数据库**: Pinecone
- **向量嵌入模型**: Qwen3-VL-Embedding-8B（通过硅基流动 API）
- **图片存储**: Cloudflare R2
- **数据来源**: emo-visual-data (4728 个表情包)

## 项目结构

```
.
├── app/                      # Next.js 应用目录
│   ├── api/
│   │   ├── search/          # 搜索 API 端点
│   │   └── image-proxy/     # 图片代理 API
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
│   ├── upload-to-r2.ts     # 上传图片到 R2
│   └── lib/                # 脚本工具库
├── emo-visual-data/         # 表情包数据集
└── docs/                    # 文档
```

## 许可证

MIT

## 致谢

- 数据来源: [emo-visual-data](https://github.com/LLM-Red-Team/emo-visual-data)
- 向量模型: Qwen3-VL-Embedding-8B by Alibaba Cloud
- 向量数据库: Pinecone
- 图片存储: Cloudflare R2

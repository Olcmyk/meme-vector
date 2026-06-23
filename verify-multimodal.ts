import dotenv from 'dotenv';
dotenv.config();

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY!;
const API_URL = 'https://api.siliconflow.cn/v1/embeddings';

async function verifyMultimodal() {
  const imageUrl = 'https://pub-1bf96c57b58640b4ac0cbd9216d5c474.r2.dev/000317dc-9047-4d68-bb55-e40c09ed0f9a.jpg';
  const text = '这个表情包展示了两只水豚，它们的表情看起来很是严肃';
  
  // 这是代码中实际发送的格式
  const input = [imageUrl, text];
  
  console.log('发送到 API 的数据:');
  console.log(JSON.stringify({
    model: 'Qwen/Qwen3-VL-Embedding-8B',
    input: input,
    encoding_format: 'float',
  }, null, 2));
  
  console.log('\n调用 API...');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen3-VL-Embedding-8B',
      input: input,
      encoding_format: 'float',
    }),
  });
  
  const data = await response.json();
  console.log('\nAPI 响应:');
  console.log('- 状态:', response.status);
  console.log('- 向量维度:', data.data?.[0]?.embedding?.length);
  console.log('- 成功:', !!data.data?.[0]?.embedding);
}

verifyMultimodal();

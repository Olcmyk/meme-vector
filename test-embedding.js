const dotenv = require('dotenv');
dotenv.config();

async function testEmbedding() {
  const response = await fetch('https://api.siliconflow.cn/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen3-VL-Embedding-8B',
      input: '测试文本：一只开心的猫',
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    console.error('Status:', response.status);
    console.error('Error:', await response.text());
    process.exit(1);
  }

  const data = await response.json();
  console.log('✅ Success! Embedding dimension:', data.data[0].embedding.length);
  console.log('First 10 values:', data.data[0].embedding.slice(0, 10));
}

testEmbedding().catch(console.error);

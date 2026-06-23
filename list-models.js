const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
  const response = await fetch('https://api.siliconflow.cn/v1/models', {
    headers: {
      'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
    },
  });

  if (!response.ok) {
    console.error('Error:', await response.text());
    process.exit(1);
  }

  const data = await response.json();
  console.log('Available embedding models:');
  data.data
    .filter(m => m.id.toLowerCase().includes('embed'))
    .forEach(m => console.log('  -', m.id));
}

listModels().catch(console.error);

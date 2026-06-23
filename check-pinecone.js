const { Pinecone } = require('@pinecone-database/pinecone');
const dotenv = require('dotenv');
dotenv.config();

async function checkPinecone() {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  
  console.log('Listing all indexes...');
  const indexes = await pc.listIndexes();
  console.log('Indexes:', JSON.stringify(indexes, null, 2));
  
  if (indexes.indexes && indexes.indexes.length > 0) {
    console.log('\nFound indexes:');
    indexes.indexes.forEach(idx => {
      console.log(`  - ${idx.name} (${idx.dimension} dimensions, ${idx.metric} metric)`);
      console.log(`    Status: ${idx.status?.ready ? 'Ready' : 'Not ready'}`);
      console.log(`    Host: ${idx.host}`);
    });
  } else {
    console.log('\nNo indexes found!');
  }
}

checkPinecone().catch(console.error);

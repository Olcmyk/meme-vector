const { Pinecone } = require('@pinecone-database/pinecone');
const dotenv = require('dotenv');
dotenv.config();

async function testQuery() {
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index('meme-search');
    
    console.log('Getting index stats...');
    const stats = await index.describeIndexStats();
    console.log('Stats:', JSON.stringify(stats, null, 2));
    
    console.log('\nSuccess! Index is accessible.');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
      if (error.cause.cause) {
        console.error('Root cause:', error.cause.cause.message);
      }
    }
  }
}

testQuery();

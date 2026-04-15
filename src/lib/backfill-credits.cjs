const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://rugvedpathe1509_db_user:34EDH50W81mlrQJT@cluster0.ojivzqg.mongodb.net/getmegig?retryWrites=true&w=majority';

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('getmegig');
  
  const result = await db.collection('venues').updateMany(
    { freeGigsRemaining: { $exists: false } },
    { $set: { freeGigsRemaining: 3 } }
  );
  
  console.log(`Updated ${result.modifiedCount} existing venues with freeGigsRemaining: 3`);
  await client.close();
})();

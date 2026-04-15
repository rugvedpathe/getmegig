import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  tls: true,
};

let client;
let clientPromise;

function getClientPromise() {
  if (!uri) {
    throw new Error(
      'Please add your MongoDB URI to .env.local\n' +
      'Get it from: mongodb.com/atlas → Connect → Drivers'
    );
  }

  if (process.env.NODE_ENV === 'development') {
    // In development, use a global variable so the MongoClient
    // is not constantly re-created on hot reloads
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    // In production, create a new client for each instance
    client = new MongoClient(uri, options);
    return client.connect();
  }
}

// Helper to get the database — only connects when actually called
export async function getDb() {
  if (!clientPromise) {
    clientPromise = getClientPromise();
  }
  const client = await clientPromise;
  return client.db('getmegig');
}

export default { getDb };

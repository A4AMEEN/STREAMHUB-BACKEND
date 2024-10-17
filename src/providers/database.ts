import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  const uri = process.env.DATABASE_URI as string;

  // Log the URI for debugging
  console.log('Connecting to MongoDB using URI:', uri); 

  // Ensure that uri is defined
  if (!uri) {
    console.error('DATABASE_URI is undefined. Please check your .env file.');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
};

export default connectDB;

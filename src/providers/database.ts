import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('MONGODB_ATLAS_URI:', process.env.DATABASE_URI);
    
    if (!process.env.DATABASE_URI) {
      throw new Error('MONGODB_ATLAS_URI is not defined in the environment variables');
    }

    await mongoose.connect(process.env.DATABASE_URI);
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err);
    process.exit(1);
  }
};

export default connectDB;
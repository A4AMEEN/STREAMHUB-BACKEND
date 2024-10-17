import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI as string);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Failed to connect to MongoDB:');
    process.exit(1);
  }
};

export default connectDB;

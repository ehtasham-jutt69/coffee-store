import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coffee_store';

  try {
    // Attempt standard connection with 2.5s timeout
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to: ${mongoURI}`);
  } catch (err: any) {
    console.warn(`[Database] Local MongoDB not reachable (${err.message}). Launching high-performance in-memory MongoDB instance...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      isConnected = true;
      console.log(`[Database] Embedded in-memory MongoDB connected successfully at: ${memoryUri}`);
    } catch (fallbackError: any) {
      console.error(`[Database] Failed to start MongoDB fallback:`, fallbackError.message);
      throw fallbackError;
    }
  }
};

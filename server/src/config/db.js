import mongoose from 'mongoose';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  return conn;
}

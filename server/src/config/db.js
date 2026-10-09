import mongoose from 'mongoose';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    // This block executes if the connection is successful
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`MongoDB connected: ${conn.connection.host}`);
  })
  .catch((error) => {
    // This block executes if there’s an error during connection
    console.error('❌ Error connecting to MongoDB Atlas:', error);
  })
  
}

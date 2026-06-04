import mongoose from 'mongoose';

/**
 * Connect to MongoDB using Mongoose.
 * Exits the process on a hard connection failure so the app never runs
 * in a half-broken state.
 */
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

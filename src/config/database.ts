import mongoose from 'mongoose';

let connected = false;

export default async function connectDB() {
  // mongoose.set("strictQuery", true);

  if (connected) {
    console.log(`MongoDB already connected`);
    return;
  }

  try {
    console.log(`Connecting to MongoDB ${process.env.MONGODB_URI}`);
    await mongoose.connect(process.env.MONGODB_URI ?? "");
    connected = true;
  } catch (error) {
    console.log(`Error connecting to MongoDB: ${error}`);
  }
}

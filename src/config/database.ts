'use server'
import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";


dotenv.config();
let connected = false;

export default async function connectDB() {
  mongoose.set("strictQuery", true);

  if (connected) {
    console.log(`MongoDB already connected`);
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI ?? "");
    connected = true;
  } catch (error) {
    console.log(`Error connecting to MongoDB: ${error}`);
  }
}

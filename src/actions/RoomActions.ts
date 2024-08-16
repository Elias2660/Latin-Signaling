"use server";
import Room from "@/models/Room";
import connectDB from "@/config/database";

export async function getRoomInfo(roomID: string): Promise<typeof Room | null> {
  try {
    await connectDB();
    const room = await Room.findOne({ login_code: roomID });
    if (room === null || room === undefined) {
      return room;
    }
  } catch (error) {
    console.error("Error getting room info:", error);
  }
  return null;
}

export async function isRoom(roomID: string): Promise<boolean> {
  try {
    await connectDB();
    const room = await Room.findOne({ login_code: roomID });
    return room !== null && room !== undefined;
  } catch (error) {
    console.error("Error checking if room exists:", error);
  }
  return false;
}

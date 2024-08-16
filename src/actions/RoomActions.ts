"use server";
import Room from "@/models/Room";


export async function getRoomInfo(roomID: string): Promise<typeof Room | null> {
  try {
    const room = await Room.findOne({login_code: roomID});
    if (room === null || room === undefined) {
      return room;
    }
  } catch (error) {
    console.error("Error getting room info:", error);
  }
  return null;
}

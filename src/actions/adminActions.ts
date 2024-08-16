"use server";
import connectDB from "@/config/database";
import User from "@/models/User";
import Room from "@/models/Room";
import getSessionUser from "@/utils/getServerSession";

export async function isAdmin(roomID: string): Promise<boolean> {
  // given a room id and user id, check if the user is an admin of the room
  try {
    await connectDB();
    const r = await Room.findOne({ login_code: roomID });
    if (r === null || r === undefined) {
      return false;
    }
    const user = await getSessionUser();
    if (user === null) {
      console.error("User not found");
      return false;
    }
    const userID = user.id;
    return r.admin.includes(userID);
  } catch (error) {
    console.error("Error checking if user is admin:", error);
  }
  return false;
}

export async function addAdmin(roomID: string, adminData: string[]) {
  // given a room id, add the specific user as admin to the room
}

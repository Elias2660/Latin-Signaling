"use server";
import connectDB from "@/config/database";
import Room from "@/models/Room";
import User from "@/models/User";
import getSessionUser from "@/utils/getServerSession";
import { getSession } from "next-auth/react";

export async function isRoomAdmin(roomID: string): Promise<boolean> {
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

export async function isAdmin(): Promise<boolean> {
  // given a user id, check if the user is an admin
  try {
    await connectDB();
    const user = await getSessionUser();
    if (user === null) {
      console.error("User not found");
      return false;
    }
    const isAdmin = await User.findOne({ _id: user.id, admin: true });
    if (!isAdmin) {
      console.error("User is not an admin");
    }
    return isAdmin;
  } catch (error) {
    console.error("Error checking if user is admin:", error);
  }
  return false;
}

export async function addAdmintoRoom(roomID: string, adminData: string[]) {
  // given a room id, add the specific user as admin to the room
}

export async function makeAdmin(userID: string) {
  // given a user id, make the user an admin
  try {
    await connectDB();
    const user = await User.findOne({ _id: userID });
    if (user === null) {
      console.error("User not found");
      return false;
    }
    user.admin = true;
    await user.save();
  } catch (error) {
    console.error("Error making user admin:", error);
  }
}

export async function clearGameInfo() {
  // given a user id, clear the user's game information
  try {
    await connectDB();
    const userData = await getSessionUser();
    if (userData === null || userData === undefined) {
      console.error("User not found");
      return false;
    }
    const user = await User.findOne({ _id: userData.id });
    if (user === null) {
      console.error("User not found");
      return false;
    }
    user.game_info = {};
    await user.save();
  } catch (error) {
    console.error("Error clearing game info:", error);
  }
}

"use server";
import Room from "@/models/Room";
import connectDB from "@/config/database";
import User from "@/models/User";
import getSessionUser from "@/utils/getServerSession";
import { isRoomAdmin } from "./adminActions";

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

export async function getRoomMembers(roomID: string) {
  // get the members of a room
  try {
    await connectDB();
    const room = await Room.findOne({ login_code: roomID });
    if (room === null || room === undefined) {
      console.error("Room not found");
      return [];
    }
    return room.members;
  } catch (error) {
    console.error("Error getting room members:", error);
  }
  return null;
}

// room members should add a role and team object, leaving set as a string for now
interface GameInfo {
  role: string;
  team: string;
  currentRoom: string;
}

export async function addRoomMember(roomID: string) {
  // add a user member to a room
  try {
    await connectDB();
    const room = await Room.findOne({ login_code: roomID });
    const userInfo = await getSessionUser();
    const adminOfRoom = await isRoomAdmin(roomID);
    if (room === null || room === undefined) {
      console.error("Room not found");
      return false;
    }
    if (userInfo === null || userInfo === undefined) {
      console.error("User not found");
      return false;
    }
    if (userInfo === null || userInfo === undefined) {
      console.error("User not found");
      return false;
    }

    const user = await User.findOne({ _id: userInfo.id });

    if (room === null || room === undefined) {
      console.error("Room not found");
      return false;
    }
    const gameInfo = {
      role: adminOfRoom ? "admin" : "player",
      team: "none",
      currentRoom: roomID,
    };

    room.member.push(user);
    await room.save();

    user.gameInfo = gameInfo;
    await user.save();
  } catch (error) {
    console.error("Error adding room member:", error);
  }
}

export async function addMemberToTeam(
  teamName: string,
  memberName: string,
  roomID: string
) {
  // remove a member from a room
}

export async function removeRoomMember() {
  // remove a member from a room
}

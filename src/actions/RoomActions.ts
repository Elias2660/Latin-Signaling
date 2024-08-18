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

export async function addRoomMember(roomID: string, name: string, role: string, team: string) {
  // add a member to a room
  try {
    await connectDB();
    const room = await Room.findOne({ login_code: roomID });

    if (room === null || room === undefined) {
      console.error("Room not found");
      return false;
    }
    room.members.push({ name, role, team });
    await room.save();
  } catch (error) {
    console.error("Error adding room member:", error);
  }
}

export async function addMemberToTeam() {
  // remove a member from a room
}

export async function removeRoomMember() {
  // remove a member from a room
}
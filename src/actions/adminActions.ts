"use server"
import connectDB from "@/config/database";
import User from "@/models/User";
import Room from "@/models/Room";

export async function isAdmin(roomID: string, userID: string) {
    // given a room id and user id, check if the user is an admin of the room
    try {
        await connectDB();
        const r = await Room.findOne({login_code: roomID });
        if (r === null || r === undefined) {
            return false;
        }
        return r.admin.includes(userID);
    } catch (error) {
        console.error("Error checking if user is admin:", error);
    }
    return false;
}

export async function addAdmin(roomID: string, adminData: string[]) {
    // given a room id, add the specific user as admin to the room
}
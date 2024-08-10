"use server"
import connectDB from "@/config/database";
import User from "@/models/User";
import Room from "@/models/Room";

export default async function addAdmin(roomID: string, adminData: string[]) {
    // given a room id, add the specific user as admin to the room
    

}
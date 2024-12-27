"use server";
import connectDB from "@/config/database";
import Room from "@/models/Room";
import { redirect } from "next/navigation";

export default async function redirectIfNotValid(roomid: string) {
  // searches through the database to check if the room exists
  let room;
  try {
    await connectDB();
    console.log("Checking if room exists:", roomid);
    // iterate through all rooms to check if the room exists
    room = await Room.findOne({ login_code: roomid });
    // make sure room is not undefined
  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    if (room === null || room === undefined) {
      console.log("Room not found:", roomid);
      redirect("/rooms/join");
    }
  }
}

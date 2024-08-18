"use server";
import connectDB from "@/config/database";
import Room from "@/models/Room";
import User from "@/models/User";
import getSessionUser from "@/utils/getServerSession";
import { redirect } from "next/navigation";
export default async function removeRoom(roomid: string) {
  // removes the room if it exists
  try {
    await connectDB();
    // find the room and delete it
    const room = await Room.findOne({ login_code: roomid });
    console.log(room);
    if (room == undefined || room === null) {
      console.log(`Roomid ${roomid} not found`);
    } else {
      console.log("Removing room:", roomid);
      await Room.deleteOne({ login_code: roomid });
      // remove the room from the user's account
      const user = await getSessionUser();
      if (user === null) {
        console.error("User not found");
        return false;
      }

      const userRecord = await User.findOne({ _id: user.id }, "hosted_rooms");
      console.log(`userRecord: ${userRecord}`);
      const userRooms = userRecord?.rooms || [];
      console.log(`userRooms: ${userRooms}`);
      if (!Array.isArray(userRooms)) {
        console.log("User rooms is not an array!!");
        return false;
      }
      await User.updateOne(
        { _id: user.id },
        { hosted_rooms: userRooms.filter((r: string) => r !== roomid) }
      );
      const updatedUser = await User.findOne({ _id: user.id }); 
      console.log("User after updating rooms:", updatedUser);
    }
  } catch (error) {
    console.error("Error removing room:", error);
  } finally {
    redirect("/rooms/join");
  }
}

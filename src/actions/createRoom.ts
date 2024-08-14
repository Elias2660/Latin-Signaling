"use server";
import connectDB from "@/config/database";
import User from "@/models/User";
import Room from "@/models/Room";
import getSessionUser from "@/utils/getServerSession";

export default async function createRoom() {
  // create a room and add it to the mongodb database
  try {
    const user = await getSessionUser();
    if (user === null) {
      console.error("User not found");
      return false;
    }
    const isAdmin = await User.findOne({ _id: user.id, admin: true });
    if (!isAdmin) {
      // only admin can create rooms
      console.error("User is not an admin");
      return false;
    }

    await connectDB();
    let joinID = Math.random().toString(36).substring(7);
    const rooms = await Room.find({}, "login_code"); // Fetch only the login_code field
    const loginCodes = rooms.map((room) => room.login_code);
    while (loginCodes.includes(joinID)) {
      // make sure that the login code is unique
      joinID = Math.random().toString(36).substring(7);
    }

    // create a new room
    const newRoom = new Room({
      name: `Room ${joinID}`,
      login_code: joinID,
      // the admin should be the user who created the room
      admin: [ `${user.id}` ],
    });

    // save the room to the user's account
    const userRooms = await User.findOne({ _id: user.id }, "hosted_rooms");
    // update the user's rooms
    await User.updateOne({ _id: user.id }, { rooms: [ ...userRooms, joinID ] });

    newRoom.save();
    console.log("Room created:", joinID);
    return joinID; // return true if successful
  } catch (error) {
    console.error("Error creating room:", error);
  }
  return null;
}

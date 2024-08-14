"use server";
import connectDB from "@/config/database";
import User from "@/models/User";
import getSessionUser from "@/utils/getServerSession";

export default async function getListOfHost(): Promise<string[] | null> {
  // get a list of all the users who are hosts
  console.log("Getting list of hosts");
  try {
    await connectDB();
    let usr = await getSessionUser();
    console.log(usr);
    if (usr === null) {
      return null;
    }
    // get the hosted_rooms with the id of the user
    const usrRooms = await User.findOne({ _id: usr.id }, "hosted_rooms");
    const rooms = usrRooms?.hosted_rooms || [];
    return rooms;
  } catch (error) {
    console.error("Error getting list of hosts:", error);
  }
  return null;
}

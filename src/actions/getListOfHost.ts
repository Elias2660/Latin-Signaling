"use server";
import connectDB from "@/config/database";
import User from "@/models/User";
import getSessionUser from "@/utils/getServerSession";

export default async function getListOfHost(): Promise<[String] | null> {
  // get a list of all the users who are hosts
  try {
    await connectDB();
    let usr = await getSessionUser();
    if (usr === null) {
      console.error("User not found");
      return null;
    }
    // get the hosted_rooms with the id of the user
    const rooms = await User.findOne({ _id: usr.id }, "hosted_rooms");
    return rooms;
  } catch (error) {
    console.error("Error getting list of hosts:", error);
  }
  return null;
}

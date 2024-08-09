"use server";
import connectDB from "@/config/database";
import User from "@/models/User";
import getSessionUser from "@/utils/getServerSession";

export default async function getList(): Promise<string[]> {
  let objectList = [];
  try {
    await connectDB();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.id) {
      console.log("User not found");
      throw new Error("User not found");
    }
    //   get the list of objects from the user

    const userID = sessionUser.id;
    try {
      const user = await User.findOne({ _id: userID });
      const list = user ? user.objectList : [];

      if (list) {
        objectList = list;
      }
    } catch (error) {
      console.error("Error getting user:", error);
    }
  } catch (error) {
    console.error("Error getting list:", error);
  }
  return objectList;
}

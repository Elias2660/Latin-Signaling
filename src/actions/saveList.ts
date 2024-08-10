"use server";
import connectDB from "@/config/database";
import User from "@/models/User";
import getSessionUser from "@/utils/getServerSession";
import { revalidatePath } from "next/cache";
import { isArray, isString } from "lodash";

export default async function saveList(listData: string[]) {
  try {
    await connectDB();
    console.log("Input listData:", listData);
    const sessionUser = await getSessionUser();
    console.log("Session user ID:", sessionUser?.id);
    if (!sessionUser || !sessionUser.id) {
      throw new Error("User not found");
    }
    if (!isArray(listData) || !listData.every(isString)) {
      throw new Error("Invalid input data");
    }

    const userID = sessionUser.id;

    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userID },
        { $set: { objectList: listData } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("User not found or update failed");
      }
      console.log("Updated user:", updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }

    revalidatePath("/", "layout");
    // redirect("/");
  } catch (error) {
    console.error("Error saving list:", error);
  }
}

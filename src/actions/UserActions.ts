"user server";
import connectDB from "@/config/database";
import User from "@/models/User";

export async function getUser(userID: string) {
  try {
    await connectDB();
    const user = await User.findOne({ _id: userID });
    if (user === null) {
      console.error("User not found");
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
  }
  return null;
}

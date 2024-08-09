import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export default async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return null;
    }
    return {
      user: session.user,
      id: session.user.id,
    };
}

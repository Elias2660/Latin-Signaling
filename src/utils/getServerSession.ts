"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

interface user {
  email: string;
  id: string;
  image: string;
  name: string;
}

export default async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return null;
  }
  return {
    user: (session.user as user),
    id: session.user.id as string,
  };
}

"use server";
import { redirect } from "next/navigation";

export async function clientRedirect(path: string) {
  try {
    console.log("path: ", path);
    if (typeof window !== 'undefined') {
      redirect(path.toString().trim());
    } else {
      console.warn("Redirection is not allowed in this environment.");
    }
  } catch (error) {
    console.error("Error redirecting:", error);
  }
}
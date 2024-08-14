"use client"
import { useEffect, useState } from "react";
import connectDB from "@/config/database"
import { signIn, signOut, useSession, getProviders } from "next-auth/react"
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  console.log(session)

  const [providers, setProviders] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const setupDB = async () => {
      await connectDB();
    }
    setupDB()
  }, [])

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      console.log(`Providers: ${res}`)
      setProviders(res);
    }
    setAuthProviders()
  }, [])

  return (
    <main className="m-3">

      {!session && providers && Object.values(providers).map((provider, index) => {
        return (
          <button type="button"
            key={index}
            onClick={() => signIn(provider.id)}
            className=" text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Log in to {provider.id}</button>
        );
      })}

      {session && <button type="button"
        onClick={() => signOut()}
        className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Log out</button>
      }

      <Link href="/rooms/join" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Go to Join Page</Link>

    </main>


  );
}

"use client"
import { useEffect, useState } from "react";
import socket  from "../socket";
import connectDB from "@/config/database"
import { signIn, signOut, useSession, getProviders } from "next-auth/react"
import Image from "next/image";
import defaultImg from "/public/default.jpg"
import saveList from "@/actions/saveList";
import getList from "@/actions/getList";

export default function Home() {
  const { data: session } = useSession();
  console.log(session)

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [itemList, updateItemList] = useState<string[]>([]);
  const [toServer, updateToServer] = useState("");
  const [fromServer, updateFromServer] = useState("");
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

  console.log(`Logged Providers: ${providers}`)

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect(): void {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
      console.log(`${socket.id?.substring(0, 2)} is connected`);
    }

    function onDisconnect(): void {
      setIsConnected(false);
      setTransport("N/A");
    }

    function onCreate(text: string): void {
      console.log("Thing about to be created");
      updateItemList(previous => [...previous, text]);
      console.log(`message received: ${text}`);
    }

    function onClear(): void {
      updateItemList([]);
    }

    function onPing(toServer: number, fromServer: number): void {
      updateToServer((toServer).toString());
      updateFromServer((Date.now() - fromServer).toString());
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("create", onCreate);
    socket.on("ping", onPing);

    socket.on("clear", onClear);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("create", onCreate);
      socket.off("clear", onClear);
      socket.off("ping", onPing);
    };
  }, [itemList]);


  useEffect(() => {
    const timeout = setInterval(() => {
      if (socket.connected) {
        socket.emit("timecheck", Date.now());
        // console.log("Checking the ping");
      } else {
        updateToServer("-");
        updateFromServer("-")
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);



  function sendMessage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    const text = (document.querySelector("input") as HTMLInputElement).value;
    socket.emit('message', text);
    updateItemList([...itemList, text])
  }

  function clearList(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    socket.emit("clear")
    console.log("Text Cleared")
    updateItemList([])
  }

  useEffect(() => {
    const fetchList = async () => {
      if (session) {
        const response = await getList();
        updateItemList(response);
      }
    };
    fetchList();
  }, [session]);

  // save the list when stuff happens
  useEffect(() => {
    const SaveList = async () => {
      if (itemList.length !== 0 && session) {
        await saveList(itemList)
        console.log("Saved List")
      }
    }
    SaveList();
  }, [itemList])

  let profileImage = session?.user?.image

  return (
    <main className="m-3">
      {session && <button type="button"
        onClick={() => signOut()}
        className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Log out</button>
      }

      {!session && providers && Object.values(providers).map((provider, index) => {
        return (
          <button type="button"
            key={index}
            onClick={() => signIn(provider.id)}
            className=" text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Log in to {provider.id}</button>
        );
      })}
      <div>

        <Image className="rounded-full" src={profileImage || defaultImg} width={160} height={160} alt="profile pic" priority={false} />

        <p> User is {!session && "not"} logged in </p>
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        <p>Transport: {transport}</p>
        <p>
          Time to reach server: {toServer} ms
        </p>

        <p>
          Time to come back from server: {fromServer} ms
        </p>

        <p>
          messages:
        </p>
        <ol>
          {itemList.map(
            (x, index) => <li key={index}> {x} </li>
          )}
        </ol>

        <input id="fillbox" placeholder="message" className="text-stone-800	bg-red-300 border-spacing-2 rounded-md p-3" />

        <button onClick={sendMessage} type='submit' className="bg-green-400 rounded-md border-spacing-2 p-3 m-3" > send </button>

        <button onClick={clearList} className="bg-red-500 rounded-md border-spacing-2 p-3 m-3"> clear</button>
        {session && <button onClick={async () => await saveList(itemList)} className="bg-orange-200 rounded-md border-spacing-2 p-3 m-3"> save list</button>}
      </div>
    </main>
  );
}

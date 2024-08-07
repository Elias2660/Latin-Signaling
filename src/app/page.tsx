"use client"
import { useEffect, useState } from "react";
// import { socket } from "../socket";
import { io } from "socket.io-client";

const socket = io("localhost:3000");

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [itemList, updateItemList] = useState<string[]>([]);


  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
      console.log(`${socket.id?.substring(0, 2)} is connected`)
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    function onCreate(text:string) {
      // console.log(`${socket.id?.substring(0, 2)} sent message ${text}`)
      // console.log(`ItemList: ${itemList}`)
      console.log("Thing about to be created")
      updateItemList(previous => [...previous, text]);
      console.log(`message received: ${text}`);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("create", onCreate)
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("create", onCreate)
    };
  }, [itemList]);




  function sendMessage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    const text = (document.querySelector("input") as HTMLInputElement).value;
    socket.emit('message', text);
    console.log(`ItemList: ${itemList}`);
  }

  return (
    <main>
      <div>
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        <p>Transport: {transport}</p>

        <p>
          messages:
        </p>
        <ol>
          {itemList.map(
            (x, index) => <li key={index}> {x} </li>
          )}
        </ol>

        <input id="fillbox" placeholder="message" className="text-stone-800	" />

        <button onClick={sendMessage} type='submit' > send </button>
      </div>
    </main>
  );
}

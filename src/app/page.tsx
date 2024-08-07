"use client"
import { useEffect, useState } from "react";
import { socket } from "../socket";
import { time } from "console";


export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [itemList, updateItemList] = useState<string[]>([]);
  const [toServer, updateToServer] = useState("");
  const [fromServer, updateFromServer] = useState("");

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

  return (
    <main>
      <div>
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

        <input id="fillbox" placeholder="message" className="text-stone-800	" />

        <button onClick={sendMessage} type='submit' > send </button>
        <button onClick={clearList}> clear</button>
      </div>
    </main>
  );
}

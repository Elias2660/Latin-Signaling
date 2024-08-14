'use client'
import socket from "@/socket"
import { useEffect, useState, useRef } from "react"
import connectDB from "@/config/database"
import { signIn, signOut, useSession, getProviders } from "next-auth/react"
import Image from "next/image";
import defaultImg from "/public/default.jpg"
import Link from "next/link";
import createRoom from "@/actions/createRoom"
import getListOfHost from "@/actions/getListOfHost"


export default function joinRoom() {
    const { data: session } = useSession();
    console.log(session)

    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [toServer, updateToServer] = useState("");
    const [fromServer, updateFromServer] = useState("");
    const [providers, setProviders] = useState<Record<string, any> | null>(null);
    const [rooms, setRooms] = useState([""]);
    // stuff for creating a room
    const [createdRoom, setCreatedRoom] = useState<null | String>(null);

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
    const prevRoomsRef = useRef<string[] | null>();
    const prevSessionRef = useRef<Session | null>();

    useEffect(() => {
        const getList = async () => {
            console.log(`Session ${session}`);
            if (session) {
                const list = await getListOfHost();
                console.log(`Getting list ${list}`);
                if (list !== null) {
                    const newRooms = JSON.parse(JSON.stringify(list));
                    console.log("New Rooms:", newRooms);
                    console.log("Previous Rooms:", prevRoomsRef.current);
                    if (JSON.stringify(newRooms) !== JSON.stringify(prevRoomsRef.current)) {
                        setRooms(newRooms);
                        console.log("ROOMS", newRooms);
                    }

                }
            }
        };

        if (session !== prevSessionRef.current || JSON.stringify(rooms) !== JSON.stringify(prevRoomsRef.current)) {
            console.log("SFwfbnjkfbn");
            getList();
        }

        prevRoomsRef.current = rooms;
        prevSessionRef.current = session;
    }, [rooms, session]);


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


        function onPing(toServer: number, fromServer: number): void {
            updateToServer((toServer).toString());
            updateFromServer((Date.now() - fromServer).toString());
        }

        // create way to create rooms

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("ping", onPing);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("ping", onPing);
        };
    }, []);



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


    async function createAndSetRoom() {
        // this is so that the paragraph tag will display the currently created room
        const response = await createRoom();
        if (typeof response === 'string') {
            setCreatedRoom(response);
        }
    }


    async function joinRoom() {
        // join the room
        console.log("Join Room Button Pressed")
    }

    let profileImage = session?.user?.image

    return (<main className="m-3">
        {session && <button type="button"
            onClick={() => signOut()}
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Log out</button>
        }
        <Link href="/" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Back to Main Page</Link>

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
            {session && <p>
                List of hosted Rooms: {rooms.join(", ")}
            </p>}
            {createdRoom && <p> Room created is {createdRoom} </p>}
            {!createdRoom && <p>Room is not created yet</p>}
            {session && <button onClick={async () => createAndSetRoom()} className="bg-red-500 rounded-md border-spacing-2 p-3 m-3"> create room</button>}
            {session && createdRoom && <Link href={`/rooms/session/${createdRoom}`} className="m-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"> Join as admin </Link>}
            {session && <input id="fillbox" placeholder="join code" className="text-stone-800	bg-red-300 border-spacing-2 rounded-md p-3" />}
            {session && <button onClick={async () => joinRoom()} className="bg-red-500 rounded-md border-spacing-2 p-3 m-3"> join room</button>}
        </div>
    </main>)
}
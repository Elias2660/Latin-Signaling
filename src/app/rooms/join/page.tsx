'use client'
import { useEffect, useState, useRef } from "react"
import { Session } from "next-auth"
import connectDB from "@/config/database"
import { signIn, signOut, useSession, getProviders } from "next-auth/react"
import Image from "next/image";
import defaultImg from "/public/default.jpg"
import Link from "next/link";
import createRoom from "@/actions/createRoom";
import getListOfHost from "@/actions/getListOfHost";
import { isRoom } from "@/actions/RoomActions";

export default function joinRoom() {
    const { data: session } = useSession();
    const [providers, setProviders] = useState<Record<string, any> | null>(null);
    const [rooms, setRooms] = useState([""]);
    const [fillboxValidRoom, setFillboxRoomValidity] = useState(false);

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
    }, [session])
    const prevRoomsRef = useRef<string[] | null>();
    const prevSessionRef = useRef<Session | null>();


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


    useEffect(() => {
        if (session !== prevSessionRef.current || JSON.stringify(rooms) !== JSON.stringify(prevRoomsRef.current)) {
            getList();
        }
        prevRoomsRef.current = rooms;
        prevSessionRef.current = session;
    }, [rooms, session, prevRoomsRef, prevSessionRef]);

    async function createAndSetRoom() {
        // this is so that the paragraph tag will display the currently created room
        const response = await createRoom();
        if (typeof response === 'string') {
            setCreatedRoom(response);
        }
        await getList()
    }

    useEffect(() => {
        const checkFillboxForValidity = async () => {
            const enteredRoomCode: string = (document.getElementById("fillbox") as HTMLInputElement)?.value;
            if (enteredRoomCode !== null && enteredRoomCode !== undefined && enteredRoomCode.length > 0) {
                const validRoom = await isRoom(enteredRoomCode);
                setFillboxRoomValidity(validRoom);
            }
        }
        checkFillboxForValidity()
    }, [(typeof window !== 'undefined' && (document.getElementById("fillbox") as HTMLInputElement)?.value)]);

    let profileImage = session?.user?.image;

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

            <p>User is {!session && "not"} logged in </p>

            {session && <p>
                List of hosted Rooms: {rooms.join(", ")}
            </p>}
            {createdRoom && <p> Room created is {createdRoom} </p>}
            {!createdRoom && <p>Room is not created yet</p>}
            {session && <button onClick={async () => createAndSetRoom()} className="bg-red-500 rounded-md border-spacing-2 p-3 m-3"> create room</button>}
            {session && createdRoom && <Link href={`/rooms/session/${createdRoom}`} className="m-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"> Join as admin </Link>}
            {session && <input id="fillbox" placeholder="join code" className="text-stone-800	bg-red-300 border-spacing-2 rounded-md p-3" />}
            {session && !fillboxValidRoom && <div className="bg-red-400 select-none rounded-md border-spacing-2 p-3 m-3 w-24 inline"> join room</div>}
            {session && fillboxValidRoom && <Link href={`/rooms/session/${(document.getElementById("fillbox") as HTMLInputElement).value.trim()}`} className="bg-red-800 rounded-md border-spacing-2 p-3 m-3 w-24 hover:bg-red-400  hover:scale-110"> join room</Link>}
        </div>
    </main>)
}
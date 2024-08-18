"use client"
import socket from "@/socket";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isRoomAdmin } from "@/actions/adminActions";
import removeRoom from "@/actions/removeRoom";
import redirectIfNotValid from "@/actions/redirectIfNotValid";
import { signIn, signOut, useSession, getProviders } from "next-auth/react"
import LoadingSpinner from "@/components/LoadingSpinner";
import getSessionUser from "@/utils/getServerSession";
import { update } from "lodash";

interface RoomPageProps {
    params: {
        roomid: string;
    };
    searchParams: Record<string, string>;
}

interface SessionUserProps {
    id: string,
    user: {
        email: string,
        id: string,
        image: string,
        name: string
    }
}

export default function RoomPage(props: RoomPageProps) {
    const { data: session } = useSession();
    const [userStatus, updateUserStatus] = useState(false);
    const [checkForRedirect, setCheckForRedirect] = useState(false);
    const [userData, updateUserData] = useState<SessionUserProps | null>()
    const [ringed, updateRinged] = useState(false)
    const [pings, updatePings] = useState<number[]>([])
    // redirect the user if the room does not exist
    useEffect(() => {
        (async () => {
            await redirectIfNotValid(props.params.roomid);
            setCheckForRedirect(true);
        })();
    }, []);

    useEffect(() => {
        const getAdminStatus = async () => {
            if (props.params.roomid !== null || props.params.roomid !== undefined) {
                console.log(`Getting Admin Status for room ${props.params.roomid}`);
                const status = await isRoomAdmin(props.params.roomid);
                console.log(`status ${status}`)
                updateUserStatus(status);
                console.log(ringed);
            }
        }
        getAdminStatus();
    }, [session]);

    useEffect(() => {

        const socketActions = async () => {
            if (socket.connected) {
                onConnect();
            }

            async function onConnect() {
                console.log(`Connected to ${props.params.roomid}`);
                let user = null;
                while (user === null ){
                    user = await getSessionUser();
                }
                socket.emit("joinRoom", props.params.roomid, user.id);
            }
            function onResetRing() {
                console.log("reset recived");
                updateRinged(false);
                updatePings([]);
            }

            function onBuzz(timestamp: number) {
                console.log(`ping gotten ${userStatus}`);
                console.log("Ping recieved")
                updatePings([...pings, timestamp])
            }

            socket.on("connect", onConnect);
            socket.on("resetBuzzers", onResetRing);
            socket.on("buzz", onBuzz);
            return () => {
                socket.off("connect", onConnect);
                socket.off("buzz", onBuzz);
                socket.off("resetBuzzers", onResetRing);
            }
        }
        socketActions();
    }, [])

    useEffect(() => {
        const getUser = async () => {
            console.log(`Get user`);
            if (session !== undefined && session !== null) {
                const foundUserData = await getSessionUser();
                if (foundUserData !== null) {
                    updateUserData(foundUserData);
                }
            }
        }
        getUser();
    }, [session]);


    async function closeRoom(roomid: string) {
        console.log("Close Room Triggered")
        await removeRoom(roomid);
    }

    async function sendBuzz() {
        console.log(`Sendbuzz pressed, ringed ${ringed}`);
        if (!ringed) {
            console.log("buzz sending");
            const timeStamp = Date.now();
            socket.emit("buzz", timeStamp, props.params.roomid);
            updateRinged(true);
        }
        console.log(`Buzz sent`);
    }

    async function sendReset() {
        console.log("sending reset");
        socket.emit("resetBuzzers", props.params.roomid);
        updatePings([]);
        console.log("reset sent");
    }

    return (<div className="h-full w-full m-3">
        {!checkForRedirect && <LoadingSpinner />}
        {checkForRedirect && <><Link href="/rooms/join" className="m-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go back to joined room
        </Link>
            <p className="m-3">Current Session user {userData?.user.name}.</p>
            <p className="m-3"> User is Admin: {(userStatus.toString())}</p>
            <p className="m-3">You are in room {props.params.roomid}</p>

            {userStatus &&
                <> <p className="m-3"> Total Pings </p>
                    <ul>
                        {pings.map((ping, index) => (
                            <li key={index}>{ping}</li>
                        ))}
                    </ul>
                </>
            }
            <p className="m-3"> Users in rooms </p>
            <ul className="m-3">
                <li> ~test item~ </li>
            </ul>

            <Link href="/rooms/join" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-3">
                Leave Room
            </Link>

            {userStatus && <button onClick={async () => closeRoom(props.params.roomid)} className="bg-red-500 hover:bg-red-900 text-white font-bold py-2 px-4 rounded m-3">
                close Room
            </button>}
            {!userStatus && <button onClick={async () => sendBuzz()} className={`${!ringed && "bg-teal-600"} ${ringed && "bg-teal-900"} hover:bg-teal-900 text-white font-bold py-2 px-4 rounded m-3`}> Send Ping to Admin </button>}
            {userStatus && <button onClick={async () => sendReset()} className={`${!ringed && "bg-teal-600"} ${ringed && "bg-teal-900"} hover:bg-teal-900 text-white font-bold py-2 px-4 rounded m-3`}> Reset </button>}
        </>}
    </div>);
}
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
import { clientRedirect } from "@/actions/ClientRedirect";

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
    // redirect the user if the room does not exist
    useEffect(() => {
        (async () => {
            await redirectIfNotValid(props.params.roomid);
            setCheckForRedirect(true);
        })();
    }, []);

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            console.log(`Connected to ${props.params.roomid}`);
        }

        socket.on("connect", onConnect);
        return () => {
            socket.off("connect", onConnect);
        }
    }, [])

    useEffect(() => {
        const getAdminStatus = async () => {
            if (props.params.roomid !== null || props.params.roomid !== undefined) {
                console.log(`Getting Admin Status for room ${props.params.roomid}`);
                const status = await isRoomAdmin(props.params.roomid);
                console.log(`status ${status}`)
                updateUserStatus(status);
            }
        }
        getAdminStatus();
    }, [session]);

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

    async function leaveRoom(roomid: string) {
        console.log("Leave Room Triggered");
    }

    async function closeRoom(roomid: string) {
        console.log("Close Room Triggered")
        await removeRoom(roomid);
    }

    return (<div className="h-full w-full m-3">
        {!checkForRedirect && <LoadingSpinner />}
        {checkForRedirect && <><Link href="/rooms/join" className="m-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go back to joined room
        </Link>
            <p className="m-3">Current Session user {userData?.user.name}.</p>
            <p className="m-3"> User is Admin: {(userStatus.toString())}</p>
            <p className="m-3">You are in room {props.params.roomid}</p>
            <Link href="/rooms/join" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-3">
                Leave Room
            </Link>

            <button onClick={async () => closeRoom(props.params.roomid)} className="bg-red-500 hover:bg-red-900 text-white font-bold py-2 px-4 rounded m-3">
                close Room
            </button></>}
    </div>);
}
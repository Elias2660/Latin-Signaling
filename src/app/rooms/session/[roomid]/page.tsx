"use client"
import socket from "@/socket";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isAdmin } from "@/actions/adminActions";
import { getRoomInfo } from "@/actions/RoomActions";
import removeRoom from "@/actions/removeRoom";
import redirectIfNotValid from "@/actions/redirectIfNotValid";
import { signIn, signOut, useSession, getProviders } from "next-auth/react"
import LoadingSpinner from "@/components/LoadingSpinner";
import getSessionUser from "@/utils/getServerSession";

interface RoomPageProps {
    params: {
        roomid: string;
    };
    searchParams: Record<string, string>;
}

interface SessionUserProps {
    user: string,
    id: string,
}

export default function RoomPage(props: RoomPageProps) {
    const { data: session } = useSession();
    const [userStatus, updateUserStatus] = useState(false);
    const [checkForRedirect, setCheckForRedirect] = useState(false);
    const [user, updateUser] = useState<SessionUserProps | null>()
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
                const status = await isAdmin(props.params.roomid);
                updateUserStatus(status);
            }
        }
        getAdminStatus();
    }, []);

    useEffect(() => {
        const getUser = async () => {
            console.log(`Get user`);
            if (session !== undefined && session !== null) {
                const user = await getSessionUser();
                if (user !== null) {
                    updateUser(user);
                }
            }
        }
        getUser();
    }, []);

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
            <p className="m-3">Current Session user {user?.id}. User Admin: {userStatus}</p>
            <p className="m-3">You are in room {props.params.roomid}</p>
            <button onClick={async () => leaveRoom(props.params.roomid)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-3">
                Leave Room
            </button>

            <button onClick={async () => closeRoom(props.params.roomid)} className="bg-red-500 hover:bg-red-900 text-white font-bold py-2 px-4 rounded m-3">
                close Room
            </button></>}
    </div>);
}
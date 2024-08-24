"use client"
import socket from "@/socket";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clearGameInfo, isRoomAdmin } from "@/actions/adminActions";
import removeRoom from "@/actions/removeRoom";
import redirectIfNotValid from "@/actions/redirectIfNotValid";
import { signIn, signOut, useSession, getProviders } from "next-auth/react"
import LoadingSpinner from "@/components/LoadingSpinner";
import getSessionUser from "@/utils/getServerSession";
import { update } from "lodash";
import { getUser } from "@/actions/UserActions";
import { join } from "path";
import { addPingToRoom, getRoomPings, clearPings, addMemberToTeam } from "@/actions/RoomActions";
import { timeStamp } from "console";
import { getRoomMembers, addRoomMember, removeRoomMember } from "@/actions/RoomActions";

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

interface pingProps {
    userID: string,
    timeStamp: number
}

export default function RoomPage(props: RoomPageProps) {
    const { data: session } = useSession();
    const [userStatus, updateUserStatus] = useState(false);
    const [checkForRedirect, setCheckForRedirect] = useState(false);
    const [userData, updateUserData] = useState<SessionUserProps | null>()
    const [ringed, updateRinged] = useState(false)
    const [pings, updatePings] = useState<pingProps[]>([])
    const [roomUsers, updateRoomUser] = useState<string[]>([]); // 
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
                while (user === null) {
                    user = await getSessionUser();
                }
                socket.emit("joinRoom", props.params.roomid, user.id);
                let pngs = await getRoomPings(props.params.roomid);
                updatePings(pngs);
                await addRoomMember(user.id, props.params.roomid)
                // FIX
                // Error adding room member: TypeError: Cannot read properties of undefined (reading 'push')
                // await addRoomMember(props.params.roomid, user.id);
            }

            async function onResetRing() {
                console.log("reset recived");
                updateRinged(false);
                let pis = await getRoomPings(props.params.roomid);
                updatePings([]);
            }

            async function onBuzz(timestamp: number, userID: string) {
                console.log(`ping gotten ${userStatus}`);
                console.log("Ping recieved");
                const p:pingProps = {
                    userID: userID,
                    timeStamp: timestamp,
                }
                updatePings([...pings, p]);
            }

            async function onJoinRoom(userID: string) {
                updateRoomUser([...roomUsers, userID])
            }

            async function onDisconnect() {
                let user = await getSessionUser();
                while (user == null || user == undefined) {
                    user = await getSessionUser();
                }
                await removeRoomMember(user.id, props.params.roomid);
                socket.emit("otherUserLeftRoom", props.params.roomid, user.id);
            
            }

            async function onOtherUserLeave(userID: string) {
                updateRoomUser(roomUsers.filter(uID => uID !== userID));
            }
            socket.on("otherUserLeftRoom", onOtherUserLeave);
            socket.on("joinRoom", async (userID) => { onJoinRoom(userID) });
            socket.on("connect", onConnect);
            socket.on("resetBuzzers", onResetRing);
            socket.on("buzz", onBuzz);
            socket.on("disconnect", async () => { onDisconnect() });

            return () => {
                socket.off("otherUserLeftRoom", onOtherUserLeave);
                socket.off("connect", onConnect);
                socket.off("buzz", onBuzz);
                socket.off("resetBuzzers", onResetRing);
                socket.off("joinRoom", onJoinRoom);
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
        console.log("Close Room Triggered");
        if (userStatus) {
            socket.emit("roomClosing", roomid);
        }
        await removeRoom(roomid);
    }

    async function sendBuzz() {
        console.log(`Sendbuzz pressed, ringed ${ringed}`);
        if (!ringed) {
            console.log("buzz sending");
            const timeStamp = Date.now();
            let user = await getSessionUser()
            while (user === null || user === undefined) {
                user = await getSessionUser();
            }
            updateRinged(true); // very important because there could be button race conditions
            socket.emit("buzz", timeStamp, props.params.roomid, user?.id);
            const ping = {
                userID: user.id,
                timeStamp: timeStamp,
            }
            await addPingToRoom(props.params.roomid, ping)
        }
        console.log(`Buzz sent`);
    }

    async function sendReset() {
        console.log("sending reset");
        socket.emit("resetBuzzers", props.params.roomid);
        updatePings([]);
        await clearPings(props.params.roomid);
        console.log("reset sent");
    }

    return (<div className="h-full w-full m-3">
        {!checkForRedirect ? <LoadingSpinner /> : <><Link href="/rooms/join" className="m-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go back to joined room
        </Link>
            <p className="m-3">Current Session user {userData?.user.name}.</p>
            <p className="m-3"> User is Admin: {(userStatus.toString())}</p>
            <p className="m-3">You are in room {props.params.roomid}</p>

            {userStatus && (
                <>
                    <p className="m-3"> Total Pings </p>
                    <ul>
                        {pings.sort((a, b) => a.timeStamp - b.timeStamp).map((ping, index) => {
                            console.log(ping);
                            return (
                                <li key={index}>
                                    User ID: {ping.userID}, Timestamp: {new Date(ping.timeStamp).toLocaleString()}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
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
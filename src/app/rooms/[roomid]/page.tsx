
interface RoomPageProps {
    params: {
        roomid: string;
    };
    searchParams: Record<string, string>;
}

export default function RoomPage(props: RoomPageProps) {
    console.log(props);
    return (<div>
        You are in room {props.params.roomid}
    </div>);
}
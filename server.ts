import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { disconnect } from "node:process";

// handing disconnections socket.io: https://stackoverflow.com/questions/17287330/socket-io-handling-disconnect-event

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`👋 a user ${socket.id.substring(0, 2)} connected`);
    socket.on("message", (message: string) => {
      console.log(`💬 ${socket.id.substring(0, 2)} message: ${message}`);
      socket.broadcast.emit("create", message);
    });

    socket.on("timecheck", (time: number) => {
      // console.log(`🏓 ping from user ${socket.id.substring(0,2)}`);
      let t = Date.now() - time;
      socket.emit("ping", t, Date.now()); // the time to get from client to the server, the time to get from server to the client
    });

    socket.on("joinRoom", async (room: string, id: string) => {
      console.log(`🚪 ${socket.id.substring(0, 2)} joining room ${room}`);
      socket.join(room);
      socket.to(room).emit("joinedRoom", id);
      let s = await io.in(room).fetchSockets();
      console.log(`sockets: ${s.length}`);
      console.log(
        `people in room: ${JSON.stringify([...s.map((socket) => socket.id)])}`
      );
    });

    socket.on("buzz", (time: number, room: string, userID: string) => {
      console.log(`🔔 ${socket.id.substring(0, 2)} buzzing in room ${room}`);
      console.log(`User: ${userID}`);
      console.log(`time: ${time}`);
      // sends the buzz to the room but only if the socket is in the room
      if (socket.rooms.has(room)) {
        console.log("🔔 Buzzing in room");
        console.log(`Rooms: ${JSON.stringify([...io.sockets.adapter.rooms])}`);
        socket.to(room).emit("buzz", time, userID);
      }
      console.log(`socket.rooms: ${JSON.stringify([...socket.rooms])}`);
      console.log(
        `people in room: ${JSON.stringify([io.in(room).fetchSockets()])}`
      );
    });

    socket.on("kick", (kickingUser: string, user: string) => {
      console.log(`👢 ${kickingUser} kicking user ${user}`);
      socket.to(user).emit("kicked");
    });

    socket.on("resetBuzzers", (roomID: string) => {
      // resets the list
      console.log(
        `🔄 ${socket.id.substring(0, 2)} resetting to room ${roomID}`
      );
      socket.broadcast.to(roomID).emit("resetBuzzers");
    });

    socket.on("otherUserLeftRoom", (roomID, userID) => {
      console.log(`🚪 ${userID} left room ${roomID}`);
      socket.broadcast.to(roomID).emit("otherUserLeftRoom", userID);
      console.log(
        `people in room: ${JSON.stringify([io.in(roomID).fetchSockets()])}`
      );
    });

    socket.on("disconnect", (userid: string, roomid: string) => {
      console.log(
        `👋 user ${socket.id.substring(
          0,
          2
        )} with user id ${userid} disconnected`
      );
      socket.broadcast.to(roomid).emit("otherUserLeftRoom");
      console.log(
        `people in room: ${JSON.stringify([io.in(roomid).fetchSockets()])}`
      );
    });

    socket.on("leaveRoom", (roomID: string, userID: string) => {
      console.log(`🚪 ${socket.id.substring(0, 2)} leaving room ${roomID}`);
      socket.leave(roomID);
      socket.to(roomID).emit("leftRoom", userID);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🟢 Ready on http://${hostname}:${port}`);
  });
});

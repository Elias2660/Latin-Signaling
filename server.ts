import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

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

  io.on("connection", async (socket) => {
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

    socket.on("joinRoom", (room: string) => {
      console.log(`🚪 ${socket.id.substring(0, 2)} joining room ${room}`);
      socket.join(room);
      const roomData = io.sockets.adapter.rooms.get(room) || new Set<string>();
      console.log(`Room data after joining: ${JSON.stringify([...roomData])}`);
    });

    socket.on("buzz", (time: number, room: string) => {
      console.log(`🔔 ${socket.id.substring(0, 2)} buzzing in room ${room}`);
      console.log(`time: ${time}`);
      // sends the buzz to the room but only if the socket is in the room
      if (socket.rooms.has(room)) {
        console.log("🔔 Buzzing in room");
        console.log(`Rooms: ${JSON.stringify([...io.sockets.adapter.rooms])}`);
        socket.to(room).emit("buzz", time);
      }
      console.log(`socket.rooms: ${JSON.stringify([...socket.rooms])}`);
      console.log(
        `people in room: ${JSON.stringify([
          io.sockets.adapter.rooms.get(room),
        ])}`
      );
    });

    socket.on("kick", (kickingUser: string, user: string) => {
      console.log(`👢 ${kickingUser} kicking user ${user}`);
      socket.to(user).emit("kicked");
    });

    socket.on("resetBuzzers", (roomID) => {
      // resets the list
      console.log(
        `🔄 ${socket.id.substring(0, 2)} resetting to room ${roomID}`
      );
      socket.broadcast.to(roomID).emit("resetBuzzers");
    });
  });

  httpServer.listen(port, () => {
    console.log(`🟢 Ready on http://${hostname}:${port}`);
  });
});

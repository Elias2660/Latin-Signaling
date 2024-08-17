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
    });

    socket.on("buzz", (time: number, room: string) => {
      console.log(`🔔 ${socket.id.substring(0, 2)} buzzing in room ${room}`);
      // sends the buzz to the room but only if the socket is in the room
      if (socket.rooms.has(room)) {
        io.to(room).emit("buzz", time);
      }
    });

    socket.on("leaveRoom", (room: string) => {
      console.log(`🚪 ${socket.id.substring(0, 2)} leaving room ${room}`);
      socket.leave(room);
    });

    socket.on("kick", (kickingUser: string, user: string) => {
      console.log(`👢 ${kickingUser} kicking user ${user}`);
      socket.to(user).emit("kicked");
    });

    socket.on("resetBuzzers", (roomID: string) => {
      // resets the list
      console.log(`🔄 ${socket.id.substring(0, 2)} resetting`);
      socket.to(roomID).emit("reset");
    });
  });

  httpServer.listen(port, () => {
    console.log(`🟢 Ready on http://${hostname}:${port}`);
  });
});

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

    socket.on("clear", () => {
      console.log(`🗑️ ${socket.id.substring(0, 2)} clearing list`);
      socket.broadcast.emit("clear");
    });

    socket.on("timecheck", (time: number) => {
      // console.log(`🏓 ping from user ${socket.id.substring(0,2)}`);
      let t = Date.now() - time;
      socket.emit("ping", t, Date.now()); // the time to get from client to the server, the time to get from server to the client
    });

    socket.on("joinRoom", (room: string) => {
      // console.log(`🚪 ${socket.id.substring(0, 2)} joining room ${room}`);
      // socket.join(room);
    });




  });

  httpServer.listen(port, () => {
    console.log(`🟢 Ready on http://${hostname}:${port}`);
  });
});

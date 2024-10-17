import { Server as httpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

interface User {
  userId: string;
  socket: Socket;
}

interface Room {
  users: User[];
}

export function configureSocket(expressServer: httpServer) {
  const io = new SocketIOServer(expressServer, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      allowedHeaders: ["Content-Type"],
      optionsSuccessStatus: 200,
      credentials: true,
    },
  });

  const rooms: Record<string, Room> = {};

  io.on("connection", (socket: Socket) => {
    console.log("New client connected", socket.id);

    socket.on("join-room", (roomId: string) => {
      if (!rooms[roomId]) {
        rooms[roomId] = { users: [] };
      }

      if (rooms[roomId].users.length >= 2) {
        socket.emit("room-full");
        return;
      }

      rooms[roomId].users.push({ userId: socket.id, socket });
      socket.join(roomId);

      console.log(`User ${socket.id} joined room ${roomId}`);

      if (rooms[roomId].users.length === 2) {
        io.to(roomId).emit("ready");
      }
    });

    socket.on("offer", (data: { room: string; offer: RTCSessionDescriptionInit }) => {
      socket.to(data.room).emit("offer", data.offer);
    });

    socket.on("answer", (data: { room: string; answer: RTCSessionDescriptionInit }) => {
      socket.to(data.room).emit("answer", data.answer);
    });

    socket.on("ice-candidate", (data: { room: string; candidate: RTCIceCandidate }) => {
      socket.to(data.room).emit("ice-candidate", data.candidate);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
      handleDisconnect(socket);
    });
  });

  function handleDisconnect(socket: Socket) {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const userIndex = room.users.findIndex((user) => user.userId === socket.id);

      if (userIndex !== -1) {
        room.users.splice(userIndex, 1);
        console.log(`User ${socket.id} removed from room ${roomId}`);

        if (room.users.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted as it's empty`);
        } else {
          socket.to(roomId).emit("peer-disconnected", socket.id);
        }
        break;
      }
    }
  }
}
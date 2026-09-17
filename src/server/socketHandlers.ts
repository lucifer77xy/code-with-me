interface SocketLike {
  on(event: string, handler: (payload: any) => void): void;
  to(roomId: string): { emit(event: string, payload: any): void };
  join(roomId: string): void;
}

interface IoLike {
  on(event: "connection", handler: (socket: SocketLike) => void): void;
  in(roomId: string): { emit(event: string, payload: any): void };
}

/** Register these handlers in a persistent Socket.io server when one is available. */
export const registerSocketHandlers = (io: IoLike) => {
  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId }: { roomId: string }) => {
      if (roomId) socket.join(roomId);
    });

    socket.on("update-profile", ({ roomId, userProfile }: { roomId: string; userProfile: unknown }) => {
      if (roomId) socket.to(roomId).emit("profile-updated", userProfile);
    });

    socket.on("send-message", ({ roomId, message }: { roomId: string; message: unknown }) => {
      if (roomId) io.in(roomId).emit("receive-message", message);
    });
  });
};

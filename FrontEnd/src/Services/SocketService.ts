import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  if (socket) {
    socket.removeAllListeners();
  }

  socket = io("http://localhost:8181", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: RECONNECT_DELAY,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    autoConnect: true,
    forceNew: true,
  });

  socket.on("connect", () => {
    console.log("🔵 [Socket] Connected ID:", socket?.id);
    reconnectAttempts = 0;
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 [Socket] Disconnected:", reason);
    if (reason === "io server disconnect") {
      // Optional: socket.connect() not needed because autoReconnect will handle it
      console.warn("Server disconnected socket. Relying on reconnection...");
    }
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ [Socket] Connection Error:", err.message);
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("❌ Max reconnection attempts reached");
    }
  });

  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error("Socket not initialized. Call connectSocket() first.");
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    console.log("🔴 [SocketService] Disconnecting...");
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
  } else {
    console.log("🟡 [SocketService] No active socket to disconnect.");
  }
};

export const isSocketConnected = (): boolean => {
  return !!socket?.connected;
};

import { useEffect, useState } from "react";
import { connectSocket } from "../Services/SocketService";
import { Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { TRootState } from "../Store/BigPie";
import { TUserState } from "../Store/UserSlice";

type SocketHook = {
    socket: Socket | null;
    connect: (token: string) => void;
    disconnect: () => void;
    isConnected: boolean;
};

let socketInstance: Socket | null = null;

export const useSocket = (): SocketHook => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const connect = (token: string) => {
        try {
            socketInstance = connectSocket(token);

            // Update state
            setSocket(socketInstance);

            // Listen to connection events
            socketInstance.on("connect", () => {
                console.log("✅ Socket connected inside useSocket.ts:", socketInstance?.id);
                setIsConnected(true);
            });

            socketInstance.on("disconnect", () => {
                console.log("⚠️ Socket disconnected inside useSocket.ts");
                setIsConnected(false);
            });

        } catch (err) {
            console.error("❌ Failed to connect socket:", err);
        }
    };

    const disconnect = () => {
        if (socketInstance) {
            socketInstance.disconnect();
            setIsConnected(false);
            setSocket(null);
            socketInstance = null;
            console.log("🔌 Socket disconnected via hook");
        }
    };

    const { isLoggedIn } = useSelector<TRootState, TUserState>(
        (state) => state.UserSlice
    );

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            disconnect()
            return;
        }

        if (isLoggedIn) {
            connect(token);
        } else {
            disconnect()
        }

        return () => {
            if (!isLoggedIn) {
                disconnect()
            }
        };
    }, [isLoggedIn]);


    return {
        socket,
        connect,
        disconnect,
        isConnected,
    };
};


import { connectSocket, disconnectSocket } from "../Services/SocketService";

export const useSocketConnection = () => {
    const connect = (token: string) => {
        connectSocket(token); // Initiates socket connection
    };

    const disconnect = () => {
        disconnectSocket(); // Disconnects the socket
    };

    return { connect, disconnect }; // Returning the connect and disconnect functions
};

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { decode } from "../../../Services/TokenService";
import { getUserHobbies } from "../../../Services/Api";
import { connectSocket, disconnectSocket } from "../../../Services/SocketService";
import axios from "axios";
import Swal from "sweetalert2";
import { Socket } from "socket.io-client";
import {
  GroupChatContextType,
  ChatUser,
  ChatMessage,
  BaseUser,
  SocketJoinRoomResponse,
  Member,
} from "../../../Types/TChatMessage.ts";
import { useSelector } from "react-redux";
import { TRootState } from "../../../Store/BigPie.ts";
import { TUserState } from "../../../Store/UserSlice.ts";


const GroupChatContext = createContext<GroupChatContextType | undefined>(undefined);
GroupChatContext.displayName = "GroupChatContext";

const useGroupChatInternal = () => {
  const context = useContext(GroupChatContext);
  if (context === undefined) {
    throw new Error("useGroupChat must be used within a GroupChatProvider");
  }
  return context;
};

interface GroupChatProviderProps {
  children: ReactNode;
}

function GroupChatProvider({ children }: GroupChatProviderProps) {
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [allHobbies, setAllHobbies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [members, setMembers] = useState<{ [key: string]: Member[] }>({});

  const { isLoggedIn } = useSelector<TRootState, TUserState>(
    (state) => state.UserSlice
  );

  useEffect(() => {
    if (!isLoggedIn) {
      // If not logged in, disconnect socket and reset states
      if (socket) {
        disconnectSocket();
        setSocket(null);
      }
      return; // Don't proceed further if the user is not logged in
    }

    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = decode(token) as BaseUser;

      const chatUser: ChatUser = {
        _id: decodedToken._id,
        email: decodedToken.email,
        username: decodedToken.email?.split("@")[0] || "user",
        isAdmin: decodedToken.isAdmin,
        isModerator: decodedToken.isModerator,
      };

      setCurrentUser(chatUser);

      const socketInstance = connectSocket(token); // Create the socket
      setSocket(socketInstance);

      socketInstance.on("newMessage", (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
      });

      socketInstance.on("roomHistory", (history: ChatMessage[]) => {
        setMessages(history);
      });

      socketInstance.on("memberLeft", ({ roomId, userId }) => {
        setMembers((prev) => {
          const newMembers = { ...prev };
          if (newMembers[roomId]) {
            newMembers[roomId] = newMembers[roomId].filter(member => member._id !== userId);
          }
          return newMembers;
        });
      });

      return () => {
        socketInstance.off("newMessage");
        socketInstance.off("roomHistory");
        socketInstance.off("memberLeft");
        // Disconnect the socket when the component unmounts or when logged out
        disconnectSocket(); // No argument passed
      };
    }
  }, [isLoggedIn]); // Re-run when login state changes

  const fetchHobbies = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to view your hobbies");

      const decodedToken = decode(token) as BaseUser;
      const response = await getUserHobbies(decodedToken._id);

      if (Array.isArray(response.data.hobbies)) {
        setHobbies(response.data.hobbies);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch hobbies");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllHobbies = useCallback(async () => {
    try {
      const response = await axios.get<string[]>("http://localhost:8181/users/hobbies/all");
      setAllHobbies(response.data);
    } catch (err) {
      console.error("Failed to fetch all hobbies:", err);
    }
  }, []);

  const fetchMembers = useCallback(async (hobby: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to view members");

      const response = await axios.get<Member[]>(`http://localhost:8181/users/members/${hobby}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers((prev) => ({ ...prev, [hobby]: response.data }));
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  }, []);

  const openChat = useCallback(
    async (hobby: string) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const userId = (decode(token) as BaseUser)._id;

        if (currentChat === hobby) return;

        if (socket) {
          const hasHobby = hobbies.includes(hobby);

          try {
            await new Promise<void>((resolve, reject) => {
              socket.emit(
                "joinRoom",
                hobby,
                (response: SocketJoinRoomResponse) => {
                  if (response.success) {
                    resolve();
                  } else {
                    reject(new Error(response.error || "Failed to join room"));
                  }
                },
              );
            });

            if (!hasHobby) {
              try {
                const addHobbyResponse = await axios.patch(
                  `http://localhost:8181/users/${userId}/add-hobby`,
                  { hobby },
                  { headers: { "x-auth-token": token } },
                );
                if (addHobbyResponse.status === 200) {
                  setHobbies((prev) => [...prev, hobby]);
                }
              } catch (hobbyErr) {
                console.log("Hobby already exists, continuing to chat");
              }
            }

            setCurrentChat(hobby);
            fetchMembers(hobby); // Fetch members when opening a chat
          } catch (joinErr) {
            console.error("Failed to join room:", joinErr);
            Swal.fire({
              title: "Error joining chat",
              icon: "error",
            });
          }
        }
      } catch (err) {
        console.error("Error in openChat:", err);
        Swal.fire({
          title: "Error",
          icon: "error",
        });
      }
    },
    [socket, hobbies, currentChat, fetchMembers],
  );

  const closeChat = useCallback(() => {
    if (socket && currentChat) {
      socket.emit("leaveRoom", currentChat);
      setCurrentChat(null);
      setMessages([]);
    }
  }, [socket, currentChat]);

  const leaveChat = useCallback(
    async (hobby: string) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        await axios.patch(
          `http://localhost:8181/users/${(decode(token) as BaseUser)._id}/remove-hobby`,
          { hobby },
          { headers: { "x-auth-token": token } },
        );

        if (socket && currentChat === hobby) {
          socket.emit("leaveRoom", hobby);
          setCurrentChat(null);
          setMessages([]);
        }

        setHobbies((prev) => prev.filter((h) => h !== hobby));
        setMembers((prev) => {
          const newMembers = { ...prev };
          delete newMembers[hobby];
          return newMembers;
        });
      } catch (err) {
        console.error("Error leaving room:", err);
        Swal.fire({
          title: "Error",
          icon: "error",
        });
      }
    },
    [socket, currentChat],
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (socket && currentChat && content.trim()) {
        socket.emit("sendMessage", {
          roomId: currentChat,
          content: content.trim(),
        });
      }
    },
    [socket, currentChat],
  );

  useEffect(() => {
    fetchHobbies();
    fetchAllHobbies();
  }, [fetchHobbies, fetchAllHobbies]);

  return (
    <GroupChatContext.Provider
      value={{
        hobbies,
        allHobbies,
        loading,
        error,
        currentChat,
        messages,
        currentUser,
        members,
        openChat,
        closeChat,
        leaveChat,
        sendMessage,
        fetchAllHobbies,
        fetchMembers,
      }}
    >
      {children}
    </GroupChatContext.Provider>
  );
}

export const useGroupChat = useGroupChatInternal;
export { GroupChatProvider };

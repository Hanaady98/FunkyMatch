"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { TRootState } from "../../../Store/BigPie.ts";
import axios from "axios";
import LoadingSpinner from "../../Common/LoadingSpinner";
import {
  HiArrowLeft,
  HiPaperAirplane,
  HiOutlineEmojiHappy,
} from "react-icons/hi";
import EmojiPicker from "emoji-picker-react";
import { useSocket } from "../../../Hooks/useSocket.ts";

interface Message {
  _id: string;
  roomId: string;
  content: string;
  userId: {
    _id: string;
    username: string;
    profileImage?: { url: string };
  };
  createdAt: string;
}

const PrivateChatView = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { socket } = useSocket();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: TRootState) => state.UserSlice.user);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Click outside handler for emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch messages and socket setup
  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Message[]>(
          `http://localhost:8181/users/private-messages/${roomId}`,
          { headers: { "x-auth-token": token } },
        );
        setMessages(res.data);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    socket?.emit("joinPrivateRoom", roomId);

    return () => {
      socket?.emit("leavePrivateRoom", roomId);
    };
  }, [roomId, socket, navigate]);

  // Handle new messages
  useEffect(() => {
    const handleNewMessage = (newMsg: Message) => {
      if (newMsg.roomId === roomId) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
    };

    socket?.on("newPrivateMessage", handleNewMessage);
    return () => {
      socket?.off("newPrivateMessage", handleNewMessage);
    };
  }, [roomId, socket]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = () => {
    if (message.trim() && socket && roomId) {
      socket.emit("sendPrivateMessage", {
        roomId,
        content: message.trim(),
      });
      setMessage("");
    }
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  // Profile image handling
  const getProfileImage = (user: {
    _id: string;
    username: string;
    profileImage?: { url: string };
  }) => {
    return (
      user.profileImage?.url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username?.charAt(0) || "U")}&background=random&color=fff`
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="m-auto flex h-[calc(100vh-4rem)] w-full flex-col md:w-2/3">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4">
        <button
          onClick={() => navigate("/")}
          className="mr-3 rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
        >
          <HiArrowLeft className="text-xl text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">Private Chat</h2>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            No messages yet. Say hello!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isCurrentUser = msg.userId._id === currentUser?._id;
              return (
                <div
                  key={msg._id || msg.createdAt}
                  className={`flex items-start gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                >
                  <div className="shrink-0">
                    <img
                      src={getProfileImage(msg.userId)}
                      alt={msg.userId.username || "User"}
                      className="size-10 rounded-full border-2 border-white object-cover shadow-sm"
                      loading="eager"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div
                    className={`flex max-w-xs flex-col rounded-lg p-3 md:max-w-md ${isCurrentUser ? "rounded-bl-none bg-blue-500 text-white" : "rounded-br-none bg-gray-100 text-gray-800"}`}
                  >
                    {!isCurrentUser && (
                      <p className="text-xs font-semibold text-gray-600">
                        {msg.userId.username}
                      </p>
                    )}
                    <p className="break-words">{msg.content}</p>
                    <p
                      className={`mt-1 text-xs ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-3">
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 transition-colors hover:text-blue-500"
          >
            <HiOutlineEmojiHappy className="text-xl" />
          </button>

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-12 left-0 z-10"
            >
              <EmojiPicker
                width={300}
                height={400}
                onEmojiClick={handleEmojiClick}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="rounded-full bg-blue-500 p-2 text-white transition-colors duration-200 hover:bg-blue-600 disabled:bg-gray-300"
          >
            <HiPaperAirplane className="rotate-45 text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateChatView;

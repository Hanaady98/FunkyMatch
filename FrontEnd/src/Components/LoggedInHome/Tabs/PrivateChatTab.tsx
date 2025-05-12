"use client";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { TRootState } from "../../../Store/BigPie.ts";
import LoadingSpinner from "../../Common/LoadingSpinner.tsx";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { ThemeContext } from "../../Layout/Header/ThemeToggle.tsx";

interface Conversation {
  roomId: string;
  otherUser: {
    _id: string;
    username: string;
    profileImage?: {
      url: string;
      alt?: string;
    };
  };
  lastMessage: {
    content: string;
    isMine: boolean;
    createdAt: string;
  };
  unreadCount: number;
}

const PrivateChatTab = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUser = useSelector((state: TRootState) => state.UserSlice.user);
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token || !currentUser?._id) return;

        const response = await axios.get(
          `http://localhost:8181/users/${currentUser._id}/private-messages`,
          { headers: { "x-auth-token": token } },
        );
        setConversations(response.data);
      } catch (err) {
        setError("Failed to load conversations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser?._id]);

  if (loading) {
    return <LoadingSpinner message="Loading conversations..." />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div
      className={`min-h-screen rounded-xl p-4 ${
        darkMode ? "bg-gray-50 text-gray-900" : "bg-gray-800 text-gray-100"
      }`}
      style={{
        border: `1px solid ${darkMode ? "#e5e7eb" : "#374151"}`,
      }}
    >
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <HiOutlineChatAlt2 className="text-lg font-semibold text-blue-500" />
          <h1
            className={`text-base font-semibold ${
              darkMode ? "text-gray-800" : "text-white"
            }`}
          >
            Private Chats
          </h1>
        </div>
        <p
          className={`mt-2 text-sm`}
          style={{ color: darkMode ? "#6b7280" : "#9ca3af" }}
        >
          Private messages with other Users!
        </p>
      </div>

      {conversations.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-lg p-8 text-center shadow-md ${
            darkMode ? "bg-gray-100" : "bg-gray-700"
          }`}
        >
          <HiOutlineChatAlt2
            className={`mb-4 text-4xl ${
              darkMode ? "text-gray-400" : "text-gray-400"
            }`}
          />
          <h3
            className={`text-lg font-semibold ${
              darkMode ? "text-gray-800" : "text-white"
            }`}
          >
            No conversations yet
          </h3>
          <p className={darkMode ? "text-gray-600" : "text-gray-300"}>
            Start a private chat from a user's profile
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((convo) => (
            <div
              key={convo.roomId}
              className={`flex cursor-pointer items-center rounded-lg p-4 shadow-md transition-colors duration-200 hover:shadow-lg ${
                darkMode
                  ? "border-gray-200 bg-white hover:bg-gray-100"
                  : "border-gray-600 bg-gray-900 hover:bg-gray-900"
              }`}
              onClick={() => navigate(`/private-chat/${convo.roomId}`)}
            >
              <img
                src={
                  convo.otherUser.profileImage?.url || "/default-profile.png"
                }
                alt={convo.otherUser.username}
                className="mr-4 size-12 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-profile.png";
                }}
              />
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? "text-gray-900" : "text-white"
                  }`}
                >
                  {convo.otherUser.username}
                </h3>
                <p
                  className={`truncate text-sm ${
                    darkMode ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  {convo.lastMessage.isMine ? "You: " : ""}
                  {convo.lastMessage.content}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {new Date(convo.lastMessage.createdAt).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </div>
              {convo.unreadCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {convo.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrivateChatTab;

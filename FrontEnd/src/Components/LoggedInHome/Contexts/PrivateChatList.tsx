"use client";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { TRootState } from "../../../Store/BigPie.ts";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import LoadingSpinner from "../../Common/LoadingSpinner.tsx";
import { ThemeContext } from "../../Layout/Header/ThemeToggle.tsx";

interface Conversation {
  roomId: string;
  userId: {
    _id: string;
    username: string;
    profileImage?: { url: string };
  };
  lastMessage: string;
}

const PrivateChatList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const currentUserId = useSelector(
    (state: TRootState) => state.UserSlice.user?._id,
  );
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token || !currentUserId) return;

        const res = await axios.get(
          `http://localhost:8181/users/${currentUserId}/private-messages`,
          { headers: { "x-auth-token": token } },
        );
        setConversations(res.data);
      } catch (err) {
        setError("Failed to load conversations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [currentUserId]);

  if (loading) return <LoadingSpinner message="Loading conversations..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div
      className={`min-h-screen rounded-xl p-4 ${
        darkMode
          ? "border-gray-200 bg-white hover:bg-gray-100"
          : "border-gray-600 bg-gray-900 hover:bg-gray-900"
      }`}
    >
      <h1
        className={`mb-6 flex items-center text-2xl font-bold ${
          darkMode ? "text-gray-800" : "text-white"
        }`}
      >
        <HiOutlineChatAlt2 className="mr-2" />
        Private Chats
      </h1>

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
                  : "border-gray-600 bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => navigate(`/private-chats/${convo.roomId}`)}
            >
              <img
                src={convo.userId.profileImage?.url || "/default-profile.png"}
                alt={convo.userId.username}
                className="mr-4 h-12 w-12 rounded-full object-cover"
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
                  {convo.userId.username}
                </h3>
                <p
                  className={`truncate text-sm ${
                    darkMode ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  {convo.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrivateChatList;

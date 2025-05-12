import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCrown,
  FaShieldAlt,
  FaPaperPlane,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { TRootState } from "../../Store/BigPie";
import PostList from "../Posts/PostList";
import { useProfileData } from "../../Hooks/useProfileData.ts";
import { useState, useContext } from "react";
import axios from "axios";
import { useSocket } from "../../Hooks/useSocket.ts";
import { ThemeContext } from "../../Components/Layout/Header/ThemeToggle.tsx";

const PublicUserProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    user: profileUser,
    calculateAge,
    selectedCountry,
  } = useProfileData(id, true);
  const currentUser = useSelector((state: TRootState) => state.UserSlice.user);
  const isOwner = currentUser?._id === id;
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const socket = useSocket();
  const { darkMode } = useContext(ThemeContext);

  const sendMessage = async () => {
    if (
      !message.trim() ||
      !socket ||
      !profileUser ||
      sending ||
      !currentUser?._id
    )
      return;

    setSending(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `http://localhost:8181/users/${currentUser._id}/send-private-message`,
        {
          recipientId: profileUser._id,
          content: message.trim(),
        },
        { headers: { "x-auth-token": token } },
      );

      setMessage("");
      setShowModal(false);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`mx-auto min-h-screen w-[90%] rounded-lg p-4 shadow-sm md:w-[70%] ${darkMode ? "bg-gray-50 text-gray-900" : "bg-gray-800 text-gray-100"
        }`}
      style={{
        border: `1px solid ${darkMode ? "#e5e7eb" : "#374151"}`,
      }}
    >
      <button
        onClick={() => navigate(-1)}
        className={`mb-6 flex items-center transition-colors ${darkMode
            ? "text-blue-500 hover:text-blue-700"
            : "text-blue-400 hover:text-blue-300"
          }`}
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <div className="relative">
        <div className="absolute top-0 right-0 flex gap-2 p-2">
          {profileUser?.isAdmin && (
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${darkMode
                  ? "bg-purple-100 text-purple-800"
                  : "bg-purple-900 text-purple-200"
                }`}
            >
              <FaCrown className="inline mr-1" /> Admin
            </span>
          )}
          {profileUser?.isModerator && (
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${darkMode
                  ? "bg-blue-100 text-blue-800"
                  : "bg-blue-900 text-blue-200"
                }`}
            >
              <FaShieldAlt className="inline mr-1" /> Moderator
            </span>
          )}
        </div>

        <div className="flex flex-col items-center pt-10 text-center md:hidden">
          <div className="w-full px-4 mb-4">
            <h1
              className={`mx-auto max-w-[240px] break-words text-2xl font-bold ${darkMode ? "text-gray-900" : "text-white"
                }`}
            >
              {profileUser?.name.first} {profileUser?.name.last}
            </h1>
            <p
              className={`mx-auto max-w-[240px] break-words ${darkMode ? "text-gray-600" : "text-gray-300"
                }`}
            >
              @{profileUser?.username || profileUser?.email.split("@")[0]}
            </p>
          </div>
          <div className="mb-4">
            <img
              src={profileUser?.profileImage?.url || "/default-profile.png"}
              alt={profileUser?.profileImage?.alt || "Profile"}
              className="object-cover w-24 h-24 mx-auto rounded-full"
            />
          </div>
          <div className="flex flex-col items-center w-full gap-2 px-4 mb-6">
            {profileUser?.address?.country && selectedCountry && (
              <div className="flex max-w-[200px] items-center">
                <img
                  src={selectedCountry.flags.png}
                  alt={`${selectedCountry.name.common} flag`}
                  className="object-cover w-5 h-4 mr-1"
                />
                <span
                  className={`break-words text-sm ${darkMode ? "text-gray-700" : "text-gray-300"
                    }`}
                >
                  {profileUser.address.country}
                </span>
              </div>
            )}
            <div className="flex flex-col items-center">
              {profileUser?.birthDate && (
                <span
                  className={`text-sm ${darkMode ? "text-gray-700" : "text-gray-300"
                    }`}
                >
                  {calculateAge(profileUser.birthDate)} years
                </span>
              )}
              {profileUser?.gender && (
                <span
                  className={`text-sm ${darkMode ? "text-gray-700" : "text-gray-300"
                    }`}
                >
                  {profileUser.gender}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="items-start justify-center hidden gap-4 pt-10 mb-8 md:flex">
          <div className="flex max-w-[200px] flex-col">
            <h1
              className={`break-words text-2xl font-bold ${darkMode ? "text-gray-900" : "text-white"
                }`}
            >
              {profileUser?.name.first} {profileUser?.name.last}
            </h1>
            <p
              className={`break-words ${darkMode ? "text-gray-600" : "text-gray-300"
                }`}
            >
              @{profileUser?.username || profileUser?.email.split("@")[0]}
            </p>
          </div>
          <div className="mx-2 shrink-0">
            <img
              src={profileUser?.profileImage?.url || "/default-profile.png"}
              alt={profileUser?.profileImage?.alt || "Profile"}
              className="object-cover w-24 h-24 rounded-full"
            />
          </div>
          <div className="flex max-w-[200px] flex-col">
            <div className="flex flex-col gap-1">
              {profileUser?.address?.country && selectedCountry && (
                <div className="flex items-center">
                  <img
                    src={selectedCountry.flags.png}
                    alt={`${selectedCountry.name.common} flag`}
                    className="object-cover w-5 h-4 mr-1"
                  />
                  <span
                    className={`break-words text-sm ${darkMode ? "text-gray-700" : "text-gray-300"
                      }`}
                  >
                    {profileUser.address.country}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                {profileUser?.birthDate && (
                  <span
                    className={`text-sm ${darkMode ? "text-gray-700" : "text-gray-300"
                      }`}
                  >
                    {calculateAge(profileUser.birthDate)} years
                  </span>
                )}
                {profileUser?.gender && (
                  <span
                    className={`text-sm ${darkMode ? "text-gray-700" : "text-gray-300"
                      }`}
                  >
                    {profileUser.gender}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {!isOwner && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 mt-4 text-white transition-colors duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            <FaPaperPlane className="mr-2" /> Send Message
          </button>
        )}
      </div>

      {profileUser?.hobbies && profileUser.hobbies.length > 0 && (
        <div className="mb-8">
          <hr
            className={`my-4 ${darkMode ? "border-gray-200" : "border-gray-600"
              }`}
          />
          <h2
            className={`mb-2 text-lg font-semibold ${darkMode ? "text-gray-800" : "text-white"
              }`}
          >
            Hobbies
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {profileUser.hobbies.map((hobby, index) => (
              <div
                key={`hobby-${index}`}
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${darkMode
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-700 text-gray-200"
                  }`}
              >
                {hobby}
              </div>
            ))}
          </div>
        </div>
      )}

      {profileUser?.bio && (
        <div className="mb-8">
          <hr
            className={`my-4 ${darkMode ? "border-gray-200" : "border-gray-600"
              }`}
          />
          <h2
            className={`mb-2 text-lg font-semibold ${darkMode ? "text-gray-800" : "text-white"
              }`}
          >
            Bio
          </h2>
          <p
            className={`whitespace-pre-line text-sm ${darkMode ? "text-gray-700" : "text-gray-300"
              }`}
          >
            {profileUser.bio}
          </p>
        </div>
      )}

      {profileUser && profileUser._id && (
        <PostList userId={profileUser._id} isOwner={isOwner} />
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div
            className={`w-full max-w-md rounded-lg p-6 shadow-md ${darkMode ? "bg-white" : "bg-gray-700"
              }`}
          >
            <h2
              className={`mb-4 text-xl font-semibold ${darkMode ? "text-gray-900" : "text-white"
                }`}
            >
              Send Message
            </h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                  ? "border-gray-200 bg-white text-gray-900"
                  : "border-gray-600 bg-gray-800 text-gray-100"
                }`}
              style={{ resize: "none" }}
            ></textarea>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className={`rounded-lg px-4 py-2 transition-colors duration-200 ${darkMode
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-600 text-gray-100 hover:bg-gray-500"
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                className="px-4 py-2 text-white transition-colors duration-200 bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicUserProfile;

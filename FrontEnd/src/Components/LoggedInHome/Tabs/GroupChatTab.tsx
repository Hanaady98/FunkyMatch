"use client";

import { HiUserCircle, HiUsers } from "react-icons/hi";
import { useGroupChat } from "../Contexts/GroupChatContext.tsx";
import ErrorBoundary from "../../Common/ErrorBoundary.tsx";
import LoadingSpinner from "../../Common/LoadingSpinner.tsx";
import React, { useState, useContext } from "react";
import ChatView from "../Chat/ChatView.tsx";
import { ThemeContext } from "../../Layout/Header/ThemeToggle.tsx";

const GroupChatTab = () => {
  const { darkMode } = useContext(ThemeContext);
  const {
    hobbies,
    allHobbies,
    loading,
    error,
    currentChat,
    messages,
    openChat,
    closeChat,
    leaveChat,
    sendMessage,
    fetchAllHobbies,
  } = useGroupChat();

  const [showAllHobbies, setShowAllHobbies] = useState(false);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner message="Loading your hobbies..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="mx-auto mt-8 max-w-md rounded-xl border p-6"
        style={{
          backgroundColor: darkMode ? "#fef2f2" : "#1f2937",
          borderColor: darkMode ? "#fecaca" : "#374151",
          color: darkMode ? "#b91c1c" : "white",
        }}
      >
        <div className="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="mt-4 text-center font-medium">Error loading hobbies</p>
        <p className="mt-2 text-center text-sm">{error}</p>
      </div>
    );
  }

  if (currentChat) {
    return (
      <ChatView
        messages={messages}
        onSendMessage={sendMessage}
        onClose={closeChat}
        roomName={currentChat}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4 p-4">
        <div
          className="rounded-xl p-4 shadow-sm"
          style={{
            backgroundColor: darkMode ? "white" : "#1f2937",
            border: `1px solid ${darkMode ? "#e5e7eb" : "#374151"}`,
          }}
        >
          <h3
            className="mb-3 flex items-center font-medium"
            style={{ color: darkMode ? "#374151" : "white" }}
          >
            <HiUsers className="mr-2 text-blue-500" />
            Your Hobby Groups
          </h3>
          <p
            className="mb-4 text-sm"
            style={{ color: darkMode ? "#6b7280" : "#9ca3af" }}
          >
            Connect with people who share your interests
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {hobbies.map((hobby) => (
              <div
                key={hobby}
                className="flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: darkMode ? "#f9fafb" : "#111827",
                  border: `1px solid ${darkMode ? "#e5e7eb" : "#374151"}`,
                }}
              >
                <div
                  className="flex flex-1 cursor-pointer items-center"
                  onClick={() => openChat(hobby)}
                >
                  <div
                    className="mr-4 rounded-lg p-3"
                    style={{
                      backgroundColor: darkMode ? "#dbeafe" : "#1e3a8a",
                    }}
                  >
                    <HiUserCircle className="text-2xl text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="font-medium"
                      style={{ color: darkMode ? "#111827" : "white" }}
                    >
                      {hobby} Group
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        color: darkMode ? "#6b7280" : "#9ca3af",
                      }}
                    >
                      Chat with fellow {hobby.toLowerCase()} enthusiasts
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    leaveChat(hobby);
                  }}
                  className="p-1 hover:text-red-500"
                  style={{ color: "#9ca3af" }}
                  title="Leave group"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl p-4 shadow-sm"
          style={{
            backgroundColor: darkMode ? "white" : "#1f2937",
            border: `1px solid ${darkMode ? "#e5e7eb" : "#374151"}`,
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3
              className="flex items-center font-medium"
              style={{ color: darkMode ? "#374151" : "white" }}
            >
              <HiUsers className="mr-2 text-purple-500" />
              Explore More Groups
            </h3>
            <button
              onClick={() => {
                setShowAllHobbies(!showAllHobbies);
                fetchAllHobbies();
              }}
              className="text-sm hover:text-blue-700"
              style={{ color: darkMode ? "#3b82f6" : "#60a5fa" }}
            >
              {showAllHobbies ? "Hide" : "Show All"}
            </button>
          </div>

          {showAllHobbies && (
            <>
              <p
                className="mb-4 text-sm"
                style={{ color: darkMode ? "#6b7280" : "#9ca3af" }}
              >
                Discover new communities based on interests
              </p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {allHobbies
                  .filter((hobby) => !hobbies.includes(hobby))
                  .map((hobby) => (
                    <div
                      key={hobby}
                      className="flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                      style={{
                        backgroundColor: darkMode ? "#f9fafb" : "#111827",
                        border: `1px solid ${darkMode ? "#e5e7eb" : "#374151"}`,
                      }}
                    >
                      <div
                        className="flex flex-1 cursor-pointer items-center"
                        onClick={() => openChat(hobby)}
                      >
                        <div
                          className="mr-4 rounded-lg p-3"
                          style={{
                            backgroundColor: darkMode ? "#e9d5ff" : "#5b21b6",
                          }}
                        >
                          <HiUserCircle className="text-2xl text-purple-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="truncate font-medium"
                            style={{ color: darkMode ? "#111827" : "white" }}
                          >
                            {hobby} Group
                          </div>
                          <div
                            className="truncate text-sm"
                            style={{
                              color: darkMode ? "#6b7280" : "#9ca3af",
                            }}
                          >
                            Join the {hobby.toLowerCase()} community
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openChat(hobby);
                        }}
                        className="rounded-full px-3 py-1 text-sm text-white hover:bg-purple-600"
                        style={{
                          backgroundColor: darkMode ? "#8b5cf6" : "#7e22ce",
                        }}
                      >
                        Join
                      </button>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

const MemoizedGroupChatTab = React.memo(GroupChatTab);
export default MemoizedGroupChatTab;

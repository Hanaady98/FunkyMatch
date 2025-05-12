"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HiArrowLeft, HiPaperAirplane, HiOutlineEmojiHappy } from "react-icons/hi";
import { useGroupChat } from "../Contexts/GroupChatContext";
import { ChatViewProps, ChatMessage } from "../../../Types/TChatMessage";
import EmojiPicker from "emoji-picker-react";

const ChatView = ({
  messages,
  onSendMessage,
  onClose,
  roomName,
}: ChatViewProps) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useGroupChat();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  }, [message, onSendMessage]);

  // Throttled scroll to bottom
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Basic emoji click handler
  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Profile image handling
  const getProfileImage = (user: {
    _id: string;
    username: string;
    profileImage?: { url: string; alt: string };
  }) => {
    return user.profileImage?.url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username?.charAt(0) || "U")}&background=random&color=fff`;
  };

  return (
    <div className="flex flex-col h-full rounded-lg shadow-sm bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="p-2 mr-3 transition-colors duration-200 rounded-full hover:bg-gray-100"
            aria-label="Close chat"
          >
            <HiArrowLeft className="text-xl text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {roomName} Group
            </h2>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg: ChatMessage) => {
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
                    className="object-cover border-2 border-white rounded-full shadow-sm size-10"
                    loading="eager"
                    width={40}
                    height={40}
                  />
                </div>
                <div className={`flex flex-col rounded-lg p-3 max-w-xs md:max-w-md ${isCurrentUser ? "bg-blue-500 text-white rounded-bl-none" : "bg-gray-100 text-gray-800 rounded-br-none"
                  }`}>
                  {!isCurrentUser && (
                    <p className="text-xs font-semibold text-gray-600">
                      {msg.userId.username}
                    </p>
                  )}
                  <p className="break-words">{msg.content}</p>
                  <p className={`mt-1 text-xs ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-500 transition-colors hover:text-blue-500"
              aria-label="Toggle emoji picker"
            >
              <HiOutlineEmojiHappy className="text-xl" />
            </button>
            {showEmojiPicker && (
              <div className="absolute left-0 z-10 bottom-12">
                <EmojiPicker
                  width={300}
                  height={400}
                  onEmojiClick={handleEmojiClick}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${roomName} group...`}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Type your message"
          />
          <button
            type="submit"
            className="p-2 text-white transition-colors duration-200 bg-blue-500 rounded-full hover:bg-blue-600"
            aria-label="Send message"
          >
            <HiPaperAirplane className="text-lg rotate-45" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatView;

"use client";

import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { HiViewList, HiViewGrid } from "react-icons/hi";
import { FaCrown, FaShieldAlt, FaUsers } from "react-icons/fa";
import { useGroupChat } from "../Contexts/GroupChatContext";
import { useSelector } from "react-redux";
import { TRootState } from "../../../Store/BigPie.ts";
import { ThemeContext } from "../../Layout/Header/ThemeToggle.tsx";

const RoleBadge = ({ role, darkMode }: { role: string; darkMode: boolean }) => {
  if (role === "admin") {
    return (
      <span
        className={`absolute left-2 top-2 flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
          darkMode
            ? "bg-purple-100 text-purple-800"
            : "bg-purple-900 text-purple-200"
        }`}
      >
        <FaCrown className="mr-1" /> Admin
      </span>
    );
  }
  if (role === "moderator") {
    return (
      <span
        className={`absolute left-2 top-2 flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
          darkMode ? "bg-blue-100 text-blue-800" : "bg-blue-900 text-blue-200"
        }`}
      >
        <FaShieldAlt className="mr-1" /> Moderator
      </span>
    );
  }
  return null;
};

const HobbiesList = ({
  hobbies,
  darkMode,
}: {
  hobbies: string[];
  darkMode: boolean;
}) => {
  const visibleHobbies = hobbies.slice(0, 3);
  const extraCount = hobbies.length - 3;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {visibleHobbies.map((hobby, index) => (
        <span
          key={index}
          className={`rounded-full px-3 py-1 text-xs ${
            darkMode ? "bg-gray-100 text-gray-700" : "bg-gray-700 text-gray-200"
          }`}
        >
          {hobby}
        </span>
      ))}
      {extraCount > 0 && (
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            darkMode ? "bg-gray-100 text-gray-500" : "bg-gray-700 text-gray-400"
          }`}
        >
          +{extraCount}
        </span>
      )}
    </div>
  );
};

export const MembersTab = () => {
  const { hobbies, members, fetchMembers } = useGroupChat();
  const [isListView, setIsListView] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector((state: TRootState) => state.UserSlice.user);
  const searchWord = useSelector(
    (state: TRootState) => state.SearchSlice.search,
  ).toLowerCase();
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    hobbies.forEach((hobby) => {
      fetchMembers(hobby);
    });
  }, [hobbies, fetchMembers]);

  const toggleView = () => {
    setIsListView((prev) => !prev);
  };

  const handleMemberClick = (memberId: string) => {
    if (currentUser?._id === memberId) {
      navigate("/profile", {
        state: { fromMembersTab: true },
      });
    } else {
      navigate(`/profile/${memberId}`);
    }
  };

  const filterMembers = (members: any[]) => {
    return members.filter((member) => {
      const fullName = member.name
        ? `${member.name.first || ""} ${member.name.last || ""}`.toLowerCase()
        : "";
      const username = member.username ? member.username.toLowerCase() : "";
      const email = member.email ? member.email.toLowerCase() : "";
      return (
        fullName.includes(searchWord) ||
        username.includes(searchWord) ||
        email.includes(searchWord)
      );
    });
  };

  return (
    <div
      className={`min-h-screen rounded-xl p-4 ${
        darkMode ? "bg-gray-50 text-gray-900" : "bg-gray-800 text-gray-100"
      }`}
      style={{
        border: `1px solid ${darkMode ? "#e5e7eb" : "#374151"}`,
      }}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              {" "}
              {/* New flex container for icon + text */}
              <FaUsers className="mr-2 text-xl text-blue-500" />{" "}
              {/* Using HiUsers from react-icons/hi */}
              <h1
                className={`text-base font-semibold ${darkMode ? "text-gray-800" : "text-white"}`}
              >
                Group Members
              </h1>
            </div>
            <span
              style={{ color: darkMode ? "#6b7280" : "#9ca3af" }}
              className="text-sm"
            >
              Search for members based on hobbies!
            </span>
          </div>
          <button
            onClick={toggleView}
            className={`rounded-full border p-2 shadow-sm hover:bg-opacity-80 ${
              darkMode
                ? "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                : "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            aria-label={
              isListView ? "Switch to grid view" : "Switch to list view"
            }
          >
            {isListView ? (
              <HiViewGrid className="text-xl" />
            ) : (
              <HiViewList className="text-xl" />
            )}
          </button>
        </div>
      </div>

      {hobbies.map((hobby) => (
        <div key={hobby} className="mb-8">
          <h2
            className={`mb-4 text-xl font-semibold ${
              darkMode ? "text-gray-800" : "text-gray-100"
            }`}
          >
            {hobby} Members
          </h2>
          {isListView ? (
            <ul className="space-y-4">
              {filterMembers(members[hobby] || []).map((member) => (
                <li
                  key={member._id}
                  className={`relative cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md ${
                    darkMode
                      ? "border-gray-200 bg-white hover:shadow-gray-200"
                      : "border-gray-700 bg-gray-900 hover:shadow-gray-800"
                  }`}
                  onClick={() => handleMemberClick(member._id)}
                >
                  <div className="flex items-start">
                    <img
                      src={member.profileImage?.url || "/default-profile.png"}
                      alt={member.username}
                      className="mr-4 size-14 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3
                            className={`text-lg font-semibold ${
                              darkMode ? "text-gray-900" : "text-white"
                            }`}
                          >
                            {member.username}
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-500" : "text-gray-300"
                            }`}
                          >
                            {member.name?.first} {member.name?.last}
                          </p>
                        </div>
                        <RoleBadge
                          role={
                            member.isAdmin
                              ? "admin"
                              : member.isModerator
                                ? "moderator"
                                : ""
                          }
                          darkMode={darkMode}
                        />
                      </div>
                      <div className="mt-3">
                        <HobbiesList
                          hobbies={member.hobbies}
                          darkMode={darkMode}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filterMembers(members[hobby] || []).map((member) => (
                <div
                  key={member._id}
                  className={`relative cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md ${
                    darkMode
                      ? "border-gray-200 bg-white hover:shadow-gray-200"
                      : "border-gray-700 bg-gray-900 hover:shadow-gray-800"
                  }`}
                  onClick={() => handleMemberClick(member._id)}
                >
                  <RoleBadge
                    role={
                      member.isAdmin
                        ? "admin"
                        : member.isModerator
                          ? "moderator"
                          : ""
                    }
                    darkMode={darkMode}
                  />
                  <div className="flex flex-col items-center pt-8">
                    <img
                      src={member.profileImage?.url || "/default-profile.png"}
                      alt={member.username}
                      className="mb-3 size-24 rounded-full object-cover"
                    />
                    <h3
                      className={`text-center text-lg font-semibold ${
                        darkMode ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {member.username}
                    </h3>
                    <p
                      className={`mb-3 text-center text-sm ${
                        darkMode ? "text-gray-500" : "text-gray-300"
                      }`}
                    >
                      {member.name?.first} {member.name?.last}
                    </p>
                    <div className="w-full">
                      <h4
                        className={`mb-1 text-sm font-medium ${
                          darkMode ? "text-gray-700" : "text-gray-300"
                        }`}
                      >
                        Hobbies
                      </h4>
                      <HobbiesList
                        hobbies={member.hobbies}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

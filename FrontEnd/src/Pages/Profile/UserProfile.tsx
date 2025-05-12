import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaArrowLeft, FaCrown, FaShieldAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { TRootState } from "../../Store/BigPie";
import PostList from "../Posts/PostList";
import { useProfileData } from "../../Hooks/useProfileData.ts";
import { useContext } from "react";
import { ThemeContext } from "../../Components/Layout/Header/ThemeToggle.tsx";

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: TRootState) => state.UserSlice.user);
  const showBackButton = location.state?.fromMembersTab;
  const {
    user: profileUser,
    calculateAge,
    selectedCountry,
  } = useProfileData(user?._id);
  const currentUser = useSelector((state: TRootState) => state.UserSlice.user);
  const isOwner = user?._id === currentUser?._id;
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div
        className={`w-full rounded-lg p-4 shadow-sm md:w-[70%] ${darkMode ? "bg-gray-50 text-gray-900" : "bg-gray-800 text-gray-100"
          }`}
        style={{
          border: `1px solid ${darkMode ? "#e5e7eb" : "#374151"}`,
        }}
      >
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className={`mb-6 flex items-center transition-colors ${darkMode
                ? "text-blue-500 hover:text-blue-700"
                : "text-blue-400 hover:text-blue-300"
              }`}
          >
            <FaArrowLeft className="mr-2" /> Back to Groups
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => navigate("/edit-user/" + user?._id)}
            className={`absolute left-0 top-0 p-2 hover:text-blue-600 ${darkMode ? "text-gray-600" : "text-gray-300"
              }`}
            aria-label="Edit profile"
          >
            <FaEdit size={20} />
          </button>

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
                className="object-cover mx-auto rounded-full size-24"
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
                className="object-cover rounded-full size-24"
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
              Your Hobbies
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
            {isOwner && (
              <p
                className={`mt-2 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
              >
                Want to change your hobbies?{" "}
                <button
                  onClick={() => navigate(`/edit-user/${user?._id}`)}
                  className={`hover:underline ${darkMode ? "text-blue-500" : "text-blue-400"
                    }`}
                >
                  Edit your profile
                </button>
              </p>
            )}
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
      </div>
    </div>
  );
};

export default UserProfile;

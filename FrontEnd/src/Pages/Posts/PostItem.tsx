import { useState, useContext } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart, FaTrashAlt, FaEdit } from "react-icons/fa";
import { TPost } from "../../Types/TPost.ts";
import Swal from "sweetalert2";
import PostForm from "./PostsForm/PostsForm.tsx";
import { useSelector } from "react-redux";
import { TRootState } from "../../Store/BigPie";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ThemeContext } from "../../Components/Layout/Header/ThemeToggle.tsx";

interface PostItemProps {
  post: TPost;
  isOwner: boolean;
  onPostUpdated: (updatedPost: TPost) => void;
  onPostDeleted: (postId: string) => void;
}

const formatPostTime = (dateString: string) => {
  const date = parseISO(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  return formatDistanceToNow(date, { addSuffix: true });
};

const PostItem = ({
  post,
  isOwner,
  onPostUpdated,
  onPostDeleted,
}: PostItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useSelector((state: TRootState) => state.UserSlice.user);
  const userId = user?._id;
  const token = localStorage.getItem("token");
  const { darkMode } = useContext(ThemeContext);

  const handleLike = async () => {
    if (!userId || isLiking || !post?.id) return;
    setIsLiking(true);
    try {
      const response = await axios.patch(
        `http://localhost:8181/posts/${post.id}`,
        {},
        { headers: { "x-auth-token": token } },
      );
      const updatedPost = {
        ...response.data,
        likes: response.data.likes || [],
        userId: post.userId,
      };
      onPostUpdated(updatedPost);

      const isNowLiked = updatedPost.likes.includes(userId.toString());

      Swal.fire({
        title: isNowLiked ? "Liked!" : "Unliked!",
        text: isNowLiked
          ? "You've liked this post"
          : "You've unliked this post",
        icon: "success",
        timerProgressBar: true,
        background: darkMode ? "#6d6d6d" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
        showConfirmButton: false,
        timer: 2000,
        showCloseButton: true,
      });
    } catch (error) {
      console.error("Failed to toggle like:", error);
      Swal.fire("Error!", "Failed to like post", "error");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!post?.id) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: darkMode ? "#6d6d6d" : "#ffffff",
      color: darkMode ? "#ffffff" : "#000000",
    });
    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        await axios.delete(`http://localhost:8181/posts/${post.id}`, {
          headers: { "x-auth-token": token },
        });
        onPostDeleted(post.id);
        Swal.fire({
          title: "Deleted!",
          text: "Your post has been deleted.",
          icon: "success",
          background: darkMode ? "#6d6d6d" : "#ffffff",
          color: darkMode ? "#ffffff" : "#000000",
        });
      } catch (error) {
        console.error("Failed to delete post:", error);
        Swal.fire("Error!", "Failed to delete post", "error");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const isLiked = userId
    ? (post.likes || []).includes(userId.toString())
    : false;

  return (
    <div
      className={`rounded-lg p-4 shadow-sm ${
        darkMode
          ? "border-gray-200 bg-white text-gray-900"
          : "border-gray-700 bg-gray-900 text-gray-100"
      }`}
      style={{
        border: `1px solid ${darkMode ? "#e5e7eb" : "#374151"}`,
      }}
    >
      {isEditing ? (
        <PostForm
          post={post}
          onPostCreated={(updatedPost) => {
            onPostUpdated({ ...updatedPost, userId: post.userId });
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="mb-2 flex items-start justify-between">
            <div
              className={`text-sm ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {formatPostTime(post.createdAt)}
              {post.edited && (
                <span
                  className={`ml-2 text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  (edited)
                </span>
              )}
            </div>
            {isOwner && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className={`p-1 transition-colors ${
                    darkMode
                      ? "text-gray-500 hover:text-blue-500"
                      : "text-gray-400 hover:text-blue-400"
                  }`}
                  aria-label="Edit post"
                  disabled={isDeleting}
                >
                  <FaEdit className="size-5 shrink-0" />
                </button>
                <button
                  onClick={handleDelete}
                  className={`p-1 transition-colors ${
                    darkMode
                      ? "text-gray-500 hover:text-red-500"
                      : "text-gray-400 hover:text-red-400"
                  }`}
                  aria-label="Delete post"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="text-sm">Deleting...</span>
                  ) : (
                    <FaTrashAlt className="size-5 shrink-0" />
                  )}
                </button>
              </div>
            )}
          </div>
          {post.content && (
            <p
              className={`mb-3 whitespace-pre-wrap break-words ${
                darkMode ? "text-gray-800" : "text-gray-100"
              }`}
            >
              {post.content}
            </p>
          )}
          {post.image?.url && (
            <div className="mb-3">
              <img
                src={post.image.url}
                alt={post.image.alt}
                className="h-auto max-h-64 max-w-full rounded-md object-cover"
              />
            </div>
          )}
          <div className="mt-2 flex items-center">
            <button
              onClick={handleLike}
              disabled={!userId || isLiking}
              className={`flex items-center space-x-1 transition-colors ${
                darkMode
                  ? "text-gray-500 hover:text-red-500"
                  : "text-gray-400 hover:text-red-400"
              } disabled:opacity-50`}
            >
              {isLiked ? (
                <FaHeart className="size-5 shrink-0 text-red-500" />
              ) : (
                <FaRegHeart className="size-5 shrink-0" />
              )}
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-600" : "text-gray-300"
                }`}
              >
                {post.likes?.length} like{post.likes?.length !== 1 ? "s" : ""}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PostItem;

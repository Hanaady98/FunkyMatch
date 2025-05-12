import { useState, useRef, ChangeEvent, useContext } from "react";
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosProgressEvent,
} from "axios";
import { TPost } from "../../../Types/TPost.ts";
import { FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { TRootState } from "../../../Store/BigPie.ts";
import { ThemeContext } from "../../../Components/Layout/Header/ThemeToggle.tsx";

interface PostFormProps {
  post?: TPost;
  onPostCreated: (newPost: TPost) => void;
  onCancel?: () => void;
}

interface ErrorResponse {
  message?: string;
}

const PostForm = ({ post, onPostCreated, onCancel }: PostFormProps) => {
  const [content, setContent] = useState(post?.content || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(post?.image?.url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token") || "";
  const user = useSelector((state: TRootState) => state.UserSlice.user);
  const { darkMode } = useContext(ThemeContext);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        Swal.fire({
          title: "Invalid File",
          text: "Only image files are allowed",
          icon: "error",
          timer: 3000,
          background: darkMode ? "#6d6d6d" : "#ffffff",
          color: darkMode ? "#ffffff" : "#000000",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: "File Too Large",
          text: "Maximum image size is 5MB",
          icon: "error",
          timer: 3000,
          background: darkMode ? "#6d6d6d" : "#ffffff",
          color: darkMode ? "#ffffff" : "#000000",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content && !imageFile && !post?.image) {
      Swal.fire({
        title: "Error!",
        text: "Post must have content or image",
        icon: "error",
        timer: 3000,
        background: darkMode ? "#6d6d6d" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      if (content.trim()) formData.append("content", content.trim());

      if (imageFile) {
        formData.append("file", imageFile);
      } else if (!preview && post?.image) {
        formData.append("removeImage", "true");
      }

      if (!post && user?._id) {
        formData.append("userId", user._id);
      }

      const config: AxiosRequestConfig<FormData> = {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          }
        },
        timeout: 20000,
      };

      const url = post
        ? `http://localhost:8181/posts/${post._id || post.id}`
        : "http://localhost:8181/posts";

      const response = await (post ? axios.put : axios.post)(
        url,
        formData,
        config,
      );
      onPostCreated(response.data);

      if (!post) {
        setContent("");
        setImageFile(null);
        setPreview(null);
        setUploadProgress(0);
      }

      Swal.fire({
        title: "Success!",
        text: `Post ${post ? "updated" : "created"} successfully!`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: darkMode ? "#6d6d6d" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Post Submission Error:", axiosError);

      let errorMessage = "Failed to save post";
      if (axiosError.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again.";
      } else if (axiosError.response) {
        if (axiosError.response.status === 413) {
          errorMessage = "File size is too large (max 5MB)";
        } else if (axiosError.response.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (axiosError.response.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else {
          errorMessage = `Server error (${axiosError.response.status})`;
        }
      } else if (axiosError.request) {
        errorMessage = "Network error - no response from server";
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        timer: 3000,
        background: darkMode ? "#6d6d6d" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
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
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="What's on your mind?"
          className={`w-full resize-none rounded-md p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
            darkMode
              ? "border-gray-200 bg-white text-gray-900"
              : "border-gray-600 bg-gray-700 text-gray-100"
          }`}
          rows={3}
          maxLength={150}
          disabled={isSubmitting}
        />

        <div className="mt-2 flex items-center justify-between">
          <span
            className={`text-xs ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {content.length}/150 characters
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center p-2 ${
              darkMode
                ? "text-gray-500 hover:text-blue-500"
                : "text-gray-400 hover:text-blue-400"
            }`}
            disabled={isSubmitting}
          >
            <FaImage className="h-5 w-5" />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/jpeg, image/png, image/gif, image/webp"
          className="hidden"
          disabled={isSubmitting}
        />

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div
            className={`mt-3 h-2.5 w-full rounded-full ${
              darkMode ? "bg-gray-200" : "bg-gray-600"
            }`}
          >
            <div
              className="h-2.5 rounded-full bg-blue-600"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {preview && (
          <div className="relative mt-3">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 w-full rounded-md object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className={`absolute right-2 top-2 rounded-full p-1 ${
                darkMode
                  ? "bg-white hover:text-red-500"
                  : "bg-gray-700 hover:text-red-400"
              }`}
              disabled={isSubmitting}
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-4 flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 text-sm ${
                darkMode
                  ? "text-gray-600 hover:text-gray-800"
                  : "text-gray-300 hover:text-gray-100"
              }`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex min-w-[80px] items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
            disabled={isSubmitting || (!content && !imageFile && !post?.image)}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                {uploadProgress > 0 ? `${uploadProgress}%` : "Processing..."}
              </>
            ) : post ? (
              "Update"
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PostForm;

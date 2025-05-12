import { useEffect, useState } from "react";
import { TUser } from "../../Types/TUser";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import EditUserSchema from "../../Validations/EditUserSchema";
import { useSelector } from "react-redux";
import { TRootState } from "../../Store/BigPie";
import { FaArrowLeft } from "react-icons/fa";
import ImageUploader from "../Register/ImageUploader/ImageUploader.tsx";
import CountrySelect from "../Register/CountrySelect/CountrySelect.tsx";
import { useContext } from "react";
import { ThemeContext } from "../../Components/Layout/Header/ThemeToggle.tsx";

type FormData = {
    username: string;
    name: {
        first: string;
        last: string;
    };
    profileImage: {
        url: string;
        alt: string;
    };
    address: {
        country: string;
        city: string;
        street: string;
    };
    birthDate: string;
    gender: string;
    hobbies: string[];
    bio: string;
};

const hobbiesList = [
    "Reading", "Traveling", "Photography", "Gaming", "Cooking",
    "Fitness", "Music", "Writing", "Art", "Sports",
    "Technology", "Design", "Coding", "Yoga", "Dancing"
];

const EditUser = () => {
    const [editUser, setEditUser] = useState<TUser>();
    const { id } = useParams<{ id: string }>();
    const currentUser = useSelector((state: TRootState) => state.UserSlice.user);
    const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
    const [previewImage, setPreviewImage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const nav = useNavigate();
    const { darkMode } = useContext(ThemeContext);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<FormData>({
        resolver: joiResolver(EditUserSchema),
    });

    const getUserData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token || !id) return;

            axios.defaults.headers.common["x-auth-token"] = token;
            const res = await axios.get(`http://localhost:8181/users/${id}`);
            setEditUser(res.data);
            setSelectedHobbies(res.data.hobbies || []);
            setPreviewImage(res.data.profileImage?.url || "");

            reset({
                username: res.data.username,
                name: {
                    first: res.data.name.first,
                    last: res.data.name.last,
                },
                profileImage: {
                    url: res.data.profileImage?.url || "",
                    alt: res.data.profileImage?.alt || "",
                },
                address: {
                    country: res.data.address?.country || "",
                    city: res.data.address?.city || "",
                    street: res.data.address?.street || "",
                },
                birthDate: res.data.birthDate?.split("T")[0] || "",
                gender: res.data.gender || "",
                hobbies: res.data.hobbies || [],
                bio: res.data.bio || "",
            });
        } catch (error) {
            Swal.fire({
                title: "Failed to load user data!",
                icon: "error",
                timerProgressBar: true,
                timer: 2000,
                toast: true,
                showCloseButton: true,
            });
            nav("/profile");
        }
    };

    const handleHobbyChange = (hobby: string) => {
        const newHobbies = selectedHobbies.includes(hobby)
            ? selectedHobbies.filter((h) => h !== hobby)
            : [...selectedHobbies, hobby];

        if (newHobbies.length <= 15) {
            setSelectedHobbies(newHobbies);
            setValue("hobbies", newHobbies, { shouldValidate: true });
        } else {
            Swal.fire({
                title: "Hobby Limit Reached",
                text: "You can have up to 15 hobbies maximum",
                icon: "warning",
                timer: 2000
            });
        }
    };

    const handleImageUpload = (url: string) => {
        setPreviewImage(url);
        setValue("profileImage.url", url, { shouldValidate: true });
        setValue("profileImage.alt", "User profile image", { shouldValidate: true });
    };

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token || !id) return;

            if (data.hobbies.length < 1) {
                throw new Error("You must have at least 1 hobby");
            }

            const submissionData = {
                ...data,
                birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
            };

            axios.defaults.headers.common["x-auth-token"] = token;
            await axios.put(`http://localhost:8181/users/${id}`, submissionData);

            Swal.fire({
                title: "Success!",
                text: "Your profile has been updated successfully",
                icon: "success",
                timerProgressBar: true,
                background: darkMode ? "#6d6d6d" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000",
                showConfirmButton: false,
                timer: 2000,
                showCloseButton: true,
            });
            nav("/profile");
        } catch (error: any) {
            Swal.fire({
                title: "Failed to update profile!",
                text: error.response?.data?.message || error.message,
                icon: "error",
                timerProgressBar: true,
                timer: 2000,
                showCloseButton: true,
                background: darkMode ? "#6d6d6d" : "#ffffff",
                color: darkMode ? "#ffffff" : "#000000",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        getUserData();
    }, [id]);

    if (!editUser) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                }`}>
                Loading...
            </div>
        );
    }

    if (!currentUser || currentUser._id !== id) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                }`}>
                Unauthorized
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className={`w-[90%] md:w-[70%] p-4 mx-auto rounded-lg shadow-sm min-h-screen ${darkMode ? "bg-gray-50 text-gray-900" : "bg-gray-800 text-gray-100"
                }`}
                style={{
                    border: `1px solid ${darkMode ? "#e5e7eb" : "#374151"}`,
                }}>
                <div className="relative">
                    <button
                        onClick={() => nav("/profile")}
                        className={`absolute top-0 left-0 p-2 transition-colors ${darkMode
                            ? "text-blue-500 hover:text-blue-700"
                            : "text-blue-400 hover:text-blue-300"
                            }`}
                        aria-label="Back to profile"
                    >
                        <FaArrowLeft size={20} />
                    </button>

                    <div className="flex flex-col items-center pt-10">
                        <h1 className={`mb-6 text-2xl font-bold ${darkMode ? "text-gray-900" : "text-white"
                            }`}>
                            Edit Profile
                        </h1>

                        <div className="relative mb-6">
                            <ImageUploader
                                onUploadSuccess={handleImageUpload}
                                currentImage={previewImage}
                            />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className={`block mb-1 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                                }`}>
                                First Name
                            </label>
                            <input
                                type="text"
                                {...register("name.first")}
                                className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${darkMode
                                    ? "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                                    : "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                                    }`}
                            />
                            {errors.name?.first && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.name.first.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={`block mb-1 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                                }`}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                {...register("name.last")}
                                className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${darkMode
                                    ? "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                                    : "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                                    }`}
                            />
                            {errors.name?.last && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.name.last.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={`block mb-1 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                            }`}>
                            Username
                        </label>
                        <input
                            type="text"
                            {...register("username")}
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${darkMode
                                ? "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                                : "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                                }`}
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-400">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className={`block mb-1 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                                }`}>
                                Country
                            </label>

                            <CountrySelect
                                value={watch("address.country") || ""}
                                onChange={(value: string) => {
                                    setValue("address.country", value, { shouldValidate: true });
                                }}
                                darkMode={darkMode}
                                invertedColors={true}  // flips the color scheme
                            />

                            {errors.address?.country && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.address.country.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={`block mb-1 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                                }`}>
                                City
                            </label>
                            <input
                                type="text"
                                {...register("address.city")}
                                className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${darkMode
                                    ? "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                                    : "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                                    }`}
                            />
                            {errors.address?.city && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.address.city.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={`block mb-1 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                                }`}>
                                Street
                            </label>
                            <input
                                type="text"
                                {...register("address.street")}
                                className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${darkMode
                                    ? "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                                    : "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                                    }`}
                            />
                            {errors.address?.street && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.address.street.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className={`block mb-1 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                                }`}>
                                Birth Date
                            </label>
                            <input
                                type="date"
                                {...register("birthDate")}
                                className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${darkMode
                                    ? "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                                    : "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                                    }`}
                            />
                            {errors.birthDate && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.birthDate.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={`block mb-1 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                                }`}>
                                Gender
                            </label>
                            <select
                                {...register("gender")}
                                className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${darkMode
                                    ? "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                                    : "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                                    }`}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            {errors.gender && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.gender.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={`block mb-1 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                            }`}>
                            Your Hobbies ({selectedHobbies.length}/15)
                        </label>
                        <div className={`flex flex-wrap items-center gap-2 p-3 rounded-lg ${darkMode ? "bg-gray-100" : "bg-gray-700"
                            }`}>
                            {selectedHobbies.map((hobby) => (
                                <div
                                    key={hobby}
                                    className={`flex items-center gap-2 px-3 py-1 text-sm rounded-full ${darkMode
                                        ? "bg-white text-gray-700 border border-gray-200"
                                        : "bg-gray-600 text-gray-200"
                                        }`}
                                >
                                    {hobby}
                                    <button
                                        type="button"
                                        onClick={() => handleHobbyChange(hobby)}
                                        className={`${darkMode ? "text-gray-500 hover:text-red-500" : "text-gray-300 hover:text-red-400"
                                            }`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3">
                            <label className={`block mb-2 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                                }`}>
                                Add More Hobbies
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {hobbiesList
                                    .filter(hobby => !selectedHobbies.includes(hobby))
                                    .map((hobby) => (
                                        <button
                                            key={hobby}
                                            type="button"
                                            onClick={() => handleHobbyChange(hobby)}
                                            disabled={selectedHobbies.length >= 15}
                                            className={`rounded-full px-4 py-2 text-sm ${selectedHobbies.length >= 15
                                                ? "cursor-not-allowed opacity-50"
                                                : darkMode
                                                    ? "bg-blue-100 hover:bg-blue-200 text-blue-800"
                                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                                }`}
                                        >
                                            {hobby} +
                                        </button>
                                    ))}
                            </div>
                        </div>
                        {errors.hobbies && (
                            <p className="mt-1 text-sm text-red-400">
                                {errors.hobbies.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={`block mb-1 text-sm font-medium ${darkMode ? "text-gray-700" : "text-gray-300"
                            }`}>
                            Bio
                        </label>
                        <textarea
                            {...register("bio")}
                            rows={4}
                            style={{ resize: "none" }}
                            className={`w-full p-2 border rounded focus:outline-none focus:ring-1 ${darkMode
                                ? "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                                : "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                                }`}
                        />
                        {errors.bio && (
                            <p className="mt-1 text-sm text-red-400">
                                {errors.bio.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => nav("/profile")}
                            className={`px-4 py-2 text-sm font-medium rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${darkMode
                                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                : "bg-gray-600 text-white hover:bg-gray-700"
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 text-sm font-medium text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 ${darkMode
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;

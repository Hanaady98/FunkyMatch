import { useState, useEffect } from "react";
import { Label, TextInput, Button, Avatar } from "flowbite-react";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import LoginSchema from "../../Validations/LoginSchema";
import { useDispatch } from "react-redux";
import { userActions } from "../../Store/UserSlice";
import { useNavigate } from "react-router-dom";
import { decode } from "../../Services/TokenService";
import Swal from "sweetalert2";
import { connectSocket, disconnectSocket } from '../../Services/SocketService.ts';

interface UserProfile {
  name: {
    first: string;
    last: string;
  };
  profileImage: {
    url: string;
    alt?: string;
  };
  email: string;
  username: string;
}

interface LoginFormData {
  login: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
  darkMode?: boolean;
}

const LoginForm = ({ onSuccess, darkMode = false }: LoginFormProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormData>({
    mode: "onChange",
    resolver: joiResolver(LoginSchema),
  });

  const loginInput = watch("login");

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (loginInput && loginInput.length >= 3) {
        setIsLoadingProfile(true);
        try {
          const response = await axios.get<UserProfile>(
            `http://localhost:8181/users/profile/${loginInput}`
          );
          setProfile(response.data);
        } catch (error) {
          setProfile(null);
          const axiosError = error as AxiosError;
          if (axiosError.response?.status !== 404) {
            console.error("Error fetching profile:", error);
          }
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setProfile(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loginInput]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await axios.post(
        "http://localhost:8181/users/login",
        {
          login: data.login,
          password: data.password
        }
      );

      const { token, user: userData } = response.data;

      if (!token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", token);
      axios.defaults.headers.common["x-auth-token"] = token;

      const socket = connectSocket(token);

      socket.on('accountBanned', ({ reason, expiry }) => {
        Swal.fire({
          title: "Account Banned",
          text: `You have been banned. Reason: ${reason}. Duration: ${expiry}`,
          icon: "error",
          confirmButtonText: "OK",
          background: darkMode ? '#ffffff' : '#6d6d6d',
          color: darkMode ? '#000000' : '#ffffff'
        }).then(() => {
          logout();
          nav("/");
        });
      });

      try {
        const decoded = decode(token);
        if (!decoded?._id) {
          throw new Error("Invalid token structure");
        }
        socket.once('connect', () => {
          dispatch(userActions.login(userData));

          Swal.fire({
            title: "Login Successful!",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            background: darkMode ? '#ffffff' : '#6d6d6d',
            color: darkMode ? '#000000' : '#ffffff'
          });

          nav("/");
          onSuccess?.();
        });
      } catch (decodeError) {
        console.error("Token decode error:", decodeError);
        throw new Error("Failed to process authentication token");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, reason?: string, expiry?: string }>;
      if (axiosError.response?.status === 403) {
        Swal.fire({
          title: "Login Failed",
          text: `You have been banned. Reason: ${axiosError.response.data.reason}. Duration: ${axiosError.response.data.expiry}`,
          icon: "error",
          timer: 2000,
          background: darkMode ? '#ffffff' : '#6d6d6d',
          color: darkMode ? '#000000' : '#ffffff'
        });
      } else {
        Swal.fire({
          title: "Login Failed",
          text: axiosError.response?.data?.message || "Invalid credentials",
          icon: "error",
          timer: 2000,
          background: darkMode ? '#ffffff' : '#6d6d6d',
          color: darkMode ? '#000000' : '#ffffff'
        });
      }
    }
  };

  const logout = () => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      background: darkMode ? '#ffffff' : '#6d6d6d',
      color: darkMode ? '#000000' : '#ffffff',
      confirmButtonText: "Yes, log out!"
    }).then((result) => {
      if (result.isConfirmed) {
        disconnectSocket();
        localStorage.removeItem("token");
        dispatch(userActions.logout());
        Swal.fire({
          title: "You Logged Out!",
          icon: "success",
          timerProgressBar: true,
          timer: 2000,
          background: darkMode ? '#ffffff' : '#6d6d6d',
          color: darkMode ? '#000000' : '#ffffff',
          showConfirmButton: false,
          showCloseButton: true
        });
        nav("/");
      }
    });
  };

  return (
    <div className={`w-full p-6 ${darkMode ? 'text-gray-900' : 'text-white'}`}>
      <div className="flex flex-col items-center mb-6">
        {isLoadingProfile ? (
          <div className={`flex items-center justify-center rounded-full size-24 ${darkMode ? 'bg-gray-200' : 'bg-gray-700'
            }`}>
            <div className={`animate-pulse ${darkMode ? 'text-gray-500' : 'text-gray-300'}`}>
              Loading...
            </div>
          </div>
        ) : profile?.profileImage?.url ? (
          <Avatar
            img={profile.profileImage.url}
            alt={profile.profileImage.alt || "Profile"}
            rounded
            size="xl"
          />
        ) : (
          <div className={`flex items-center justify-center rounded-full size-24 ${darkMode ? 'bg-gray-200' : 'bg-gray-700'
            }`}>
            <span className={darkMode ? 'text-gray-500' : 'text-gray-300'}>
              No profile
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
        <div>
          <Label
            htmlFor="login"
            value="Email or Username"
            className={darkMode ? 'text-gray-900' : 'text-white'}
          />
          <TextInput
            id="login"
            type="text"
            placeholder="name@example.com or username"
            {...register("login")}
            color={errors.login ? "failure" : "gray"}
            theme={{
              field: {
                input: {
                  colors: {
                    gray: darkMode
                      ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                      : 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                  }
                }
              }
            }}
          />
          {errors.login && (
            <p className="mt-1 text-sm text-red-400">
              {errors.login.message?.toString()}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor="password"
            value="Password"
            className={darkMode ? 'text-gray-900' : 'text-white'}
          />
          <TextInput
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            color={errors.password ? "failure" : "gray"}
            theme={{
              field: {
                input: {
                  colors: {
                    gray: darkMode
                      ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                      : 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                  }
                }
              }
            }}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">
              {errors.password.message?.toString()}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !isValid}
          color={darkMode ? "blue" : "light"}
        >
          {isSubmitting ? "Logging in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
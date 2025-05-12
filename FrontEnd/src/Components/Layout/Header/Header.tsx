import React, { useContext, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import SideMenu from "../SideMenu/SideMenu.tsx";
import SearchInput from "./SearchInput.tsx";
import ThemeToggle, { ThemeContext } from "./ThemeToggle.tsx";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { disconnectSocket } from "../../../Services/SocketService.ts";
import { useDispatch, useSelector } from "react-redux";
import { TUserState, userActions } from "../../../Store/UserSlice.ts";
import { TRootState } from "../../../Store/BigPie.ts";

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const { darkMode } = useContext(ThemeContext);
  const { isLoggedIn, user } = useSelector<TRootState, TUserState>(
    (state) => state.UserSlice,
  );
  const dispatch = useDispatch();
  const nav = useNavigate();

  const isAdmin = user?.isAdmin || false;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /* ---------------------------- LogOut ---------------------------- */
  const logout = () => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      background: "#6d6d6d",
      color: "#ffffff",
      confirmButtonText: "Yes, log out!",
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
          background: "#6d6d6d",
          color: "#ffffff",
          showConfirmButton: false,
          showCloseButton: true,
        });
      }
      nav("/");
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      (async () => {
        axios.defaults.headers.common["x-auth-token"] = token;
        const user = await axios.get(
          "http://localhost:8181/users/" +
          (jwtDecode(token) as { _id: string })._id,
        );
        dispatch(userActions.login(user.data));
      })();
    }
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between p-4 text-white shadow-md`}
        style={{
          backgroundColor: darkMode
            ? "var(--bg-sidemenu)"
            : "var(--bg-sidemenu)",
          color: darkMode ? "var(--text-sidemenu)" : "var(--text-sidemenu)",
        }}
      >
        <div className="flex items-center space-x-4">
          <button onClick={toggleMenu} className="hover:text-gray-300">
            <FaBars className="w-6 h-6" />
          </button>

          {/*-------------------- Logo --------------------*/}
          <Link to="/" className="flex items-center">
            <img
              src="/fm2.png"
              alt="logo pic"
              style={{
                width: "45px",
                borderRadius: "50%",
                marginRight: "10px",
              }}
            />
            <span className="self-center hidden text-lg font-semibold text-blue-300 whitespace-nowrap sm:block">
              Funky Match
            </span>
            <span className="self-center text-lg font-semibold text-blue-300 whitespace-nowrap sm:hidden">
              FM
            </span>
          </Link>
          {/*----------------------------------------------*/}
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <div className="w-28 sm:w-48 md:w-64">
              {" "}
              {/* Adjusted width classes */}
              <SearchInput />
            </div>
          )}

          <ThemeToggle />

          {/* ---------------------------- profile ---------------------------- */}
          {isLoggedIn && user && (
            <Link to="/profile" className="cursor-pointer">
              <img
                src={user.profileImage?.url || "/default-profile.png"}
                alt="profile pic"
                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
              />
            </Link>
          )}
          {/* ----------------------------------------------------------- */}
        </div>
      </header>


      <SideMenu
        isOpen={isMenuOpen}
        logout={logout}
        isLoggedIn={Boolean(isLoggedIn)}
        isAdmin={isAdmin}
        setIsMenuOpen={setIsMenuOpen}
      />

    </>
  );
};

export default Header;

"use client";

import { useState, useContext } from "react";
import Header from "./Components/Layout/Header/Header.tsx";
import { Route, Routes } from "react-router-dom";
import About from "./Pages/About/About.tsx";
import Contact from "./Pages/Contact/Contact.tsx";
import { ThemeContext } from "./Components/Layout/Header/ThemeToggle.tsx";
import HomeSwitcher from "./Pages/Home/HomeSwitcher/HomeSwitcher.tsx";
import UserProfile from "./Pages/Profile/UserProfile.tsx";
import RouteGuard from "./Shared/RouteGuard.tsx";
import Error from "./Pages/Error/Error.tsx";
import EditUser from "./Pages/EditUser/EditUser.tsx";
import PublicUserProfile from "./Pages/Profile/PublicUserProfile.tsx";
import Crm from "./Pages/Admin/Crm.tsx";
import PrivateChatView from "./Components/LoggedInHome/Chat/PrivateChatView.tsx";
import PrivateChatList from "./Components/LoggedInHome/Contexts/PrivateChatList.tsx";

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode } = useContext(ThemeContext);

  return (
    <>
      {/* Apply background color to the entire page */}
      <div style={{ backgroundColor: darkMode ? "#ffffff" : "#030712" }}>
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <div className={`mt-16 transition-all duration-300 ease-in-out ${isMenuOpen ? "md:ml-64" : "md:ml-14"
          }`}>

          <Routes>
            <Route path="/" element={<HomeSwitcher />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route
              path="/profile"
              element={
                <RouteGuard>
                  <UserProfile />
                </RouteGuard>
              }
            />

            <Route
              path="/profile/:id"
              element={
                <RouteGuard>
                  <PublicUserProfile />
                </RouteGuard>
              }
            />

            <Route
              path="/edit-user/:id"
              element={
                <RouteGuard>
                  <EditUser />
                </RouteGuard>
              }
            />

            <Route
              path="/private-chat"
              element={
                <RouteGuard>
                  <PrivateChatList />
                </RouteGuard>
              }
            />

            <Route
              path="/private-chat/:roomId"
              element={
                <RouteGuard>
                  <PrivateChatView />
                </RouteGuard>
              }
            />

            <Route
              path="/crm"
              element={
                <RouteGuard adminOnly>
                  <Crm />
                </RouteGuard>
              }
            />

            <Route path="/*" element={<Error />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;

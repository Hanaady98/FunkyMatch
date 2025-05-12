import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import {
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { ThemeContext } from "../Header/ThemeToggle.tsx";
import MenuItem from "./MenuItem";

interface SideMenuProps {
  isOpen: boolean;
  logout: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  logout,
  isLoggedIn,
  isAdmin,
  setIsMenuOpen,
}) => {
  const location = useLocation().pathname;
  const { darkMode } = useContext(ThemeContext);

  const menuItems = [
    { to: "/", icon: FaHome, label: "Home" },
    { to: "/about", icon: FaInfoCircle, label: "About" },
    { to: "/contact", icon: FaEnvelope, label: "Contact" },
  ];

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu */}
      <div className="md:hidden">
        <div
          className={`fixed left-0 right-0 top-16 z-40 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-screen" : "max-h-0"
            }`}
          style={{
            backgroundColor: darkMode ? "var(--bg-sidemenu)" : "var(--bg-sidemenu)",
            color: darkMode ? "var(--text-sidemenu)" : "var(--text-sidemenu)",
          }}
        >
          <nav className="flex flex-col p-2 space-y-2">
            {menuItems.map((item) => (
              <MenuItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                location={location}
                darkMode={darkMode}
                isOpen={true}
                closeMenu={closeMenu}
              />
            ))}

            {isLoggedIn && (
              <MenuItem
                key="/profile"
                to="/profile"
                icon={FaUser}
                label="Profile"
                location={location}
                darkMode={darkMode}
                isOpen={true}
                closeMenu={closeMenu}
              />
            )}

            {isAdmin && (
              <MenuItem
                key="/crm"
                to="/crm"
                icon={MdAdminPanelSettings}
                label="Crm"
                location={location}
                darkMode={darkMode}
                isOpen={true}
                closeMenu={closeMenu}
              />
            )}

            {isLoggedIn && (
              <div
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="flex items-center justify-start p-2 transition-colors rounded-md cursor-pointer hover:bg-white hover:bg-opacity-20"
              >
                <FaSignOutAlt className="w-5 h-5" />
                <span className="ml-3">Logout</span>
              </div>
            )}

            <div className={`p-2 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
              Made with 💙 by Hanady and Yahav
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:block">
        <div
          className={`fixed left-0 top-16 h-[calc(100vh-64px)] shadow-lg transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-14"
            }`}
          style={{
            backgroundColor: darkMode ? "var(--bg-sidemenu)" : "var(--bg-sidemenu)",
            color: darkMode ? "var(--text-sidemenu)" : "var(--text-sidemenu)",
          }}
        >
          <nav className="flex flex-col justify-between h-full">
            <div className="p-2 space-y-2">
              {menuItems.map((item) => (
                <MenuItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  location={location}
                  darkMode={darkMode}
                  isOpen={isOpen}
                />
              ))}

              {isLoggedIn && (
                <MenuItem
                  key="/profile"
                  to="/profile"
                  icon={FaUser}
                  label="Profile"
                  location={location}
                  darkMode={darkMode}
                  isOpen={isOpen}
                />
              )}

              {isAdmin && (
                <MenuItem
                  key="/crm"
                  to="/crm"
                  icon={MdAdminPanelSettings}
                  label="Crm"
                  location={location}
                  darkMode={darkMode}
                  isOpen={isOpen}
                />
              )}

              {isLoggedIn && (
                <div
                  onClick={logout}
                  className={`flex cursor-pointer items-center rounded-md p-2 transition-colors hover:bg-white hover:bg-opacity-20 ${isOpen ? "justify-start" : "justify-center"
                    }`}
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  {isOpen && <span className="ml-3">Logout</span>}
                </div>
              )}
            </div>

            <div
              className={`p-2 text-center text-sm ${darkMode ? "text-gray-900" : "text-gray-500"
                }`}
            >
              {isOpen ? (
                "Made with 💙 by Hanady and Yahav"
              ) : (
                <div className="flex justify-center">H & Y</div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};
export default SideMenu;
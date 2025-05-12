// import { Link } from "react-router-dom";
// import { IconType } from "react-icons";

// interface MenuItemProps {
//   to: string;
//   icon: IconType;
//   label: string;
//   location: string;
//   darkMode: boolean;
//   isOpen: boolean;
// }

// const MenuItem: React.FC<MenuItemProps> = ({
//   to,
//   icon: Icon,
//   label,
//   location,
//   darkMode,
//   isOpen,
// }) => {
//   return (
//     <Link
//       to={to}
//       className={`flex items-center space-x-4 rounded-lg p-2 transition-all duration-300 ease-in-out ${location === to
//         ? "bg-[var(--hover-sidemenu)]"
//         : darkMode
//           ? "text-[var(--text-sidemenu)] hover:bg-[var(--hover-sidemenu)] hover:text-gray-400"
//           : "text-[var(--text-sidemenu)] hover:bg-[var(--hover-sidemenu)] hover:text-gray-400"
//         }`}
//       style={{
//         background:
//           location === to
//             ? "linear-gradient(to right, rgba(255, 255, 255, 0.1), #aa55fa)"
//             : "transparent",
//       }}
//     >
//       <Icon className="h-6 w-6 min-w-[24px]" />
//       <span
//         className={`overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}
//       >
//         {label}
//       </span>
//     </Link>
//   );
// };

// export default MenuItem;


import { Link } from "react-router-dom";
import { IconType } from "react-icons";

interface MenuItemProps {
  to: string;
  icon: IconType;
  label: string;
  location: string;
  darkMode: boolean;
  isOpen: boolean;
  closeMenu?: () => void; // Add this optional prop
}

const MenuItem: React.FC<MenuItemProps> = ({
  to,
  icon: Icon,
  label,
  location,
  darkMode,
  isOpen,
  closeMenu, // Destructure the new prop
}) => {
  return (
    <Link
      to={to}
      onClick={closeMenu} // Add the onClick handler
      className={`flex items-center space-x-4 rounded-lg p-2 transition-all duration-300 ease-in-out ${location === to
        ? "bg-[var(--hover-sidemenu)]"
        : darkMode
          ? "text-[var(--text-sidemenu)] hover:bg-[var(--hover-sidemenu)] hover:text-gray-400"
          : "text-[var(--text-sidemenu)] hover:bg-[var(--hover-sidemenu)] hover:text-gray-400"
        }`}
      style={{
        background:
          location === to
            ? "linear-gradient(to right, rgba(255, 255, 255, 0.1), #aa55fa)"
            : "transparent",
      }}
    >
      <Icon className="h-6 w-6 min-w-[24px]" />
      <span
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
          }`}
      >
        {label}
      </span>
    </Link>
  );
};

export default MenuItem;
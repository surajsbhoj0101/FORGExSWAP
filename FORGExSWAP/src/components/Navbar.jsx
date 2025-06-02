import React, { useState } from "react";
import MoonIcon from "../assets/images/moon-svgrepo-com.svg";
import SunIcon from "../assets/images/light-mode-svgrepo-com.svg";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { MdMenuOpen, MdClose } from "react-icons/md";

function Navbar() {
  const { isDarkMode, toggleDark } = useTheme();
  const [isSidebar, setSidebar] = useState(false);

  const toggleSidebar = () => setSidebar((prev) => !prev);
  const closeSidebar = () => setSidebar(false);

  return (
    <>
      <header className="shadow-md relative z-40 px-3 lg:px-16 min-[490px]:py-4 min-[490px]:px-6 py-2 flex items-center justify-between bg-white dark:bg-gray-900">
        {/* Logo */}
        <div className="logo">
          <p className="min-[490px]:text-2xl text-lg md:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-transparent bg-clip-text drop-shadow-md">
            FORGExSWAP
          </p>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden min-[914px]:flex gap-x-8 text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200">
          <Link
            to="#"
            className="hover:text-cyan-500 transition-colors duration-300"
          >
            Swap Tokens
          </Link>
          <Link
            to="#"
            className="hover:text-blue-500 transition-colors duration-300"
          >
            Create Token
          </Link>
          <Link
            to="#"
            className="hover:text-violet-500 transition-colors duration-300"
          >
            Portfolio
          </Link>
          <Link
            to="#"
            className="hover:text-pink-500 transition-colors duration-300"
          >
            Trade
          </Link>
        </nav>

        {/* Controls */}
        <div className="flex items-center space-x-1 min-[490px]:space-x-4 md:space-x-8">
          <button className="min-[490px]:px-3 cursor-pointer min-[490px]:py-2 px-2 py-1 min-[490px]:text-[18px] text-sm  rounded-md font-semibold text-white bg-cyan-500 hover:bg-indigo-500 transition-all duration-300">
            Connect
          </button>

          <button
            aria-label="Toggle Dark Mode"
            onClick={toggleDark}
            className="p-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <img
              className="w-6 h-6"
              src={isDarkMode ? SunIcon : MoonIcon}
              alt={isDarkMode ? "Light Mode" : "Dark Mode"}
            />
          </button>

          {/* Mobile Menu Toggle */}
          <div
            className="block min-[914px]:hidden p-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleSidebar}
          >
            <MdMenuOpen
              size={28}
              className="text-gray-700 dark:text-gray-200 transition-colors duration-300"
            />
          </div>
        </div>
      </header>

      {/* Full-screen Sidebar Overlay */}
      <div
        className={`fixed opacity-90 inset-0 z-50 bg-white dark:bg-gray-900 transform transition-transform duration-300 ${
          isSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={closeSidebar}
            aria-label="Close Menu"
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <MdClose className="text-3xl text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        <div className="flex min-[914px]:flex flex-col items-center space-y-8 h-[calc(100vh-80px)] text-2xl font-semibold text-gray-700 dark:text-gray-200">
          <Link
            to="#"
            onClick={closeSidebar}
            className="hover:text-cyan-500 transition"
          >
            Swap Tokens
          </Link>
          <Link
            to="#"
            onClick={closeSidebar}
            className="hover:text-blue-500 transition"
          >
            Create Token
          </Link>
          <Link
            to="#"
            onClick={closeSidebar}
            className="hover:text-violet-500 transition"
          >
            Portfolio
          </Link>
          <Link
            to="#"
            onClick={closeSidebar}
            className="hover:text-pink-500 transition"
          >
            Trade
          </Link>
        </div>
      </div>
    </>
  );
}

export default Navbar;

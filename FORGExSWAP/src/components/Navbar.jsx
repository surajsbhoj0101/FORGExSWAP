import React, { useState } from "react";
import MoonIcon from "../assets/images/moon-svgrepo-com.svg";
import SunIcon from "../assets/images/light-mode-svgrepo-com.svg";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { MdMenuOpen, MdClose } from "react-icons/md";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SiGoogledocs } from "react-icons/si";
import { FaRegLightbulb } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";

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
          <Link
            to="/"
            className="min-[490px]:text-2xl text-xl md:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-transparent bg-clip-text drop-shadow-md"
          >
            FORGExSWAP
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden min-[1150px]:flex gap-x-8 text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200">
          <Link
            to="/swap"
            className="hover:text-cyan-500 text-shadow-2xl transition-colors duration-300"
          >
            Swap Tokens
          </Link>
          <Link
            to="/createToken"
            className="hover:text-blue-500 transition-colors duration-300"
          >
            Create Token
          </Link>
          <Link
            to="/liquidity"
            className="hover:text-violet-500 transition-colors duration-300"
          >
            Liquidity
          </Link>
          
          <Link
            to="/trade"
            className="hover:text-pink-500 transition-colors duration-300"
          >
            Trade
          </Link>
        </nav>

        {/* Controls */}
        <div className="flex items-center space-x-4  min-[490px]:space-x-4 md:space-x-8">
          <div className="hidden min-[360px]:flex">
            <ConnectButton
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
              chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
              className="px-3 py-2 text-sm sm:text-[18px] rounded-md font-semibold text-white
                      bg-cyan-500 hover:bg-indigo-500 shadow-5xl transition-all duration-300 cursor-pointer
                      "
            />
          </div>



          {/* Mobile Menu Toggle */}
          <div
            className="block min-[1150px]:hidden p-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
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
        className={`fixed opacity-90 min-[1150px]:hidden  inset-0 z-50 bg-white dark:bg-gray-900 transform transition-transform duration-300 ${isSidebar ? "translate-x-0" : "translate-x-full"
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

        <div className="flex min-[1150px]:flex flex-col items-center space-y-6 h-[calc(100vh-80px)] text-2xl font-semibold text-gray-700 dark:text-gray-200">
          {/* Connect Button - Visible below 360px */}
          <div className="block min-[1150px]:hidden">
            <ConnectButton
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
              chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
              className="
        px-4 py-2 text-sm sm:text-lg rounded-md font-semibold text-white
        bg-cyan-500 hover:bg-indigo-500 hover:shadow-lg
        transition-all duration-300 transform hover:scale-105 cursor-pointer
      "
            />
          </div>

          {/* Navigation Links */}
          <Link
            to="/swap"
            onClick={closeSidebar}
            className="hover:text-cyan-500 transition duration-200 transform hover:scale-105"
          >
            Swap Tokens
          </Link>

          <Link
            to="/createToken"
            onClick={closeSidebar}
            className="hover:text-blue-500 transition duration-200 transform hover:scale-105"
          >
            Create Token
          </Link>

         

          <Link
            to="/trade"
            onClick={closeSidebar}
            className="hover:text-pink-500 transition duration-200 transform hover:scale-105"
          >
            Trade
          </Link>

          <Link
            onClick={closeSidebar}
            to="/liquidity"
            className="hover:text-violet-500 transition-colors duration-300"
          >
            Liquidity
          </Link>

          {/* Feedback */}
          <div className=" font-semibold text-gray-700 dark:text-gray-200 flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-200 hover:dark:bg-gray-800 transition duration-300 hover:scale-105">
            <FaRegLightbulb className="text-yellow-400" />
            <Link to="https://docs.google.com/forms/d/e/1FAIpQLSfkBQfrWGKZA2De8KQ7tIlXsJSBP6dGIP6ElwaorH5dyo2Oig/viewform" className="hover:text-cyan-500 transition">
              Feedback
            </Link>
          </div>

          {/* Docs */}
          <div className=" font-semibold text-gray-700 dark:text-gray-200 flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-200 hover:dark:bg-gray-800 transition duration-300 hover:scale-105">
            <SiGoogledocs className="text-violet-500" />
            <Link to="#" className="hover:text-violet-500 transition">
              Docs
            </Link>
          </div>

          {/* GitHub */}
          <div className=" font-semibold text-gray-700 dark:text-gray-200 flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-200 hover:dark:bg-gray-800 transition duration-300 hover:scale-105">
            <Link to="https://github.com/surajsbhoj0101/FORGExSWAP" className="transition">
              <FaGithub size={30} />
            </Link>
          </div>

          {/* Twitter */}
          <div className=" font-semibold text-gray-700 dark:text-gray-200 flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-200 hover:dark:bg-gray-800 transition duration-300 hover:scale-105">
            <Link to="#" className="transition">
              <FaSquareXTwitter size={30} />
            </Link>
          </div>

          <button
            aria-label="Toggle Dark Mode"
            onClick={toggleDark}
            className="p-1 px-2 rounded-xs cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <img
              className="w-8 h-8"
              src={isDarkMode ? SunIcon : MoonIcon}
              alt={isDarkMode ? "Light Mode" : "Dark Mode"}
            />
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;

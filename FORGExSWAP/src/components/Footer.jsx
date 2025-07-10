import React from "react";
import MoonIcon from "../assets/images/moon-svgrepo-com.svg";
import SunIcon from "../assets/images/light-mode-svgrepo-com.svg";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { SiGoogledocs } from "react-icons/si";
import { FaRegLightbulb } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";

function Footer() {
  const { isDarkMode, toggleDark } = useTheme();
  return (
    <div className="fixed px-2 justify-between items-center bottom-0 left-0  z-50  w-full bg-white dark:bg-gray-900 hidden min-[914px]:flex">
      <div className="flex space-x-1 items-center">
        <div className="text-gray-700 px-2 rounded-xs hover:dark:bg-gray-800 hover:bg-gray-300 dark:text-gray-200 flex space-x-1 text-sm font-semibold items-center">
          <FaRegLightbulb />
          <Link to="mailto:surajsbhoj@gmail.com" className="hover:text-cyan-500 transition">
            Contact
          </Link>
        </div>

      </div>
      <div className="flex space-x-1 items-center">
        <div className="text-gray-700 px-2 rounded-xs hover:dark:bg-gray-800 hover:bg-gray-300 dark:text-gray-200 flex space-x-1 text-sm font-semibold items-center">
          <FaRegLightbulb />
          <Link to="https://docs.google.com/forms/d/e/1FAIpQLSfkBQfrWGKZA2De8KQ7tIlXsJSBP6dGIP6ElwaorH5dyo2Oig/viewform" className="hover:text-cyan-500 transition">
            Feedback
          </Link>
        </div>

        <div className="text-gray-700 px-2 rounded-xs hover:dark:bg-gray-800 hover:bg-gray-300 dark:text-gray-200 flex space-x-1 text-sm font-semibold items-center">
          <SiGoogledocs />
          <Link to="#" className="hover:text-violet-500 transition">
            Docs
          </Link>
        </div>

        <div className="text-gray-700 px-2 rounded-xs hover:dark:bg-gray-800 hover:bg-gray-300 dark:text-gray-200 flex space-x-1 text-sm font-semibold items-center">
          <Link to="https://github.com/surajsbhoj0101/FORGExSWAP" className=" transition">
            <FaGithub size={20} />
          </Link>
        </div>

        <div className="text-gray-700 px-2 rounded-xs hover:dark:bg-gray-800 hover:bg-gray-300 dark:text-gray-200 flex space-x-1 text-sm font-semibold items-center">
          <Link to="#" className=" transition">
            <FaSquareXTwitter size={20} />
          </Link>
        </div>

        <button title={isDarkMode?"Light Mode":"Dark Mode"}
          aria-label="Toggle Dark Mode"
          onClick={toggleDark}
          className="p-1 px-2 rounded-xs cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <img
            className="w-5 h-5"
            src={isDarkMode ? SunIcon : MoonIcon}
            alt={isDarkMode ? "Light Mode" : "Dark Mode"}
          />
        </button>
      </div>
    </div>
  );
}

export default Footer;

import React from 'react'
import imageDark from '../../../assets/images/ChatGPT Image Jun 17, 2025, 01_16_02 PM.png'
import imageLight from '../../../assets/images/ChatGPT Image Jun 17, 2025, 01_16_10 PM.png'
import { useTheme } from "../../../contexts/ThemeContext";
import CreatePosition from '../../../components/postionCreate'

function createPosition() {
     const { isDarkMode, toggleDark } = useTheme();
    return (
        <div style={{ backgroundImage: `${isDarkMode ? (`url(${imageDark})`) : (`url(${imageLight})`)}` }} className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed  relative bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center px-4"><CreatePosition /></div>
    )
}

export default createPosition
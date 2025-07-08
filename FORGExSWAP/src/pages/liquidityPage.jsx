import React, { useState } from 'react'
import imageDark from '../assets/images/ChatGPT Image Jun 17, 2025, 01_16_02 PM.png'
import imageLight from '../assets/images/ChatGPT Image Jun 17, 2025, 01_16_10 PM.png'
import { useTheme } from "../contexts/ThemeContext";
import AddLiquidity from '../components/AddLiquidity'
import RemoveLiquidity from '../components/RemoveLiquidity';


function Liquidity() {
    const [isAddLiquidity, setIsAddLiquidity] = useState(true)
    const { isDarkMode, toggleDark } = useTheme();
    return (
        <div
            style={{
                backgroundImage: `url(${isDarkMode ? imageDark : imageLight})`,
            }}
            className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative py-8 px-4 flex items-center justify-center"
        >
            <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-6 backdrop-blur-md bg-opacity-90 dark:bg-opacity-80  ">
                <div className="flex justify-center mb-6">
                    <button
                        onClick={() => setIsAddLiquidity(true)}
                        className={`px-4 py-2 rounded-l-2xl font-semibold text-lg transition-all duration-300 ${isAddLiquidity
                                ? 'bg-green-600 text-white'
                                : 'bg-indigo-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                            }`}
                    >
                        Add Liquidity
                    </button>
                    <button
                        onClick={() => setIsAddLiquidity(false)}
                        className={`px-4 py-2 rounded-r-2xl font-semibold text-lg transition-all duration-300 ${!isAddLiquidity
                                ? 'bg-red-600 text-white'
                                : 'bg-indigo-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                            }`}
                    >
                        Remove Liquidity
                    </button>
                </div>

                <div className="transition-all duration-500">
                    {isAddLiquidity ? <AddLiquidity /> : <RemoveLiquidity />}
                </div>
            </div>
        </div>

    )
}

export default Liquidity
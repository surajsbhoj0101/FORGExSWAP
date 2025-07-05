import React, { useState } from 'react'
import TokenCreate from '../components/TokenCreate'


function createToken() {

    return (

        <div className="flex dark:bg-gray-950 flex-col min-h-screen">
            {/* Hero Section */}

            <div className="dark:bg-gray-800 shadow-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white text-center px-4 py-16 flex flex-col justify-center items-center space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                    Test, build, and grow
                </h1>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium">
                    Create your Sepolia tokens
                </h2>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                    Now and shape the future
                </h1>
            </div>
            <div className="flex mt-5 mb-10  justify-center ">
                <TokenCreate />
            </div>
            
        </div>
    )
}

export default createToken

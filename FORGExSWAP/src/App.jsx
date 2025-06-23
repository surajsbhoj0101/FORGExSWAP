import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { FaArrowCircleRight } from "react-icons/fa";
import { FaLaptopCode } from "react-icons/fa";
import { Link } from "react-router-dom";
import dashSvg from "./assets/dashboard-graph-analytics-report-svgrepo-com.svg";

function App() {
  

  return (
    <>
      <div className="bg-gray-200  mb-2 dark:bg-gray-800 h-full w-full">
        <div className="panel px-4 py-8 flex flex-col items-center justify-center space-y-12 md:space-y-16 h-[50vh] sm:h-[60vh] md:h-[65vh] bg-gradient-to-l dark:bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white text-center">
          <div className="flex flex-col items-center space-y-4">
            <p className="quote text-2xl sm:text-3xl md:text-4xl font-bold max-w-3xl leading-snug">
              “Your token could power the next big thing. Make it real.”
            </p>
            <p className="tagline text-lg sm:text-2xl font-semibold">
              No code. No limits. Just launch.
            </p>
          </div>

          <Link to="/createToken" className="flex hover:cursor-pointer items-center gap-3 px-6 py-3 rounded-xl bg-white text-gray-800 hover:bg-cyan-300 hover:text-white hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg sm:text-xl dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-violet-500">
            <p to="/createToken">Forge Now</p>
            <FaArrowCircleRight className="text-2xl" />
          </Link>
        </div>
        {/* why */}
        <div className="why bg-gray-50 dark:bg-gray-900   rounded-md   p-8 items-center flex flex-col">
          <p className="sm:text-4xl text-2xl leading-snug font-bold text-gray-900 dark:text-white ">
            What Makes ForgeXSwap Different?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6  sm:p-6">
            {/* cards */}
            <div className="flex flex-col items-start dark:bg-gray-800  bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
              <img src={dashSvg} alt="dashSvg" className="h-12" />
              <h3 className="text-xl font-semibold mt-4 dark:text-gray-200 text-gray-800">
                Real-Time Dashboard
              </h3>
              <p className="mt-2 text-gray-600  dark:text-gray-200 text-sm">
                Track token supply, holders, transfers, price data (if listed),
                and mint/burn activity from a single panel.
              </p>
            </div>

            <div className="flex flex-col items-start dark:bg-gray-800 bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
              <div className="text-3xl">✍️</div>
              <h3 className="text-xl font-semibold dark:text-gray-200 mt-4 text-gray-800">
                Built-in Token Metadata Support
              </h3>
              <p className="mt-2 dark:text-gray-200 text-gray-600 text-sm">
                Add images, descriptions, website URLs, and social links to make
                your token stand out.
              </p>
            </div>

            <div className="flex flex-col items-start dark:bg-gray-800  bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
              <div className="text-3xl">🔄</div>
              <h3 className="text-xl font-semibold dark:text-gray-200 mt-4 text-gray-800">
                Automatic Contract Verification
              </h3>
              <p className="mt-2 dark:text-gray-200 text-gray-600 text-sm">
                Etherscan/Polygonscan verification built-in. Let users trust
                what they see.
              </p>
            </div>

            <div className="flex flex-col items-start dark:bg-gray-800  bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
              <div className="text-3xl">🪂</div>
              <h3 className="text-xl font-semibold mt-4 dark:text-gray-200 text-gray-800">
                Airdrop Manager
              </h3>
              <p className="mt-2 dark:text-gray-200 text-gray-600 text-sm">
                Upload CSV and instantly airdrop tokens to thousands of
                addresses.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
            What You Can Do Here
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl">🧱</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">
                Create Utility Tokens
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                For your app, startup, or protocol.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl">🐸</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">
                Launch Meme Coins
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Ride trends and go viral with custom coins.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl">🗳️</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">
                Build DAO Governance Tokens
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Empower your community with voting rights.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl">👥</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">
                Tokenize Communities & Events
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Build exclusive access with token-based roles.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl">🎁</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">
                Reward Your Followers
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Create loyalty tokens for your community or fans.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl">🪂</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">
                Airdrop Campaigns
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Distribute tokens at scale to grow your reach.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
            FAQs
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* FAQ 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Q: Can I launch on multiple chains?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                A: Yes. Ethereum, Polygon, and BSC are supported — including
                testnets.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Q: Is it really no-code?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                A: 100%. You never need to write a single line of Solidity.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Q: Who owns the token after creation?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                A: You do. The smart contract is deployed directly to your
                wallet address.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Q: Is there a cost to deploy?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                A: We charge no platform fee. You only pay the standard gas fees
                on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

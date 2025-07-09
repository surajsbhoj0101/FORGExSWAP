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
      <div className="bg-gray-200 mb-2 dark:bg-gray-800 h-full w-full">
        <div className="panel px-4 py-8 flex flex-col items-center justify-center space-y-12 md:space-y-16 h-[50vh] sm:h-[60vh] md:h-[65vh] bg-gradient-to-l dark:bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 text-white text-center">
          <div className="flex flex-col items-center space-y-4">
            <p className="quote text-2xl sm:text-3xl md:text-4xl font-bold max-w-3xl leading-snug">
              “Launch. Swap. Build. Trade. Own. All on Sepolia Ethereum.”
            </p>
            <p className="tagline text-lg sm:text-2xl font-semibold">
              Your all-in-one DEX and Token Suite. No code. Just click.
            </p>
          </div>

          <Link to="/createToken" className="flex hover:cursor-pointer items-center gap-3 px-6 py-3 rounded-xl bg-white text-gray-800 hover:bg-cyan-300 hover:text-white hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg sm:text-xl dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-violet-500">
            <p>Start Building</p>
            <FaArrowCircleRight className="text-2xl" />
          </Link>
        </div>

        {/* Why Section */}
        <div className="why bg-gray-50 dark:bg-gray-900 rounded-md p-8 items-center flex flex-col">
          <p className="sm:text-4xl text-2xl leading-snug font-bold text-gray-900 dark:text-white">
            Why Choose ForgeXSwap?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:p-6">
            <div className="flex flex-col items-start dark:bg-gray-800 bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
              <div className="text-3xl">⚙️</div>
              <h3 className="text-xl font-semibold mt-4 text-gray-800 dark:text-gray-200">
                One-Click Token Creation
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                Deploy your ERC-20 token instantly to Sepolia with no Solidity knowledge.
              </p>
            </div>

            <div className="flex flex-col items-start dark:bg-gray-800 bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
              <div className="text-3xl">📊</div>
              <h3 className="text-xl font-semibold mt-4 text-gray-800 dark:text-gray-200">
                Trading with Live Charts
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                Visualize price movement and trade volume with integrated charting tools.
              </p>
            </div>

            <div className="flex flex-col items-start dark:bg-gray-800 bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
              <div className="text-3xl">💧</div>
              <h3 className="text-xl font-semibold mt-4 text-gray-800 dark:text-gray-200">
                Add & Manage Liquidity
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                Add liquidity to existing pairs or create new ones seamlessly.
              </p>
            </div>

            <div className="flex flex-col items-start dark:bg-gray-800 bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition duration-300">
              <div className="text-3xl">🔁</div>
              <h3 className="text-xl font-semibold mt-4 text-gray-800 dark:text-gray-200">
                Pair Swapping Engine
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
                Swap any token pair available on ForgeXSwap via Sepolia DEX routing.
              </p>
            </div>
          </div>
        </div>
  

        {/* FAQs */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
            FAQs
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Faq q="Which chain is supported?" a="All features are deployed on Sepolia Ethereum for safe, fast testing and interaction." />
            <Faq q="Can I swap between any token pairs?" a="Yes! Our engine lets you swap between any pairs available on the DEX." />
            <Faq q="Do I need to code?" a="Not at all. Everything is handled via a beautiful UI." />
            <Faq q="Are tokens verified?" a="Yes. Contracts are automatically verified on Sepolia-compatible explorers." />
            <Faq q="Who owns the contract?" a="You do. The token contract is deployed to your connected wallet." />
          </div>
        </div>
      </div>
    </>
  );
}

const Faq = ({ q, a }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Q: {q}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">A: {a}</p>
  </div>
);

export default App;


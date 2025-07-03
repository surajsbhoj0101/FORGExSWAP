import React from 'react';
import { Link } from "react-router-dom";

function liquidityPage() {
  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">
      <div className="rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center dark:bg-gray-800 bg-gray-100 px-6 py-4 border-b border-gray-300 justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Liquidity Position</h2>
          <Link to="/liquidity/createPostion" className='px-2 py-1 bg-blue-500 cursor-pointer text-white rounded-md hover:bg-blue-600'>Create Postion +</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-800">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">#</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Token Pair</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Amount Supplied</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Pool Share</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Value ($)</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Liquidity</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">

              <tr

                className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all"
              >
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">1</td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <img
                    alt="Token"
                    className="w-8 h-8 rounded-full object-cover border border-gray-400"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">ETH/USDC</span>
                </td>
                <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400"> 0.5 ETH / 900 USDC
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400"> 1.2%</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">$1,800</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">$1,8</td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default liquidityPage

import React, { useState, useEffect } from 'react';
import { gql, request } from 'graphql-request';
import { formatUnits } from 'ethers';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const syncQuery = gql`
  query LatestSync($pair: Bytes!) { 
  candles(first: 1, orderBy: timestamp, orderDirection: desc,
   where: {
    pair: $pair,
    interval: "1d"
  }) {
    id
    timestamp
    close
  }
  }
`;

const url = 'https://api.studio.thegraph.com/query/113184/sepolia-v-2-price-feed/version/latest';
const headers = { Authorization: `Bearer ff06a2cbebb8a0e457b1904571cb9b50` };

function TradePriceShow() {
  const navigate = useNavigate();
  const [pairAddresses, setPairAddresses] = useState([]);
  const [pairPrices, setPairPrices] = useState([]);

  function sortTokens(tokenA, tokenB) {
    const [addressA, addressB] = [tokenA.toLowerCase(), tokenB.toLowerCase()];
    return addressA < addressB ? [tokenA, tokenB] : [tokenB, tokenA];
  }

  async function getResult(pairName, address, customTokenImage) {
    try {
      console.log("Fetching ....")
      const result = await request(url, syncQuery, { pair: address }, headers);
      
      const price = result?.candles[0]?.close;
     
      console.log(price)

      return {
        pairAddress: address,
        customTokenImage: `https://scarlet-naval-lizard-255.mypinata.cloud/ipfs/${customTokenImage}`,
        name: pairName,
        price,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  useEffect(() => {
    async function fetchPairs() {
      try {
        const res = await axios.get('http://localhost:3002/fetchAllToken');
        setPairAddresses(res.data);
      } catch (error) {
        console.log("An error occurred: ", error);
      }
    }
    fetchPairs();
  }, []);

  useEffect(() => {
    async function priceFetch() {
      if (!pairAddresses.length) return;
      const results = [];
      for (let i = 0; i < pairAddresses.length; i++) {
        const {
          pairName,
          pairAddress,
          customToken,
          fswapAddress,
          customTokenImage
        } = pairAddresses[i];

        const data = await getResult(pairName, pairAddress, customTokenImage);
        if (data) results.push(data);
      }
      setPairPrices(results);
    }
    priceFetch();
  }, [pairAddresses]);

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">
      <div className="rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center dark:bg-gray-800 bg-gray-100 px-6 py-4 border-b border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">🪙 Trading Pairs</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-800">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">#</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Market</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Price</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Market Cap</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Liquidity</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {pairPrices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="animate-pulse">Loading pair data...</div>
                  </td>
                </tr>
              ) : (
                pairPrices.map((item, idx) => (
                  <tr
                    key={item.pairAddress}
                    onClick={() => navigate(`/trade/${item.pairAddress}`)}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{idx + 1}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={item.customTokenImage}
                        alt="Token"
                        className="w-8 h-8 rounded-full object-cover border border-gray-400"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400">
                      {item.price.toLocaleString(undefined, { maximumFractionDigits: 6 })} FSWAP
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">-</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">-</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TradePriceShow;

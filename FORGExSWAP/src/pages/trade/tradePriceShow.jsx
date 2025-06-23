import React, { useState, useEffect } from 'react'
import { pair } from '../../data/pair.js'
import { gql, request } from 'graphql-request'
import { getDecimals } from '../../utils/getDecimals.js'
import { formatUnits } from 'ethers'

const syncQuery = gql`
  query LatestSync($pair: Bytes!) {
    syncs(
      where: { pair: $pair }
      orderBy: blockTimestamp
      orderDirection: desc
      first: 1
    ) {
      reserve0
      reserve1
      blockTimestamp
    }
  }`;

const url = 'https://api.studio.thegraph.com/query/113184/sepolia-testnet-price-feed/version/latest'
const headers = { Authorization: `Bearer ff06a2cbebb8a0e457b1904571cb9b50` }

function TradePriceShow() {
    const [pairAddresses, setPairAddresses] = useState([]);
    const [pairPrices, setPairPrices] = useState([]);

    async function getResult(pairName, address, token0, token1) {
        try {
            const result = await request(url, syncQuery, { pair: address }, headers);
            console.log(result)
            const sync = result?.syncs?.[0];
            if (!sync) return null;

            const reserve0 = sync.reserve0;
            const reserve1 = sync.reserve1;

            // Pass token addresses if getDecimals expects them
            const [decimal0, decimal1] = await getDecimals(token0, token1);

            const price =
                Number(formatUnits(reserve1, decimal1)) /
                Number(formatUnits(reserve0, decimal0));

            return {
                name: pairName,
                price: price
            };
        } catch (error) {
            console.log(error)
            return null;
        }
    }
    

    useEffect(() => {
        setPairAddresses(pair);
    }, []);

    useEffect(() => {
        async function priceFetch() {
            if (!pairAddresses.length) return;
            const results = [];
            for (let i = 0; i < pairAddresses.length; i++) {
                const { pairName, pairAddress, token0, token1 } = pairAddresses[i];
                const data = await getResult(pairName, pairAddress, token0, token1);
                if (data) results.push(data);
            }
            setPairPrices(results);
        }
        priceFetch();
    }, [pairAddresses]);

    return (
        <div className='p-6 dark:bg-gray-900'>
            <div className='rounded-lg flex flex-col space-y-2'>
                {/* tradingMenu */}
                <div className='flex items-center dark:bg-gray-800 bg-gray-200 p-4 rounded-tr-lg rounded-tl-lg space-x-3'>
                    <button className='py-1 hover:cursor-pointer px-2 rounded-md dark:bg-gray-800 dark:text-white bg-gray-200 text-gray-950 text-lg font-sans'>Trending</button>
                    <button className='py-1 hover:cursor-pointer px-2 rounded md bg-gray-300  text-gray-950 text-lg font-sans'>LaunchPad</button>
                </div>
                {/* trading-data */}
                <div className='dark:bg-gray-800 bg-gray-200 p-4 rounded-br-lg rounded-bl-lg'>
                    <table className="w-full dark:text-white divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-900">
                            <tr>
                                <th className="px-8 py-4 text-left">#</th>
                                <th className="px-8 py-4 text-left">Market</th>
                                <th className="px-8 py-4 text-left">Price</th>
                                <th className="px-8 py-4 text-left">Market Cap</th>
                                <th className="px-8 py-4 text-left">Liquidity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pairPrices.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-8 py-4 text-center">Loading...</td>
                                </tr>
                            ) : (
                                pairPrices.map((item, idx) => (
                                    <tr key={item.name}>
                                        <td className="px-8 py-4">{idx + 1}</td>
                                        <td className="px-8 py-4">{item.name}</td>
                                        <td className="px-8 py-4">${item.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                                        <td className="px-8 py-4">-</td>
                                        <td className="px-8 py-4">-</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default TradePriceShow

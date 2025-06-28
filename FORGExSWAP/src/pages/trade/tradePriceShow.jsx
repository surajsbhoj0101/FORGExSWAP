import React, { useState, useEffect } from 'react'
import { pair } from '../../data/pair.js'
import { gql, request } from 'graphql-request'
import { getDecimals } from '../../utils/getDecimals.js'
import { formatUnits, getAddress } from 'ethers'
import axios from 'axios'

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

    function sortTokens(tokenA, tokenB) {
        const [addressA, addressB] = [tokenA.toLowerCase(), tokenB.toLowerCase()]
        return addressA < addressB ? [tokenA, tokenB] : [tokenB, tokenA]
    }

    async function getResult(pairName, address, tokenA, tokenB, customTokenImage, customTokenTotalSupply, fswapTotalSupply) {
        try {
            const result = await request(url, syncQuery, { pair: address }, headers);
            console.log(result)
            const sync = result?.syncs?.[0];
            if (!sync) return null;
            const reserve0 = sync.reserve0;
            const reserve1 = sync.reserve1;
            const [token0, token1] = sortTokens(tokenA, tokenB)
            let price;
            if (token0 == tokenA) {
                price =
                    Number(formatUnits(reserve1, 18)) /
                    Number(formatUnits(reserve0, 18));
            } else {
                price =
                    Number(formatUnits(reserve0, 18)) /
                    Number(formatUnits(reserve1, 18));
            }







            return {
                customTokenImage:`https://gateway.pinata.cloud/ipfs/`+customTokenImage,
                fswapTokenImage:"https://gateway.pinata.cloud/ipfs/bafkreibraphv6pijf2hp7dckl5ehljekxq7to5pbjlcpw34xnks7vcddgq",
                name: pairName,
                price: price
            };
        } catch (error) {
            console.log(error)
            return null;
        }
    }


    useEffect(() => {
        async function fetchPairs(params) {
            try {
                const res = await axios.get('http://localhost:3002/fetchAllToken');
                setPairAddresses(res.data)
            } catch (error) {
                console.log("An error occured: ", error)
            }

        }
        fetchPairs()
    }, []);

    useEffect(() => {
        async function priceFetch() {
            if (!pairAddresses.length) return;
            const results = [];
            for (let i = 0; i < pairAddresses.length; i++) {

                const { pairName,
                    pairAddress,
                    customTokenName,
                    fswapTokenName,
                    customToken,
                    fswapAddress,
                    customTokenTotalSupply,
                    fswapTotalSupply,
                    customTokenForLiquidity,
                    customTokenSupplyForLiquidity,
                    customTokenImage } = pairAddresses[i];
                const data = await getResult(pairName, pairAddress, customToken, fswapAddress, customTokenImage, customTokenTotalSupply, fswapTotalSupply);
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
                                    <tr key={item.name} className='hover:cursor-pointer hover:bg-white dark:hover:bg-gray-900'>
                                        <td className="px-8 py-4">{idx + 1}</td>
                                        <td className="px-8 py-4 items-center justify-center space-x-2 flex"><p>{item.name}</p>
                                            <img src={item.customTokenImage} className='w-15 h-15 rounded-full' alt="customTokenImg" />
                                        </td>
                                        <td className="px-8 py-4">{item.price.toLocaleString(undefined, { maximumFractionDigits: 6 })} &nbsp; FSWAP</td>
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

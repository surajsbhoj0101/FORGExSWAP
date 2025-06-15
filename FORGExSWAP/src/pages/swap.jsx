import React, { useState, useEffect } from 'react'
import { addressFeed } from '../data/addressFeed'
import { FetchSwapData } from '../utils/swapDataFetch'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from 'wagmi'



function swap() {
    const { isConnected, address } = useAccount()
    const [aboutPair, setAboutPair] = useState()
    const [valueData, setValueData] = useState({
        buyAddress: "",
        sellAddress: "",
        buy: "",
        sell: ""
    });
    const [lastChanged, setLastChanged] = useState("");

    function handleSellChange(e) {
        setValueData(prev => ({
            ...prev,
            sell: e.target.value
        }));
        setLastChanged('sell');
    }

    function handleBuyChange(e) {
        setValueData(prev => ({
            ...prev,
            buy: e.target.value
        }));
        setLastChanged('buy');
    }

    useEffect(() => {
        if (valueData.buyAddress && valueData.sellAddress) {
            async function fetchPriceAndUpdate() {
                const price = await FetchSwapData(valueData.sellAddress, valueData.buyAddress);
                if (typeof(price) === "number") {
                    if (lastChanged === 'sell') {
                        setValueData(prev => ({
                            ...prev,
                            buy: price * prev.sell
                        }));
                    } else if (lastChanged === 'buy') {
                        setValueData(prev => ({
                            ...prev,
                            sell: prev.buy / price
                        }));
                    }
                }else{
                    setAboutPair(price)
                    console.log(aboutPair)
                }
            }
            fetchPriceAndUpdate();
        }
    }, [
        valueData.buyAddress,
        valueData.sellAddress,
        valueData.buy,
        valueData.sell,
        lastChanged
    ]);



    const handleChange = (e) => {
        const { name, value } = e.target
        setValueData((prev) => ({
            ...prev,
            [name]: value,
        }));
        console.log(valueData)
    }
    const [addresses, setAddresses] = useState([])
    useEffect(() => {
        try {
            const feed = addressFeed;
            setAddresses(feed);
            console.log(addresses)
        } catch (error) {
            console.log("unable to fetch the data", error);
        }
    }, [])

    return (
        <div className="min-h-screen bg-cyan-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
            <div className="w-full  max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-2 sm:space-y-6">
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
                    Swap Here
                </h1>

                {/* Sell Section */}
                <div className="">
                    <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium">
                        You sell
                    </label>
                    <div className="flex items-center gap-3">
                        <input

                            onChange={handleSellChange}
                            value={valueData.sell}
                            name='sell'
                            type="number"
                            placeholder="0.0"
                            className="flex-1 sm:w-full w-2.5  border border-gray-300 dark:border-gray-600 rounded-lg sm:px-4 px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <select value={valueData.sellAddress} onChange={handleChange} name='sellAddress' className="sm:text-lg text-xs sm:w-28 w-20 font-normal border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none">
                            <option disabled value="">--select--</option>
                            {addresses.map((item, index) => {
                                return (
                                    <option key={index} value={item.tokenAddress}>
                                        {item.tokenName}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Swap Icon */}
                <div className="flex justify-center">
                    <button
                        className="rounded-full p-2 bg-cyan-500 hover:bg-cyan-600 text-white shadow-md"
                        title="Switch"
                    >
                        ⇅
                    </button>
                </div>

                {/* Buy Section */}
                <div className="space-y-2">
                    <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium">
                        You buy
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            onChange={handleBuyChange}
                            value={valueData.buy}
                            type="number"
                            name='buy'
                            placeholder="0.0"
                            className="flex-1 sm:w-full w-2.5  border border-gray-300 dark:border-gray-600 rounded-lg sm:px-4 px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <select value={valueData.buyAddress} onChange={handleChange} name='buyAddress' className="sm:text-lg text-xs sm:w-28 w-20 font-normal border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none">
                            <option disabled value="">--select--</option>
                            {addresses.map((item, index) => {
                                return (
                                    <option key={index} value={item.tokenAddress}>
                                        {item.tokenName}
                                    </option>
                                );
                            })}


                        </select>
                    </div>
                </div>

                {/* Swap Button */}
                
                <div className='text-red-500'>{aboutPair}</div>
               <div className='w-full flex items-center justify-center'>
                 {isConnected?(<button
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-semibold transition duration-200"
                >
                    Swap
                </button>):(<ConnectButton className="full"/>)}
               </div>
            </div>
        </div>
    )
}

export default swap

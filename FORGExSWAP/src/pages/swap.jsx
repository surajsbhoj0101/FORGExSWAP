import React, { useState, useEffect } from 'react'
import { addressFeed } from '../data/addressFeed'
import { FetchSwapData, checkSwapPairExists } from '../utils/swapDataFetch'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'ethers';
import TokenAmountHold from '../components/tokenAmountHold';


function swap() {
    const controller = new AbortController();
    const signal = controller.signal;
    const [fetchingQuotes, setFetchingQuotes] = useState(false);
    const { isConnected, address } = useAccount()
    const [aboutPair, setAboutPair] = useState()
    const [isPairExists, setIsPairExists] = useState()
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
            async function checkPair(params) {
                const result = await checkSwapPairExists(valueData.sellAddress, valueData.buyAddress)
                if (result.exists) {
                    setIsPairExists(true)
                    setAboutPair('')
                    fetchPriceAndUpdate(result.pairAddress)
                } else {
                    setIsPairExists(false);
                    setAboutPair("This pair contract doesn't exists")
                    setValueData(prev => ({
                        ...prev,
                        sell: "",
                        buy: ""
                    }));
                }
            }

            async function fetchPriceAndUpdate(pairAddress) {

                try {
                    if (lastChanged === "sell") {
                        const data = await FetchSwapData(
                            valueData.sellAddress,
                            valueData.buyAddress,
                            valueData.sell,
                            pairAddress
                        );


                        setFetchingQuotes(false)
                        setValueData(prev => ({
                            ...prev,
                            buy: data.amountOut
                        }));
                    } else if (lastChanged === "buy") {

                        const data = await FetchSwapData(
                            valueData.buyAddress,
                            valueData.sellAddress,
                            valueData.buy,
                            pairAddress
                        );

                        setFetchingQuotes(false)
                        setValueData(prev => ({
                            ...prev,
                            sell: data.amountOut
                        }));
                    }
                } catch (error) {
                    setFetchingQuotes(false)

                    setLastChanged('')
                }

            }

            checkPair();
        }
    }, [valueData, lastChanged]);


    function handleSwitch() {

        const sellTemp = valueData.sell;
        const buyTemp = valueData.buy;
        const sellAddTemp = valueData.sellAddress;
        const buyAddTemp = valueData.buyAddress


        setValueData(prev => ({
            ...prev,
            buy: sellTemp,
            sell: buyTemp,
            sellAddress: buyAddTemp,
            buyAddress: sellAddTemp
        }));
    }


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
        <div className="min-h-screen bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center px-4">
            <div className="w-full  max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-2 sm:space-y-6">
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
                    Swap Here
                </h1>

                {/* Sell Section */}
                <div className="">
                    <div className="flex text-gray-600 dark:text-gray-300 justify-between text-sm font-medium">
                        <p>You sell</p>
                        <div className='flex space-x-1'><p>Balance -</p> <TokenAmountHold tokenAddress={valueData.sellAddress} /></div>
                    </div>
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
                    <button onClick={handleSwitch}
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


                <div className='text-red-500'>{aboutPair}</div>
                <div className='w-full flex items-center justify-center'>
                    {isConnected ? (
                        isPairExists ? (
                            <button
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold transition duration-200"
                            >
                                Swap
                            </button>
                        ) : (
                           <button
                                className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition duration-200"
                            >
                                Pair doesn't exists
                            </button>
                        )
                    ) : (
                        <ConnectButton className="full" />
                    )}

                </div>
            </div>
        </div >
    )
}

export default swap


/*
        What is AbortController?

        AbortController is a built-in browser API that lets you cancel an ongoing async task, like a fetch() request.

        It’s super useful in React when:

            A component unmounts before the fetch finishes.

            A new fetch starts (like when the user keeps typing and you want to cancel the old request).

        ✅ How it works

        1️⃣ You create an AbortController

        const controller = new AbortController();

        2️⃣ You get its signal

        const signal = controller.signal;

        3️⃣ Pass that signal to fetch()

        fetch(url, { signal });

        4️⃣ If you call controller.abort(),
        the browser cancels the network request immediately.
        The fetch throws an AbortError — you can ignore it if you want.
*/

import React, { useState, useEffect, useRef } from 'react';
import { addressFeed } from '../data/positionAddressFeed';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from 'wagmi';
import { getAmountHold } from '../utils/fetchAmountHold';
import { IoClose } from "react-icons/io5";

function CreatePosition() {
    const { data: walletClient } = useWalletClient();
    const { isConnected, address } = useAccount();

    const [availableToken, setAvailableToken] = useState({
        token0: "",
        token1: ""
    });

    const [addresses, setAddresses] = useState([]);
    const [activeField, setActiveField] = useState('pair0'); // 'pair0' or 'pair1'
    const [isTokenSelection, setIsTokenSelection] = useState(false);
    const [lastChanged, setLastChanged] = useState("");
    const [isCreatingPos, setIsCreatingPos] = useState(false);
    const isUserInput = useRef(false);

    const [pairData, setPairData] = useState({
        token0Address: "",
        token1Address: "",
        token0Value: "",
        token1Value: ""
    });

    const [customTokenAddr, setCustomTokenAddr] = useState()

    useEffect(() => {
        setAddresses(addressFeed);
    }, []);

    function handleCustomTokenSelection(e) {
        setCustomTokenAddr(e.target.value)
        console.log(customTokenAddr)
    }
    const handleTokenSelect = (tokenAddress) => {
        const field = activeField === 'pair1' ? 'token1Address' : 'token0Address';
        setPairData(prev => ({ ...prev, [field]: tokenAddress }));
        setIsTokenSelection(false);
        setCustomTokenAddr("")
        isUserInput.current = true;
    };

    useEffect(() => {
        async function fetchBalance(params) {
            if (isConnected && (pairData?.token0Address !== "" || pairData?.token1Address !== "")) {
                const token0 = await getAmountHold(address, pairData?.token0Address);
                const token1 = await getAmountHold(address, pairData?.token1Address);

                setAvailableToken((prev) => ({
                    ...prev,
                    token0: token0,
                    token1: token1
                }))
            }
        }
        fetchBalance();
    }, [isConnected, pairData.token1Address, pairData.token0Address])

    return (
        <div className="w-full relative min-h-96 max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            {!isTokenSelection ? (
                isCreatingPos ? (
                    <div>Creating Position...</div>
                ) : (
                    <div className='relative w-full p-6 border-2 border-cyan-500 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'>
                        <form className='flex flex-col gap-8'>
                            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
                                Create Positions
                            </h1>

                            {/* Token Select */}
                            <div className='flex flex-col gap-3'>
                                <label className="text-gray-600 dark:text-gray-300 font-semibold">Select Tokens</label>
                                <div className='flex justify-between items-center gap-6 flex-wrap'>
                                    <div
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveField('pair0');
                                            setIsTokenSelection(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-3 w-36 justify-center bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:opacity-90"
                                    >
                                        {addresses.find(a => a.tokenAddress === pairData.token0Address)?.tokenImage ? (
                                            <>
                                                <img
                                                    src={addresses.find(a => a.tokenAddress === pairData.token0Address)?.tokenImage}
                                                    className="w-5 h-5 rounded-full"
                                                    alt="Token 0"
                                                />
                                                <span>{addresses.find(a => a.tokenAddress === pairData.token0Address)?.tokenSymbol}</span>
                                            </>
                                        ) : (
                                            <span>
                                                {pairData.token0Address
                                                    ? `${pairData.token0Address.slice(0, 6)}...${pairData.token0Address.slice(-4)}`
                                                    : "Token 0"}
                                            </span>
                                        )}
                                    </div>

                                    <div
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveField('pair1');
                                            setIsTokenSelection(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-3 w-36 justify-center bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:opacity-90"
                                    >
                                        {addresses.find(a => a.tokenAddress === pairData.token1Address)?.tokenImage ? (
                                            <>
                                                <img
                                                    src={addresses.find(a => a.tokenAddress === pairData.token1Address)?.tokenImage}
                                                    className="w-5 h-5 rounded-full"
                                                    alt="Token 1"
                                                />
                                                <span>{addresses.find(a => a.tokenAddress === pairData.token1Address)?.tokenSymbol}</span>
                                            </>
                                        ) : (
                                            <span>
                                                {pairData.token1Address
                                                    ? `${pairData.token1Address.slice(0, 6)}...${pairData.token1Address.slice(-4)}`
                                                    : "Token 1"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Input Tokens */}
                            <div className='flex flex-col gap-4'>
                                <label className="text-gray-600 dark:text-gray-300 font-semibold">Deposit Tokens</label>

                                <div className="flex flex-col gap-2">
                                    <div className='flex justify-between text-sm font-medium'>
                                        <p>Token 0</p>
                                        <p className="text-gray-500 dark:text-gray-400">Balance: {availableToken.token0}</p>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Amount Token 0"
                                        className='w-full rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600'
                                        value={pairData.token0Value}
                                        onChange={(e) => setPairData(prev => ({ ...prev, token0Value: e.target.value }))}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className='flex justify-between text-sm font-medium'>
                                        <p>Token 1</p>
                                        <p className="text-gray-500 dark:text-gray-400">Balance: {availableToken.token1}</p>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Amount Token 1"
                                        className='w-full rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600'
                                        value={pairData.token1Value}
                                        onChange={(e) => setPairData(prev => ({ ...prev, token1Value: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className='flex items-center justify-center'>
                                {isConnected ? (<button
                                    type="submit"
                                    className='w-full py-3 mt-2 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 transition-all duration-200'
                                >
                                    Submit
                                </button>) : (<ConnectButton />)}
                            </div>
                        </form>
                    </div>

                )
            ) : (

                <div className="absolute top-0 left-0 z-30 w-full h-full bg-white dark:bg-gray-800 p-4 overflow-y-auto rounded-md">
                    <div className="flex items-center space-x-3 mb-4">
                        <input
                            type="text"
                            placeholder="Search Tokens"
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                        />
                        <button
                            className="text-red-500"
                            onClick={() => setIsTokenSelection(false)}
                        >
                            <IoClose size={24} />
                        </button>
                    </div>

                    {addresses.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleTokenSelect(item.tokenAddress)}
                            className="flex items-center gap-4 cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            <img src={item.tokenImage} alt={item.tokenSymbol} className="w-6 h-6 rounded-full" />
                            <div>
                                <div className="font-medium text-gray-800 dark:text-white">
                                    {item.tokenName} ({item.tokenSymbol})
                                </div>
                                <div className="text-xs text-gray-500">
                                    {item.tokenAddress.slice(0, 6)}...{item.tokenAddress.slice(-4)}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className='flex space-x-6 justify-around items-center'><input
                        type="text"
                        onChange={handleCustomTokenSelection}
                        placeholder="Enter token Address manully"
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-1 py-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100"

                    />
                        <button onClick={() => { handleTokenSelect(customTokenAddr) }} className='px-2 rounded-md py-1 cursor-pointer text-white bg-green-400 hover:bg-green-500'>Add</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreatePosition;

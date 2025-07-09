import React, { useState, useEffect } from 'react';
import { handleTokenCreation } from '../utils/handleTokenCreation';
import { useAccount, useWalletClient } from 'wagmi';
import { addLiquidity } from '../utils/addLiquidity';
import { BrowserProvider } from 'ethers';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from 'react-toastify';
import axios from 'axios';
import { IoClose } from 'react-icons/io5';
import { addressFeed } from '../data/positionAddressFeed';
import { checkErcExists } from '../utils/checkTokenExists';
import { ToastContainer } from 'react-toastify';
import { getAmountHold } from '../utils/fetchAmountHold';


function TokenCreate() {
    const [isCreatingToken, setIsCreatingToken] = useState(false);
    const [isTokenSelection, setIsTokenSelection] = useState(false);
    const [activeField, setActiveField] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [customTokenAddr, setCustomTokenAddr] = useState('');
    const formData = new FormData();
    const { data: walletClient } = useWalletClient();
    const { isConnected, address } = useAccount();
    const [isSecondaryTokenExists, setisSecondaryTokenExists] = useState(true)

    useEffect(() => {
        setAddresses(addressFeed);
    }, []);
    const [userSecondaryTokenBalance, setUserSecondaryTokenBalance] = useState()
    const [tokenData, setTokenData] = useState({
        tokenName: "",
        tokenSymbol: "",
        tokenSupply: "",
        secondaryTokenAddress: "",
        secondaryTokenName: "",
        secondaryTokenSymbol: "",
        secondaryTokenTotalSupply: "",
        secondaryTokenValueForInitialLiquidity: "",
        image: ""
    });

    function handleTokenData(e) {
        const { name, value, files } = e.target;
        if (name === 'image' && files && files[0]) {
            const file = files[0];
            const imageURL = URL.createObjectURL(file);
            setTokenData(prev => ({
                ...prev,
                image: imageURL,
                imageFile: file
            }));
        } else {
            setTokenData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }

    function handleCustomTokenSelection(e) {
        setCustomTokenAddr(e.target.value);
    }

    function handleTokenSelect(tokenAddress) {
        if (activeField === 'secondaryToken') {
            setTokenData(prev => ({
                ...prev,
                secondaryTokenAddress: tokenAddress
            }));
        }
        setIsTokenSelection(false);
        setCustomTokenAddr('');
    }

    function isHexadecimal(str) {
        const hexRegex = /^0x[0-9a-fA-F]+$/;
        return hexRegex.test(str);
    }

    useEffect(() => {
        async function checkIfSecondaryTokenExists() {
            const tokenAddress = tokenData?.secondaryTokenAddress;

            if (!isHexadecimal(tokenAddress) || tokenAddress.length !== 42) {
                console.error("Enter a valid address");
                setisSecondaryTokenExists(false);
                return;
            }

            try {
                const exists = await checkErcExists(tokenAddress);
                setUserSecondaryTokenBalance('0')
                setisSecondaryTokenExists(exists.isExist);
                if (exists.isExist && isConnected) {

                    const result = await getAmountHold(address,tokenAddress)
                    setUserSecondaryTokenBalance(result)
                }

                setTokenData(prev => ({
                    ...prev,
                    secondaryTokenName: exists?.tokenName,
                    secondaryTokenSymbol: exists?.tokenSymbol,
                    secondaryTokenTotalSupply: exists?.totalSupply
                }))
            } catch (error) {
                console.error("Error checking token:", error);
                setisSecondaryTokenExists(false);
            }

        }

        if (tokenData?.secondaryTokenAddress) {
            checkIfSecondaryTokenExists();
        }
    }, [tokenData.secondaryTokenAddress, addresses]);



    async function handleTokenCreationSubmit(e) {
        e.preventDefault();

        const {
            tokenName,
            tokenSymbol,
            tokenSupply,
            secondaryTokenValueForInitialLiquidity,
            secondaryTokenName,
            secondaryTokenSymbol,
            secondaryTokenTotalSupply,
            secondaryTokenAddress,
            imageFile
        } = tokenData;

        if (!tokenName || !tokenSymbol || !tokenSupply || !secondaryTokenAddress || !secondaryTokenValueForInitialLiquidity || !imageFile) {
            toast.warn("All fields are mandatory");
            return;
        }

        try {
            setIsCreatingToken(true);
            const provider = new BrowserProvider(walletClient);
            const signer = await provider.getSigner();

            const customTokenResult = await handleTokenCreation(tokenName, tokenSymbol, tokenSupply, signer);
            if (!customToken.isTxSuccessful) {
                toast.error("Token creation failed");
                return;
            }

            toast.success("Token created successfully. Adding liquidity...");

            const liqAdd = await addLiquidity(customTokenResult.address, secondaryTokenAddress, tokenSupply, secondaryTokenValueForInitialLiquidity, signer, address, true);
            if (!liqAdd.isTxSuccessful) {
                toast.error("Liquidity addition failed");
                return;
            }

            toast.success("Liquidity added. Uploading image...");
            const file = imageFile;
            formData.append('image', file);
            const resImage = await axios.post('http://localhost:3002/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const cid = resImage.data.cid;

            const res = await axios.post("http://localhost:3002/tokenData", {
                pairName: `${tokenSymbol}/${secondaryTokenSymbol}`,
                pairAddress: liqAdd.pairAddress,
                customTokenName: tokenName,
                secondaryTokenName: secondaryTokenName,
                customToken: customToken.address,
                secondaryTokenAddress: secondaryTokenAddress,
                customTokenTotalSupply: tokenSupply,
                secondaryTokenTotalSupply: secondaryTokenTotalSupply,
                customTokenForLiquidity: (tokenSupply * 9) / 10,
                secondaryTokenSupplyForLiquidity: secondaryTokenValueForInitialLiquidity,
                customTokenImage: cid
            });

            if (!res.data.success) {
                toast.error("Failed to store token data on server");
                return;
            }

            toast.success("Token creation and metadata saved successfully!");
        } catch (err) {
            console.error("Error during token creation:", err);
            toast.error("Something went wrong!");
        } finally {
            setIsCreatingToken(false);
            setTokenData({
                tokenName: "",
                tokenSymbol: "",
                tokenSupply: "",
                secondaryTokenAddress: "",
                secondaryTokenName: "",
                secondaryTokenSymbol: "",
                secondaryTokenTotalSupply: "",
                secondaryTokenValueForInitialLiquidity: "",
                image: ""
            });
        }
    }

    return (
        <div className="w-full relative min-h-96 max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 space-y-8">
            <ToastContainer />
            {!isTokenSelection ? (
                <>
                    <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white">Create Your Token</h1>

                    <form onSubmit={handleTokenCreationSubmit} className="flex flex-col gap-6" encType='multipart/form-data'>
                        <input
                            name="tokenName"
                            value={tokenData.tokenName}
                            onChange={handleTokenData}
                            placeholder="Token Name"
                            className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />

                        <input
                            name="tokenSymbol"
                            value={tokenData.tokenSymbol}
                            onChange={handleTokenData}
                            placeholder="Token Symbol"
                            className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />

                        <input
                            name="tokenSupply"
                            value={tokenData.tokenSupply}
                            onChange={handleTokenData}
                            placeholder="Token Supply"
                            type="number"
                            className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />

                        {/* Secondary Token Picker */}
                        <div>
                            <label className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Select Secondary Token</label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveField('secondaryToken');
                                        setIsTokenSelection(true);
                                    }}
                                    className="px-5 py-3 rounded-xl text-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                                >
                                    {tokenData.secondaryTokenAddress ? "Change Token" : "Choose Token"}
                                </button>
                                {tokenData.secondaryTokenAddress && (
                                    <span className="text-md text-gray-600 dark:text-gray-400 font-mono">
                                        {tokenData.secondaryTokenAddress.slice(0, 6)}...{tokenData.secondaryTokenAddress.slice(-4)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {!isSecondaryTokenExists && (
                            <p className='text-red-500'>Token Does not exists</p>
                        )}
                        <div>
                            <p className='text-gray-600 dark:text-white'>Balance - {userSecondaryTokenBalance } </p>
                            <input
                                name="secondaryTokenValueForInitialLiquidity"
                                value={tokenData.secondaryTokenValueForInitialLiquidity}
                                onChange={handleTokenData}
                                placeholder="Secondary Token Amount"
                                type="number"
                                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="flex items-center justify-between border-2 border-gray-300 dark:border-gray-600 rounded-xl p-5 bg-gray-50 dark:bg-gray-800">
                            <div>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Upload Token Image</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Max file size: 1MB</p>
                            </div>
                            {tokenData.image ? (
                                <img src={tokenData.image} alt="preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-300" />
                            ) : (
                                <input
                                    required
                                    type="file"
                                    accept="image/*"
                                    name="image"
                                    onChange={handleTokenData}
                                    className="text-sm cursor-pointer xs:w-full w-30 bg-white dark:bg-gray-700 border border-dashed rounded-lg px-3 py-2"
                                />
                            )}
                        </div>

                        {/* Submit or Connect */}
                        <div className='pt-4'>
                            {isConnected ? (
                                <button
                                    type="submit"
                                    disabled={!isSecondaryTokenExists}
                                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white py-4 text-xl rounded-xl font-bold shadow-md transition"
                                >
                                    {isCreatingToken ? "Creating..." : "Create Token"}
                                </button>
                            ) : (
                                <ConnectButton />
                            )}
                        </div>
                    </form>
                </>
            ) : (
                // Token Selection Modal
                <div className="absolute h-full w-full top-0 left-0 z-30 bg-white dark:bg-gray-900 p-6 rounded-3xl overflow-y-auto shadow-xl space-y-6">
                    <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Search Tokens"
                            className="w-full px-4 py-3 rounded-xl text-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 focus:outline-none"
                        />
                        <button className="text-red-600 hover:text-red-700" onClick={() => setIsTokenSelection(false)}>
                            <IoClose size={28} />
                        </button>
                    </div>

                    {addresses.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => handleTokenSelect(item.tokenAddress)}
                            className="flex items-center gap-5 cursor-pointer px-4 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            <img src={item.tokenImage} alt={item.tokenSymbol} className="w-10 h-10 rounded-full border" />
                            <div>
                                <div className="text-lg font-medium text-gray-800 dark:text-white">
                                    {item.tokenName} ({item.tokenSymbol})
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                    {item.tokenAddress.slice(0, 6)}...{item.tokenAddress.slice(-4)}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-4 items-center pt-4">
                        <input
                            type="text"
                            onChange={handleCustomTokenSelection}
                            placeholder="Enter token address manually"
                            className="flex-1 px-4 py-3 text-lg rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600"
                        />
                        <button
                            onClick={() => handleTokenSelect(customTokenAddr)}
                            className="px-5 py-3 text-lg bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}
        </div>


    );
}

export default TokenCreate;

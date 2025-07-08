import React, { useState, useEffect, useRef } from 'react'
import { addressFeed } from '../data/addressFeed'
import { FetchPairData, checkPairExists } from '../utils/fetchPairData'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider, formatEther, ZeroAddress } from 'ethers';
import { getAmountHold } from '../utils/fetchAmountHold';
import { swapTokens } from '../utils/swapTokens';
import ToastContainer from './toastContainer';
import { toast } from "react-toastify";
import { swapNativeTokens } from '../utils/swapNativeToken';
import { IoClose } from "react-icons/io5";
import { checkErcExists } from '../utils/checkTokenExists';
import { useBalance } from 'wagmi';


function Swap() {

  const { data: walletClient } = useWalletClient();
  const { isConnected, address } = useAccount();
  const nativeBalance = useBalance({ address, watch: true })

  const isUserInput = useRef(false); //Unlike useState, changing .current does NOT re-render the component.

  const [isTokenSelection, setIsTokenSelection] = useState(false);
  const [availableToken, setAvailableToken] = useState({
    sellToken: "",
    buyToken: ""
  });
  const [isTokenExists, setIsTokenExists] = useState(true)
  const [valueData, setValueData] = useState({
    buyAddress: "",
    sellAddress: "",
    buy: "0",
    sell: "0"
  });

  const [transactionPreview, setTransactionPreview] = useState({
    sellAmount: "",
    buyAmount: "",
    estimatedPrice: "",
    slippage: "",
  })
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastChanged, setLastChanged] = useState("");
  const [aboutPair, setAboutPair] = useState("");
  const [isPairExists, setIsPairExists] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [isFetchingQuotes, setFetchingQuotes] = useState(false);
  const [activeField, setActiveField] = useState('sell');
  const [customTokenAddr, setCustomTokenAddr] = useState();

  // ✅ Controlled inputs
  const handleSellChange = (e) => {
    isUserInput.current = true;
    setValueData(prev => ({
      ...prev,
      sell: e.target.value || "0"
    }));
    setLastChanged('sell');

  };

  const handleBuyChange = (e) => {
    isUserInput.current = true;
    setValueData(prev => ({
      ...prev,
      buy: e.target.value || "0"
    }));
    setLastChanged('buy');

  };

  function handleCustomTokenSelection(e) {
    setCustomTokenAddr(e.target.value);
  }

  const handleTokenSelect = (tokenAddress) => {
    const field = activeField === 'buy' ? 'buyAddress' : 'sellAddress';
    setValueData(prev => ({ ...prev, [field]: tokenAddress }));
    setIsTokenSelection(false);
    setCustomTokenAddr("");
    isUserInput.current = true;
  };

  const handleSwitch = () => {
    const sellTemp = valueData.sell;
    const buyTemp = valueData.buy;
    const sellAddTemp = valueData.sellAddress;
    const buyAddTemp = valueData.buyAddress;

    setValueData(prev => ({
      ...prev,

      sell: buyTemp,
      sellAddress: buyAddTemp,
      buyAddress: sellAddTemp
    }));

    isUserInput.current = true;
  };

  // SWAP HANDLER
  const swapHandle = async (e) => {
    e.preventDefault();
    try {
      if (!walletClient) {
        toast.error("No wallet connected");
        return;
      }
      if (!valueData.sellAddress || !valueData.buyAddress || !valueData.sell) {
        toast.error("Missing input values");
        return;
      }
      setIsSwapping(true)
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      if (valueData.sellAddress === ZeroAddress || valueData.buyAddress === ZeroAddress) {
        try {
          const result = await swapNativeTokens({
            amountIn: valueData.sell,
            tokenInAddress: valueData.sellAddress,
            tokenOutAddress: valueData.buyAddress,
            signer: signer,
          })

          if (result.isTxSuccessful) {
            toast.success(" Swap successful!");

          } else {
            toast.error("Swap failed!");
          }

        } catch (err) {
          toast.error("Swap failed:", err);
        }
      } else {
        try {
          const result = await swapTokens({
            amountIn: valueData.sell,
            tokenInAddress: valueData.sellAddress,
            tokenOutAddress: valueData.buyAddress,
            signer: signer,
          });

          if (result.isTxSuccessful) {
            toast.success(" Swap successful!");
          } else {
            toast.error("Swap failed!");
          }
        } catch (err) {
          toast.error("Swap failed:", err);
        }
      }
    } catch (err) {
      console.log(err)
    } finally {
      setIsSwapping(false);
      setValueData(prev => ({
        ...prev,
        sell: "",
        buy: "",
        sellAddress: "",
        buyAddress: ""
      }))

      setTransactionPreview(prev => ({
        ...prev,
        sellAmount: "",
        buyAmount: "",
        estimatedPrice: "",
        slippage: "",
      }))

      setAvailableToken(prev => ({
        ...prev,
        sellToken: "",
        buyToken: ""
      }))
    }
  };

  //  CHECK PAIR & FETCH PRICE
  useEffect(() => {
    async function checkTokenExists() {
      setFetchingQuotes(true);

      if (!valueData?.sellAddress || !valueData?.buyAddress) {
        setFetchingQuotes(false);
        return;
      }

      try {
        let result0 = { isExist: true };
        let result1 = { isExist: true };

        // Only check ERC existence if not native token (ZeroAddress)
        if (valueData.sellAddress !== ZeroAddress) {
          result0 = await checkErcExists(valueData.sellAddress);
        }

        if (valueData.buyAddress !== ZeroAddress) {
          result1 = await checkErcExists(valueData.buyAddress);
        }

        if (!result0.isExist || !result1.isExist) {
          setIsTokenExists(false);
          return;
        }

        setIsTokenExists(true);
        await checkPairAndFetch();
      } catch (error) {
        console.log(error);
      } finally {
        isUserInput.current = false;
        setFetchingQuotes(false);
      }
    }


    const checkPairAndFetch = async () => {
      if (valueData.buyAddress && valueData.sellAddress && isUserInput.current) {
        const result = await checkPairExists(valueData.sellAddress, valueData.buyAddress);
        if (result.exists) {
          setIsPairExists(true);
          setAboutPair("");
          fetchPriceAndUpdate(result?.pairAddress);
        } else {
          setIsPairExists(false);
          setAboutPair("This pair contract doesn't exist");
          setValueData(prev => ({
            ...prev,
            sell: "",
            buy: ""
          }));
        }
      }
    };

    const fetchPriceAndUpdate = async (pairAddress) => {
      const wethAddrPair = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
      try {
        if (pairAddress !== wethAddrPair) {
          setFetchingQuotes(true); // optional, already set

          if (lastChanged === "sell") {
            const data = await FetchPairData(valueData.sellAddress, valueData.sell, pairAddress);
            setValueData(prev => ({ ...prev, buy: data.amountOut }));

            setTransactionPreview(prev => ({
              ...prev,
              sellAmount: valueData.sell,
              buyAmount: data.amountOut,
              sellTokenSymbol: addresses.find(a => a.tokenAddress === valueData.sellAddress?.tokenAddress)?.tokenSymbol || '',
              buyTokenSymbol: addresses.find(a => a.tokenAddress === valueData.buyAddress?.tokenAddress)?.tokenSymbol || '',
              estimatedPrice: data.amountOut / data.amountIn,
              slippage: ((data.reserveOut / data.reserveIn - data.amountOut / data.amountIn) / (data.reserveOut / data.reserveIn)) * 100,
            }));
          } else if (lastChanged === "buy") {
            const data = await FetchPairData(valueData.buyAddress, valueData.buy, pairAddress);
            setValueData(prev => ({ ...prev, sell: data.amountOut }));

            setTransactionPreview(prev => ({
              ...prev,
              sellAmount: data.amountOut,
              buyAmount: valueData.buy,
              sellTokenSymbol: addresses.find(a => a.tokenAddress === valueData.sellAddress?.tokenAddress)?.tokenSymbol || '',
              buyTokenSymbol: addresses.find(a => a.tokenAddress === valueData.buyAddress?.tokenAddress)?.tokenSymbol || '',
              estimatedPrice: data.amountOut / data.amountIn,
              slippage: ((data.reserveOut / data.reserveIn - data.amountOut / data.amountIn) / (data.reserveOut / data.reserveIn)) * 100,
            }));
          }
        } else {

          // If pair is WETH, just mirror values
          if (lastChanged === 'sell') {
            setValueData((prev) => ({ ...prev, buy: prev.sell }));
          } else if (lastChanged === 'buy') {
            setValueData((prev) => ({ ...prev, sell: prev.buy }));
          }

          setTransactionPreview(prev => ({
            ...prev,
            sellAmount: valueData.sell,
            buyAmount: valueData.sell,
            estimatedPrice: 1,
            slippage: 0,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        isUserInput.current = false;
        setFetchingQuotes(false); // ✅ Ensures it's always reset
      }
    };

    checkTokenExists();
  }, [valueData, lastChanged]);


  useEffect(() => {
    async function fetchBalance(params) {
      if (isConnected && (valueData?.buyAddress !== "" || valueData?.sellAddress !== "")) {
        const token0 = await getAmountHold(address, valueData?.sellAddress);
        const token1 = await getAmountHold(address, valueData?.buyAddress);

        setAvailableToken((prev) => ({
          ...prev,
          sellToken: token0,
          buyToken: token1
        }))
      }
    }
    fetchBalance();
  }, [isConnected, valueData.sellAddress, valueData.buyAddress])


  useEffect(() => {
    setAddresses(addressFeed);
  }, []);


  return (
    <div className="w-full relative min-h-96 max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
      <ToastContainer />
      {!isTokenSelection ? (
        isSwapping ? (
          <div className="relative w-full p-6 border border-cyan-500 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg space-y-4">
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                Swapping in Progress...
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="font-semibold text-gray-700 dark:text-gray-300">From</div>
                <div className="text-gray-900 dark:text-white mt-1">
                  {Number(transactionPreview.sellAmount).toFixed(6)}{' '}
                  {addresses.find(a => a.tokenAddress === valueData.sellAddress)?.tokenSymbol || ''}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="font-semibold text-gray-700 dark:text-gray-300">To</div>
                <div className="text-gray-900 dark:text-white mt-1">
                  ~{Number(transactionPreview.buyAmount).toFixed(6)}{' '}
                  {addresses.find(a => a.tokenAddress === valueData.buyAddress)?.tokenSymbol || ''}
                </div>
              </div>
            </div>

            <div className="flex justify-between text-sm border-t pt-4 dark:border-gray-700">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold">Estimated Price:</span>{' '}
                  {Number(transactionPreview.estimatedPrice).toFixed(4)}
                </div>
                <div>
                  <span className="font-semibold">Slippage:</span>{' '}
                  {Number(transactionPreview.slippage).toFixed(2)}%
                </div>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </div>
            </div>
          </div>

        ) : (
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
              Swap Here
            </h1>


            {/* Sell Section */}
            <div>
              <div className="flex  text-gray-600 dark:text-gray-300 justify-between text-sm font-medium">
                <p>You sell</p>
                <div className="flex space-x-1">
                  <p>Balance -{valueData?.sellAddress === ZeroAddress ? parseFloat(formatEther(nativeBalance?.data?.value)).toFixed(2) : availableToken.sellToken || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  required
                  onChange={handleSellChange}
                  value={valueData.sell}
                  name="sell"
                  type="number"
                  placeholder="0.0"
                  min="0"
                  className="flex-1 border sm:w-full w-24 border-gray-300 dark:border-gray-600 rounded-lg px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <div
                  onClick={() => {
                    setActiveField('sell');
                    setIsTokenSelection(true);
                  }}
                  className="flex w-28 items-center gap-1 px-3 py-2 bg-gray-100 dark:text-white dark:bg-gray-700 rounded cursor-pointer"
                >
                  {addresses.find(a => a.tokenAddress === valueData.sellAddress)?.tokenImage ? (
                    <>
                      <img
                        src={addresses.find(a => a.tokenAddress === valueData.sellAddress)?.tokenImage}
                        className="w-5 h-5 rounded-full"
                        alt={`sell`}
                      />
                      <span>{addresses.find(a => a.tokenAddress === valueData.sellAddress)?.tokenSymbol}</span>
                    </>
                  ) : (
                    <span>
                      {valueData.sellAddress
                        ? `${(valueData.sellAddress).slice(0, 4)}...${(valueData.sellAddress).slice(-4)}`
                        : `<- Select ->`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex mt-1 justify-center">
              <button
                title="switch"
                onClick={handleSwitch}
                className="rounded-full p-2 bg-cyan-500 hover:bg-cyan-600 text-white shadow-md"
              >
                ⇅
              </button>
            </div>

            {/* Buy Section */}
            <div>
              <div className="flex  text-gray-600 dark:text-gray-300 justify-between text-sm font-medium">
                <p>You Buy</p>


                <div className="flex space-x-1">
                    <p>Balance -{valueData?.buyAddress === ZeroAddress ? parseFloat(formatEther(nativeBalance?.data?.value)).toFixed(2) : availableToken.buyToken || 0}</p>
                </div>

              </div>
              <div className="flex items-center gap-3">
                <input
                  required
                  onChange={handleBuyChange}
                  value={valueData.buy}
                  type="number"
                  name="buy"
                  placeholder="0.0"
                  className="flex-1 border sm:w-full w-24 border-gray-300 dark:border-gray-600 rounded-lg px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div
                  onClick={() => {
                    setActiveField('buy');
                    setIsTokenSelection(true);
                  }}
                  className="flex w-28 items-center gap-1 px-3 py-2 bg-gray-100 dark:text-white dark:bg-gray-700 rounded cursor-pointer"
                >
                  {addresses.find(a => a.tokenAddress === valueData.buyAddress)?.tokenImage ? (
                    <>
                      <img
                        src={addresses.find(a => a.tokenAddress === valueData.buyAddress)?.tokenImage}
                        className="w-5 h-5 rounded-full"
                        alt={`buy`}
                      />
                      <span>{addresses.find(a => a.tokenAddress === valueData.buyAddress)?.tokenSymbol}</span>
                    </>
                  ) : (
                    <span>
                      {valueData?.buyAddress
                        ? `${(valueData.buyAddress).slice(0, 4)}...${(valueData.buyAddress).slice(-4)}`
                        : `<- Select ->`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Swap Button & Preview */}
            <div className="w-full flex flex-col items-center justify-center">
              {isConnected ? (
                isPairExists ? (
                  isFetchingQuotes ? (
                    <div className="w-full space-x-4 dark:bg-gray-600 flex items-center justify-center py-3 rounded-lg bg-gray-400 text-white font-semibold transition duration-200">
                      <div>Fetching quotes</div>
                      <div className="border-dashed rounded-full h-3 w-3 p-2 animate-spin border-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <>
                      {!isSwapping && (
                        <div className="w-full border-1 border-gray-200 mb-4 p-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg shadow">
                          <div className="text-sm font-semibold">Transaction Summary</div>
                          <div className="mt-2 text-sm space-y-1">
                            <div>
                              <span className="font-semibold">From:</span>{' '}
                              {Number(transactionPreview.sellAmount).toFixed(10)}{' '}
                              {addresses.find(a => a.tokenAddress === valueData.sellAddress)
                                ?.tokenSymbol || ''}
                            </div>
                            <div>
                              <span className="font-semibold">To:</span>{' '}
                              ~{Number(transactionPreview.buyAmount).toFixed(10)}{' '}
                              {addresses.find(a => a.tokenAddress === valueData.buyAddress)
                                ?.tokenSymbol || ''}
                            </div>
                            <div>
                              <span className="font-semibold">Estimated Price:</span>{' '}
                              {Number(transactionPreview.estimatedPrice).toFixed(4)}
                            </div>
                            <div>
                              <span className="font-semibold">Slippage:</span>{' '}
                              {Number(transactionPreview.slippage).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={swapHandle}
                        disabled={isSwapping || !isPairExists}
                        className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${isSwapping
                          ? 'bg-gray-400 text-white dark:bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white'
                          }`}
                      >
                        {isSwapping ? 'Swapping...' : 'Swap'}
                      </button>
                    </>
                  )
                ) : (
                  <button className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition duration-200">
                    Pair doesn't exist
                  </button>
                )
              ) : (
                <ConnectButton />
              )}
            </div>
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
            <button className="text-red-500" onClick={() => setIsTokenSelection(false)}>
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

          <div className='flex space-x-6 justify-around items-center mt-4'>
            <input
              type="text"
              onChange={handleCustomTokenSelection}
              placeholder="Enter token address manually"
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
            <button onClick={() => handleTokenSelect(customTokenAddr)} className='px-3 py-2 rounded-md text-white bg-green-500 hover:bg-green-600'>
              Add
            </button>
          </div>
        </div>
      )
      }
    </div >
  );

}

export default Swap;

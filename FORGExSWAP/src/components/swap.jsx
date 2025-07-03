import React, { useState, useEffect, useRef } from 'react'
import { addressFeed } from '../data/addressFeed'
import { FetchSwapData, checkSwapPairExists } from '../utils/swapDataFetch'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider, ZeroAddress } from 'ethers';
import TokenAmountHold from './tokenAmountHold';
import { swapTokens } from '../utils/swapTokens';
import ToastContainer from './toastContainer';
import { toast } from "react-toastify";
import { swapNativeTokens } from '../utils/swapNativeToken';
import Select from "react-select"
import { IoClose } from "react-icons/io5";


function Swap() {

  const { data: walletClient } = useWalletClient();
  const { isConnected, address } = useAccount();

  const isUserInput = useRef(false); //Unlike useState, changing .current does NOT re-render the component.

  const [isTokenSelection, setIsTokenSelection] = useState(false);

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
  const [isPairExists, setIsPairExists] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isFetchingQuotes, setFetchingQuotes] = useState(false);
  const [activeField, setActiveField] = useState('sell');

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

  const handleTokenSelect = (tokenAddress) => {
    const field = activeField === 'buy' ? 'buyAddress' : 'sellAddress';
    setValueData(prev => ({ ...prev, [field]: tokenAddress }));
    setIsTokenSelection(false);
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
    }
  };

  //  CHECK PAIR & FETCH PRICE
  useEffect(() => {
    const checkPairAndFetch = async () => {
      if (valueData.buyAddress && valueData.sellAddress && isUserInput.current) {

        const result = await checkSwapPairExists(valueData.sellAddress, valueData.buyAddress);
        if (result.exists) {
          setIsPairExists(true);
          setAboutPair("");
          fetchPriceAndUpdate(result.pairAddress);
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
      const wethAddr = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
      if (pairAddress !== wethAddr) {
        try {
          setFetchingQuotes(true);
          if (lastChanged === "sell") {
            const data = await FetchSwapData(
              valueData.sellAddress,
              valueData.sell,
              pairAddress
            );
            setValueData(prev => ({
              ...prev,
              buy: data.amountOut
            }));

            setTransactionPreview(prev => ({
              ...prev,
              sellAmount: valueData.sell,
              buyAmount: data?.amountOut,


              sellTokenSymbol: addresses.find(a => a.tokenAddress === valueData.sellAddress?.tokenAddress)?.tokenSymbol || '',
              buyTokenSymbol: addresses.find(a => a.tokenAddress === valueData.buyAddress?.tokenAddress)?.tokenSymbol || '',


              estimatedPrice: data.amountOut / data.amountIn,


              slippage:
                ((data.reserveOut / data.reserveIn - data.amountOut / data.amountIn) /
                  (data.reserveOut / data.reserveIn)) *
                100,
            }));

          } else if (lastChanged === "buy") {
            const data = await FetchSwapData(
              valueData.buyAddress,
              valueData.buy,
              pairAddress
            );
            setValueData(prev => ({
              ...prev,
              sell: data.amountOut
            }));

            setTransactionPreview(prev => ({
              ...prev,
              sellAmount: valueData.sell,
              buyAmount: data.amountOut,


              sellTokenSymbol: addresses.find(a => a.tokenAddress === valueData.sellAddress?.tokenAddress)?.tokenSymbol || '',
              buyTokenSymbol: addresses.find(a => a.tokenAddress === valueData.buyAddress?.tokenAddress)?.tokenSymbol || '',


              estimatedPrice: data.amountOut / data.amountIn,


              slippage:
                ((data.reserveOut / data.reserveIn - data.amountOut / data.amountIn) /
                  (data.reserveOut / data.reserveIn)) *
                100,
            }));
          }
        } catch (error) {
          console.error(error);
        } finally {

          setFetchingQuotes(false);
          isUserInput.current = false;
        }
      } else {

        if (lastChanged === 'sell') {
          setValueData((prev) => ({
            ...prev,
            buy: prev.sell
          }))
        } else if (lastChanged === 'buy') {
          setValueData((prev) => ({
            ...prev,
            sell: prev.buy
          }))
        }

        setTransactionPreview(prev => ({
          ...prev,
          sellAmount: valueData.sell,
          buyAmount: valueData.sell,


          estimatedPrice: 1,


          slippage: 0,
        }));
        isUserInput.current = false;
      }
    };

    checkPairAndFetch();
  }, [valueData, lastChanged]);


  useEffect(() => {
    setAddresses(addressFeed);
  }, []);


  return (
    <div className="w-full relative min-h-96 max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
      <ToastContainer />
      {!isTokenSelection ? (
        isSwapping ? (
          <div className="relative w-full p-4 border-2 border-cyan-500 rounded-lg   bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex flex-col gap-4 items-center">
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold">Swapping in Progress...</div>
              <div className="mt-2 text-sm space-y-1">
                <div>
                  <span className="font-semibold">From:</span>{' '}
                  {Number(transactionPreview.sellAmount)}{' '}
                  {addresses.find(a => a.tokenAddress === valueData.sellAddress)
                    ?.tokenSymbol || ''}
                </div>
                <div>
                  <span className="font-semibold">To:</span>{' '}
                  ~{Number(transactionPreview.buyAmount)}{' '}
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
          </div>

        ) : (
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
              Swap Here
            </h1>


            {/* Sell Section */}
            <div>
              <div className="flex text-gray-600 dark:text-gray-300 justify-between text-sm font-medium">
                <p>You sell</p>
                <div className="flex space-x-1">
                  <p>Balance -</p>
                  <TokenAmountHold tokenAddress={valueData.sellAddress} />
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
                  <img
                    src={
                      addresses.find(a => a.tokenAddress === valueData.sellAddress)?.tokenImage ||
                      ''
                    }
                    className="w-5 h-5 rounded-full"
                    alt="<-"
                  />
                  <span>
                    {addresses.find(a => a.tokenAddress === valueData.sellAddress)?.tokenSymbol ||
                      'Select ->'}
                  </span>
                </div>
              </div>
            </div>

            {/* Switch Button */}
            <div className="flex justify-center">
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
              <label className="block text-gray-600 dark:text-gray-300 text-sm font-medium">
                You buy
              </label>
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
                  className="flex w-28 items-center dark:text-white gap-1 px-2 py-3 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer"
                >
                  <img
                    src={
                      addresses.find(a => a.tokenAddress === valueData.buyAddress)?.tokenImage || ''
                    }
                    className="w-5 h-5 rounded-full"
                    alt="<-"
                  />
                  <span>
                    {addresses.find(a => a.tokenAddress === valueData.buyAddress)?.tokenSymbol ||
                      'Select ->'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-red-500">{aboutPair}</div>

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
                              {Number(transactionPreview.sellAmount)}{' '}
                              {addresses.find(a => a.tokenAddress === valueData.sellAddress)
                                ?.tokenSymbol || ''}
                            </div>
                            <div>
                              <span className="font-semibold">To:</span>{' '}
                              ~{Number(transactionPreview.buyAmount)}{' '}
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
        <div className="absolute rounded-md flex flex-col space-y-4 h-full top-0 left-0 z-30 w-full bg-white dark:bg-gray-800 p-4 overflow-y-auto">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search Tokens"
              className="flex-1 border sm:w-full w-24 border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              className="text-red-500 rounded-md hover:cursor-pointer border-1 dark:border-white border-gray-400"
              onClick={() => setIsTokenSelection(prev => !prev)}
            >
              <IoClose size={24} />
            </button>
          </div>

          {addresses.map((item, index) => (
            <div
              key={index}
              onClick={() => handleTokenSelect(item.tokenAddress)}
              className="flex dark:text-white items-center gap-6 cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <img src={item.tokenImage} alt={item.tokenSymbol} className="w-6 h-6 rounded-full" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {item.tokenName} ({item.tokenSymbol})
                </span>
                <span className="text-xs text-gray-500 max-w-[200px]">
                  {`${item.tokenAddress.slice(0, 8)}.....${item.tokenAddress.slice(-8)}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

}

export default Swap;

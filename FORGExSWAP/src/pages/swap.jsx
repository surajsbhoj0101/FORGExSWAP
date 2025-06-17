import React, { useState, useEffect, useRef } from 'react'
import { addressFeed } from '../data/addressFeed'
import { FetchSwapData, checkSwapPairExists } from '../utils/swapDataFetch'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import TokenAmountHold from '../components/tokenAmountHold';
import { swapTokens } from '../utils/swapTokens';
import ToastContainer from '../components/toastContainer';
import { toast } from "react-toastify";

function Swap() {
  const { data: walletClient } = useWalletClient();
  const { isConnected, address } = useAccount();
  const isUserInput = useRef(false); //Unlike useState, changing .current does NOT re-render the component.


  // ✅ Properly manage state
  const [valueData, setValueData] = useState({
    buyAddress: "",
    sellAddress: "",
    buy: "0",
    sell: "0"
  });
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastChanged, setLastChanged] = useState("");
  const [aboutPair, setAboutPair] = useState("");
  const [isPairExists, setIsPairExists] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isFetchingQuotes, setFetchingQuotes] = useState(false);

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

  const handleChange = (e) => {
    isUserInput.current = true;
    const { name, value } = e.target;
    setValueData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitch = () => {
    const sellTemp = valueData.sell;
    const buyTemp = valueData.buy;
    const sellAddTemp = valueData.sellAddress;
    const buyAddTemp = valueData.buyAddress;

    setValueData(prev => ({
      ...prev,
      buy: sellTemp,
      sell: buyTemp,
      sellAddress: buyAddTemp,
      buyAddress: sellAddTemp
    }));
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

      const result = await swapTokens({
        amountIn: valueData.sell,
        tokenInAddress: valueData.sellAddress,
        tokenOutAddress: valueData.buyAddress,
        signer: signer,
      });

      if (result.isTxSuccessful) {
        toast.success("✅ Swap successful!");

      } else {
        toast.error("❌ Swap failed!");
      }
    } catch (err) {
      toast.error("Swap failed:", err);
    } finally {
      setIsSwapping(false);
      setValueData(prev => ({
        ...prev,
        sell: "",
        buy: "",
        sellAddress: "",
        buyAddress: ""
      }))
    }
  };

  // ✅ CHECK PAIR & FETCH PRICE
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
        }
      } catch (error) {
        console.error(error);
      } finally {

        setFetchingQuotes(false);
        isUserInput.current = false;
      }
    };

    checkPairAndFetch();
  }, [valueData, lastChanged,]);

  // ✅ Load token list once
  useEffect(() => {
    setAddresses(addressFeed);
  }, []);



  return (
    <div className="min-h-screen bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-2 sm:space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
          Swap Here
        </h1>
        <ToastContainer />
        {/* Sell Section */}
        <div>
          <div className="flex text-gray-600 dark:text-gray-300 justify-between text-sm font-medium">
            <p>You sell</p>
            <div className='flex space-x-1'>
              <p>Balance -</p>
              <TokenAmountHold tokenAddress={valueData.sellAddress} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              onChange={handleSellChange}
              value={valueData.sell}

              name='sell'
              type="number"
              placeholder="0.0"
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <select
              value={valueData.sellAddress}
              onChange={handleChange}
              name='sellAddress'
              className="sm:text-lg text-xs w-28 font-normal border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none"
            >
              <option disabled value="">--select--</option>
              {addresses.map((item, index) => (
                <option key={index} value={item.tokenAddress}>{item.tokenName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-center">
          <button onClick={handleSwitch} className="rounded-full p-2 bg-cyan-500 hover:bg-cyan-600 text-white shadow-md">
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
              onChange={handleBuyChange}
              value={valueData.buy}
              type="number"
              name='buy'
              placeholder="0.0"
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <select
              value={valueData.buyAddress}
              onChange={handleChange}
              name='buyAddress'
              className="sm:text-lg text-xs w-28 font-normal border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none"
            >
              <option disabled value="">--select--</option>
              {addresses.map((item, index) => (
                <option key={index} value={item.tokenAddress}>{item.tokenName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className='text-red-500'>{aboutPair}</div>

        <div className='w-full flex items-center justify-center'>
          {isConnected ? (
            isPairExists ? (

              isFetchingQuotes ? (
                <div

                  className="w-full space-x-4 dark:bg-gray-600 flex items-center justify-center py-3 rounded-lg bg-gray-400 text-white font-semibold transition duration-200"
                >
                  <div>Fetching quotes</div> <div className='border-dashed rounded-full h-3 w-3 p-2 animate-spin border-2 border-blue-500'></div>
                </div>


              ) : (<button
                onClick={swapHandle}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold transition duration-200"
              >
                Swap
              </button>)

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
    </div>
  );
}

export default Swap;

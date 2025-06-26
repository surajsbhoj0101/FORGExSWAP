import React, { useState, useEffect, useRef } from 'react'
import { addressFeed } from '../data/addressFeed'
import { FetchSwapData, checkSwapPairExists } from '../utils/swapDataFetch'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider, ZeroAddress } from 'ethers';
import TokenAmountHold from '../components/tokenAmountHold';
import { swapTokens } from '../utils/swapTokens';
import ToastContainer from '../components/toastContainer';
import { toast } from "react-toastify";
import imageDark from '../assets/images/ChatGPT Image Jun 17, 2025, 01_16_02 PM.png'
import imageLight from '../assets/images/ChatGPT Image Jun 17, 2025, 01_16_10 PM.png'
import { useTheme } from "../contexts/ThemeContext";
import { swapNativeTokens } from '../utils/swapNativeToken';


function Swap() {
  const { isDarkMode, toggleDark } = useTheme();
  const { data: walletClient } = useWalletClient();
  const { isConnected, address } = useAccount();

  const isUserInput = useRef(false); //Unlike useState, changing .current does NOT re-render the component.


  // Properly manage state
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
    }catch(err){
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
        isUserInput.current = false;
      }
    };

    checkPairAndFetch();
  }, [valueData, lastChanged]);


  useEffect(() => {
    setAddresses(addressFeed);
  }, []);



  return (
    <div style={{ backgroundImage: `${isDarkMode ? (`url(${imageDark})`) : (`url(${imageLight})`)}` }} className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed  relative bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center px-4">
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
              required
              onChange={handleSellChange}
              value={valueData.sell}

              name='sell'
              type="number"
              placeholder="0.0"
              min="0"
              className="flex-1 border sm:w-full w-24 border-gray-300 dark:border-gray-600 rounded-lg px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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

        {/* switch button */}
        <div className="flex justify-center">
          <button title='switch' onClick={handleSwitch} className="rounded-full p-2 bg-cyan-500 hover:bg-cyan-600 text-white shadow-md">
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
              name='buy'
              placeholder="0.0"
              className="flex-1 border sm:w-full w-24 border-gray-300 dark:border-gray-600 rounded-lg px-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                <div className="w-full space-x-4 dark:bg-gray-600 flex items-center justify-center py-3 rounded-lg bg-gray-400 text-white font-semibold transition duration-200">
                  <div>Fetching quotes</div>
                  <div className="border-dashed rounded-full h-3 w-3 p-2 animate-spin border-2 border-blue-500"></div>
                </div>
              ) : (
                <button
                  onClick={swapHandle}
                  disabled={isSwapping}
                  className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${isSwapping
                    ? 'bg-gray-400 text-white dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white'
                    }`}
                >
                  {isSwapping ? 'Swapping...' : 'Swap'}
                </button>
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
    </div>
  );
}

export default Swap;

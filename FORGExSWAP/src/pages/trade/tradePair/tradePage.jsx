import { useState, useRef, useEffect } from 'react';
import TradeChart from '../../../components/tradeChart';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from 'wagmi';
import { getAmountHold } from '../../../utils/fetchAmountHold';
import { FetchSwapData } from '../../../utils/swapDataFetch';

function TradePage() {
  const [isFetchingQuotes, setFetchingQuotes] = useState(false);
  const isUserInput = useRef(false);
  const { Data: walletClient } = useWalletClient();
  const { isConnected, address } = useAccount();
  const [loading, setLoading] = useState(false)
  const [Amount, setAmount] = useState();
  const { pairAddress } = useParams();
  const [data, setData] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isTradeBuy, setIsTradeBuy] = useState(true);
  const [tradeInfo, setTradeInfo] = useState({
    amountFswap: '',
    amountFswapTo: '',
    amountCustomToken: '',
    amountCustomTokenTo: '',
    buyToken: '',
    sellToken: ''
  });

  const [availableFswap, setAvailableFswap] = useState();
  const [availableCustomToken, setAvailableCustomToken] = useState();
  const [lastChanged, setLastChanged] = useState("");

  const handleSellChange = (e) => {
    isUserInput.current = true;
    setTradeInfo(prev => ({
      ...prev,
      amountCustomToken: e.target.value || "0"
    }));
    setLastChanged('sell');

  };

  const handleBuyChange = (e) => {
    isUserInput.current = true;
    setTradeInfo(prev => ({
      ...prev,
      amountFswap: e.target.value || "0"
    }));
    setLastChanged('buy');

  };

  useEffect(() => {
    async function fetchLiveData() {

      if (loading || !data?.fswapAddress || !tradeInfo?.amountFswap || !data?.pairAddress) {
        console.warn("Mising required data from fetch swapData Fswap")
        return
      }
      setFetchingQuotes(true)
      try {
        const result = await FetchSwapData(data?.fswapAddress, tradeInfo?.amountFswap, data?.pairAddress)
        setTradeInfo(prev => ({
          ...prev,
          amountFswapTo: result?.amountOut || "0"
        }));
        setFetchingQuotes(false)
      } catch (error) {
        console.log(error)
      }

    }

    fetchLiveData()
  }, [lastChanged, tradeInfo.amountFswap])

  useEffect(() => {
    async function fetchLiveData() {

      if (loading || !data?.customToken || !tradeInfo?.amountCustomToken || !data?.pairAddress) {
        console.warn("Mising required data from fetch swapData Fswap")
        return
      }
      setFetchingQuotes(true)
      try {
        const result = await FetchSwapData(data?.customToken, tradeInfo?.amountCustomToken, data?.pairAddress)
        setTradeInfo(prev => ({
          ...prev,
          amountCustomTokenTo: result?.amountOut || "0"
        }));
        setFetchingQuotes(false)
      } catch (error) {
        console.log(error)
      }

    }

    fetchLiveData()
  }, [lastChanged, tradeInfo.amountCustomToken])


  useEffect(() => {
    async function fetchPairData() {
      try {
        const res = await axios.get(`http://localhost:3002/fetchPair/${pairAddress}`);

        setData(res.data);
        setLoading(false)
      } catch (error) {
        setIsNotFound(true);
      }
    }
    fetchPairData();
  }, [pairAddress]);



  useEffect(() => {
    async function fetchBalance(params) {
      if (isConnected) {
        const amount = await getAmountHold(address, data?.fswapAddress);
        setAvailableFswap(amount);

        const Amount = await getAmountHold(address, data?.customToken);
        setAvailableCustomToken(Amount);
      }
    }
    fetchBalance();
  }, [isConnected, pairAddress, data])


  function handlePercentClick(field, value, percent) {
    const calculated = ((value * percent) / 100).toFixed(2);
    setTradeInfo(prev => ({
      ...prev,
      [field]: calculated
    }));
  }

  if (isNotFound) return <div className="text-center text-red-600 py-8">Pair not found.</div>;

  return (
    <div className="dark:bg-gray-950 dark:text-white min-h-screen p-6">
      <div className="flex flex-wrap gap-6">
        <div className="flex-1 min-w-[60%] bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow">
          <div className="flex items-center gap-4 border-b pb-4 mb-4 border-gray-300 dark:border-gray-600">
            <img
              className="w-16 h-16 rounded-full"
              src={`https://scarlet-naval-lizard-255.mypinata.cloud/ipfs/${data?.customTokenImage}`}
              alt="Token Logo"
            />
            <div>
              <div className="text-2xl font-bold">{data?.customTokenName} / FSWAP</div>
              <div className="text-gray-500 text-sm">{pairAddress}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm">Price</div>
              <div className="text-green-400 text-lg font-semibold">{data?.price || '4.23'} FSWAP</div>
              <div className="text-sm text-gray-400">${data?.usdPrice || '1.32'}</div>
            </div>
          </div>
          <TradeChart />
        </div>

        <div className="flex-1 min-w-[30%] bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow">
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`px-6 py-2 rounded-md font-semibold ${isTradeBuy ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setIsTradeBuy(true)}
            >
              Buy
            </button>
            <button
              className={`px-6 py-2 rounded-md font-semibold ${!isTradeBuy ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setIsTradeBuy(false)}
            >
              Sell
            </button>
          </div>

          {isTradeBuy ? (
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">Amount in FSWAP</label>
                <input
                  type="number"
                  name="amountFswap"
                  value={tradeInfo.amountFswap}
                  onChange={handleBuyChange}
                  className="w-full mt-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
                />
                <div className="text-xs text-gray-500">Available:  {availableFswap || "0"}</div>
              </div>

              <div className="flex justify-between">
                {[25, 50, 75, 100].map(percent => (
                  <button
                    type="button"
                    key={percent}
                    onClick={() => handlePercentClick('amountFswap', availableFswap, percent)}
                    className="px-3 py-1 border rounded-md text-sm hover:bg-green-100 dark:hover:bg-green-800"
                  >
                    {percent}%
                  </button>
                ))}
              </div>

              <div className="bg-gray-200 dark:bg-gray-800 p-3 rounded-md">
                You get: <span className="font-semibold">{tradeInfo.amountFswapTo || '0'}</span>
              </div>


              {isConnected ? (
                isFetchingQuotes ? (<div className="w-full space-x-4 dark:bg-gray-600 flex items-center justify-center py-3 rounded-lg bg-gray-400 text-white font-semibold transition duration-200">
                  <div>Fetching quotes</div>
                  <div className="border-dashed rounded-full h-3 w-3 p-2 animate-spin border-2 border-blue-500"></div>
                </div>) : (<button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
                >
                  Buy
                </button>)

              ) : (<div className='flex justify-center items-center'><ConnectButton /></div>)}

            </form>
          ) : (
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">Amount in Custom Token</label>
                <input
                  type="number"
                  name="amountCustomToken"
                  value={tradeInfo.amountCustomToken}
                  onChange={handleSellChange}
                  className="w-full mt-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white"
                />
                <div className="text-xs text-gray-500">Available: {availableCustomToken}</div>
              </div>

              <div className="flex justify-between">
                {[25, 50, 75, 100].map(percent => (
                  <button
                    type="button"
                    key={percent}
                    onClick={() => handlePercentClick('amountCustomToken', availableCustomToken, percent)}
                    className="px-3 py-1 border rounded-md text-sm hover:bg-red-100 dark:hover:bg-red-800"
                  >
                    {percent}%
                  </button>
                ))}
              </div>

              <div className="bg-gray-200 dark:bg-gray-800 p-3 rounded-md">
                You get: <span className="font-semibold">{tradeInfo.amountCustomTokenTo || '0'}</span>
              </div>


              {isConnected ? (
                isFetchingQuotes ? (<div className="w-full space-x-4 dark:bg-gray-600 flex items-center justify-center py-3 rounded-lg bg-gray-400 text-white font-semibold transition duration-200">
                  <div>Fetching quotes</div>
                  <div className="border-dashed rounded-full h-3 w-3 p-2 animate-spin border-2 border-blue-500"></div>
                </div>) : (<button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-md"
                >
                  Sell
                </button>)

              ) : (<div className='flex items-center justify-center'><ConnectButton /></div>)}



            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default TradePage;

import React, { useState, useEffect, useRef } from 'react';
import { addressFeed } from '../data/positionAddressFeed';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from 'wagmi';
import { getAmountHold } from '../utils/fetchAmountHold';
import { IoClose } from "react-icons/io5";
import { toast } from 'react-toastify';
import { BrowserProvider } from 'ethers';
import { checkPairExists, fetchLiquidityData } from '../utils/fetchPairData';
import { checkErcExists } from '../utils/checkTokenExists';
import ToastContainer from './toastContainer';
import { removeLiquidity } from '../utils/removeLiquidity';


function RemoveLiquidity() {
  const { data: walletClient } = useWalletClient();
  const { isConnected, address } = useAccount();
  const [searchTerm, setSearchTerm] = useState()
  const [availableToken, setAvailableToken] = useState();
  const [addresses, setAddresses] = useState([]);
  const [activeField, setActiveField] = useState('pair0');
  const [isTokenSelection, setIsTokenSelection] = useState(false);
  const [lastChanged, setLastChanged] = useState("");
  const [isRemovingLiquidity, setIsRemovingLiquidity] = useState(false);
  const [isPairExists, setIsPairExists] = useState(false);
  const [pairAddress, setPairAddress] = useState("");
  const isUserInput = useRef(false);
  const [isTokenExists, setIsTokenExists] = useState(true)
  const [customTokenAddr, setCustomTokenAddr] = useState();
  const [isfetchingQuote, setIsfetchingQuote] = useState(false)

  const [pairData, setPairData] = useState({
    token0Address: "",
    token1Address: "",
    token0Value: "",
    token1Value: "",
    liquidityTokens: ""
  });



  useEffect(() => {
    setAddresses(addressFeed);
  }, []);

  function handleCustomTokenSelection(e) {
    setCustomTokenAddr(e.target.value);
  }

  const handleTokenSelect = (tokenAddress) => {
    const field = activeField === 'pair1' ? 'token1Address' : 'token0Address';
    setPairData(prev => ({ ...prev, [field]: tokenAddress }));
    setIsTokenSelection(false);
    setCustomTokenAddr("");
    isUserInput.current = true;
  };

  useEffect(() => {
    async function checkTokenExists(params) {
      setIsfetchingQuote(true)

      if (!pairData?.token0Address || !pairData?.token1Address) {
        setIsfetchingQuote(false);
        return;
      }
      try {
        const result0 = await checkErcExists(pairData.token0Address);
        const result1 = await checkErcExists(pairData.token1Address);

        if (!result0.isExist || !result1.isExist) {
          setIsTokenExists(false);
          setIsfetchingQuote(false);
          return;
        }
        setIsTokenExists(true);
        checkPairAndFetch();

      } catch (error) {
        console.log(error)
        setIsfetchingQuote(false);
      }

    }
    const checkPairAndFetch = async () => {
      if (pairData.token0Address && pairData.token1Address && isUserInput.current) {
        const result = await checkPairExists(pairData.token0Address, pairData.token1Address);
        if (result.exists) {
          setIsPairExists(true);
          setPairAddress(result.pairAddress);
          fetchPairData(result.pairAddress);
        } else {
          setIsPairExists(false);
          setPairAddress("");
          setIsfetchingQuote(false);
          return
        }
      } else {
        setIsfetchingQuote(false);
      }
    };

    async function fetchPairData(pairAddress) {
      try {
        const result = await fetchLiquidityData(pairAddress, pairData?.token0Address, address);
        const liquidityTokens = result?.tokenAmount;
        setAvailableToken(liquidityTokens)
        const token0Value = String((result?.reserveIn * (pairData?.liquidityTokens / result?.totalSupply)))
        const token1Value = String(result?.reserveOut * (pairData?.liquidityTokens / result?.totalSupply))

        setPairData(prev => ({
          ...prev,
          token0Value: token0Value,
          token1Value: token1Value,

        }))


      } catch (error) {
        console.error(error);
      } finally {
        setIsfetchingQuote(false)
        isUserInput.current = false;
        console.log("set false")
      }
    }

    checkTokenExists();
  }, [pairData, lastChanged]);

  async function handleRemoveLiquidity(e) {
    e.preventDefault();
    if (!pairData.token0Address || !pairData.token1Address || !pairData.token0Value || !pairData.token1Value) {
      toast.warn("Some fields are empty");
      return;
    }

    try {
      setIsRemovingLiquidity(true);
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      const result = await removeLiquidity(pairData.token0Address, pairData.token1Address, pairData.token0Value, pairData.token1Value, pairData?.liquidityTokens, signer, address);
      if (!result.isTxSuccessful) {
        toast.error("Liquidity addition Failed")
        return
      }
      toast.success("Liquidity Removal successfull");
    } catch (error) {
      toast.error("Adding Remove failed");
      console.log(error);
    } finally {
      setPairData(prev => ({
        ...prev,
        token0Address: "",
        token0Value: "",
        token1Address: "",
        token1Value: "",
        liquidityTokens: ""
      }))
      setAvailableToken("")
      setIsRemovingLiquidity(false);
    }
  }

  useEffect(() => {
    if (isTokenSelection) setSearchTerm('');
  }, [isTokenSelection]);


  const filteredItems = !searchTerm
    ? addresses
    : addresses.filter(item =>
      item.tokenName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      item.tokenSymbol.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      item.tokenAddress.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

  return (
    <div className="w-full relative min-h-96 max-w-md bg-white dark:bg-gray-900 rounded-2xl  p-6">
      <ToastContainer />
      {!isTokenSelection ? (
        isRemovingLiquidity ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-2xl">
            <div className="w-full p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-cyan-500 space-y-4">
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Removing Liquidity ...</h2>
              <div className="space-y-2 text-gray-800 dark:text-gray-200">
                <div className="flex justify-between">
                  <span>Token 0:</span>
                  <span>{pairData.token0Value} {addresses.find(a => a.tokenAddress === pairData.token0Address)?.tokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Token 1:</span>
                  <span>{pairData.token1Value} {addresses.find(a => a.tokenAddress === pairData.token1Address)?.tokenSymbol}</span>
                </div>

                <div className="flex justify-between">
                  <span>Removing :</span>
                  <span>{pairData?.liquidityTokens} LP Tokens</span>
                </div>
              </div>

              {/* Liquidity Pair Info */}
              <div className="text-sm text-gray-700 dark:text-gray-300 border-t pt-4">
                <h3 className="font-semibold text-lg mb-2">Pair Info</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span>Pair:</span>
                    <span>
                      {addresses.find(a => a.tokenAddress === pairData.token0Address)?.tokenSymbol || 'Token0'} /
                      {addresses.find(a => a.tokenAddress === pairData.token1Address)?.tokenSymbol || 'Token1'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pair Address:</span>
                    <span className="text-xs break-all text-right">{pairAddress}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>) : (
          <form onSubmit={handleRemoveLiquidity} className='flex flex-col gap-8 relative'>

            {/* Token Select */}
            <div className='flex flex-col gap-3'>
              <label className="text-gray-600 dark:text-gray-300 font-semibold">Select Tokens</label>
              <div className='flex justify-between items-center gap-6 flex-wrap'>
                {['token0Address', 'token1Address'].map((field, i) => (
                  <div
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveField(`pair${i}`);
                      setIsTokenSelection(true);
                    }}
                    className="flex items-center gap-2 px-4 py-3 w-36 justify-center dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:opacity-90"
                  >
                    {addresses.find(a => a.tokenAddress === pairData[field])?.tokenImage ? (
                      <>
                        <img
                          src={addresses.find(a => a.tokenAddress === pairData[field])?.tokenImage}
                          className="w-5 h-5 rounded-full"
                          alt={`Token ${i}`}
                        />
                        <span>{addresses.find(a => a.tokenAddress === pairData[field])?.tokenSymbol}</span>
                      </>
                    ) : (
                      <span>
                        {pairData[field]
                          ? `${pairData[field].slice(0, 6)}...${pairData[field].slice(-4)}`
                          : `Token ${i}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Input Values */}
            <div className='flex flex-col gap-4'>
              <label className="text-gray-600 dark:text-gray-300 font-semibold">Remove Liquidity Tokens</label>

              <div className="flex flex-col gap-2">
                <div className='flex justify-between text-sm font-medium'>
                  <p className='dark:text-white'>LiquidityTokens</p>
                  <p className="text-gray-500 dark:text-gray-400">Balance: {availableToken}</p>
                </div>
                <input
                  type="text"
                  min='0'
                  placeholder={'Amount LiquidityTokens'}
                  className='w-full rounded-lg px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600'
                  value={pairData["liquidityTokens"]}
                  onChange={(e) => {
                    setPairData(prev => ({ ...prev, liquidityTokens: e.target.value }));
                    isUserInput.current = true;
                  }}
                />

              </div>

            </div>

            {/* Liquidity Preview */}
            {isPairExists && pairData.token0Value && pairData.token1Value && (
              <div className="w-full p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-cyan-500 space-y-4">
                {isfetchingQuote ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-cyan-500 border-solid"></div>
                    <span className="ml-4 text-gray-700 dark:text-gray-300">Fetching quote...</span>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Liquidity Preview</h2>
                    <div className="space-y-2 text-gray-800 dark:text-gray-200">
                      <div className="flex justify-between">
                        <span>Token 0:</span>
                        <span>{pairData.token0Value} {addresses.find(a => a.tokenAddress === pairData.token0Address)?.tokenSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Token 1:</span>
                        <span>{pairData.token1Value} {addresses.find(a => a.tokenAddress === pairData.token1Address)?.tokenSymbol}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Removing :</span>
                        <span>{pairData?.liquidityTokens} LP Tokens</span>
                      </div>
                    </div>

                    {/* Liquidity Pair Info */}
                    <div className="text-sm text-gray-700 dark:text-gray-300 border-t pt-4">
                      <h3 className="font-semibold text-lg mb-2">Pair Info</h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                          <span>Pair:</span>
                          <span>
                            {addresses.find(a => a.tokenAddress === pairData.token0Address)?.tokenSymbol || 'Token0'} /
                            {addresses.find(a => a.tokenAddress === pairData.token1Address)?.tokenSymbol || 'Token1'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pair Address:</span>
                          <span className="text-xs break-all text-right">{pairAddress}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {!isPairExists && (
              <div className='flex flex-col justify-center items-center mt-2 px-4 py-3 rounded-md border border-cyan-500
                          font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'>
                <div>
                  <p>This Pair doesn't exists</p>
                </div>
              </div>
            )}

            <div className='flex items-center justify-center'>
              {isConnected ? (
                isTokenExists ? (
                  <button
                    disabled={isfetchingQuote}
                    type="submit"
                    className='w-full py-3 mt-2 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 transition-all duration-200'
                  >
                    Remove
                  </button>) : (
                  <button className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition duration-200">
                    Either token0 or token1 doesn't exist
                  </button>)

              ) : (
                <ConnectButton />
              )}
            </div>
          </form>)

      ) : (
        <div className="absolute  top-0 left-0 z-30 w-full h-full bg-white dark:bg-gray-800 p-4 overflow-y-auto rounded-md">
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="text"
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
              placeholder="Search Tokens"
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
            <button className="text-red-500" onClick={() => setIsTokenSelection(false)}>
              <IoClose size={24} />
            </button>
          </div>

          {filteredItems.length > 0 ?
            filteredItems.map((item, index) => (
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
            )) : (
              <p className="text-gray-500 dark:text-gray-400 text-center">No tokens found.</p>
            )}

          

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

export default RemoveLiquidity
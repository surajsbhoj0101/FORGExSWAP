import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { Contract, JsonRpcProvider, ZeroAddress, formatUnits } from 'ethers';


function TokenAmountHold({ tokenAddress }) {
  const [balance, setBalance] = useState('0'); 
  const provider = new JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const { isConnected, address } = useAccount();

  useEffect(() => {
    async function fetchBalance() {
      if (tokenAddress !== ZeroAddress && isConnected && address) {
        try {
          const tokenContract = new Contract(tokenAddress, IERC20.abi, provider);
          const rawBalance = await tokenContract.balanceOf(address);
          const decimals = await tokenContract.decimals();
          const formatted = Number(formatUnits(rawBalance, decimals)).toFixed(4); /*formatUnits returns a string ,
           toFixed returns a number or use it is not for string 4 mean 4 digit after decimal*/
          console.log("Token balance:", formatted);
          setBalance(formatted)
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }else{
        setBalance("")
      }
    }

    fetchBalance();
  }, [tokenAddress, isConnected, address]); 

  return (
    <div>
      <div>{balance}</div>
    </div>
  );
}

export default TokenAmountHold;

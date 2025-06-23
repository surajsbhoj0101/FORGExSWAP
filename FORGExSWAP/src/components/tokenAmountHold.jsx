import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { Contract, JsonRpcProvider, ZeroAddress, formatUnits, formatEther } from 'ethers';
import { zeroAddress } from 'viem';

function TokenAmountHold({ tokenAddress }) {
  const { isConnected, address } = useAccount();

  if (tokenAddress === '') tokenAddress = null
  const [balance, setBalance] = useState('0');
  const provider = new JsonRpcProvider(import.meta.env.VITE_API_URL || "https://sepolia.infura.io/v3/c2e1c563b7f64ab78b463601b03a9bdc"); // Use your own Infura or Alchemy URL


  useEffect(() => {
    async function fetchBalance() {

      if (tokenAddress && tokenAddress !== ZeroAddress && isConnected && address ) {
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
      } else if (tokenAddress === ZeroAddress) {
        try {
          const rawBalance = await provider.getBalance(address);
          const formatted = Number(formatEther(rawBalance)).toFixed(4)
          setBalance(formatted)
        } catch (error) {
          console.error("Error fetching balance:", error);
        }

      } else {
        setBalance('')
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

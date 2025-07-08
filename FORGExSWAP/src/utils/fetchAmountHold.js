import { useAccount } from 'wagmi';
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { Contract, JsonRpcProvider, ZeroAddress, formatUnits, formatEther } from 'ethers';
import { zeroAddress } from 'viem';

const provider = new JsonRpcProvider(import.meta.env.VITE_API_PROVIDER );

export async function getAmountHold(address,tokenAddress) {
    if (tokenAddress === '') tokenAddress = null
    if (tokenAddress && tokenAddress !== ZeroAddress) {
        try {
            const tokenContract = new Contract(tokenAddress, IERC20.abi, provider);
            const rawBalance = await tokenContract.balanceOf(address);
            const decimals = await tokenContract.decimals();
            const formatted = Number(formatUnits(rawBalance, decimals)).toFixed(4);
            return formatted;
        } catch (error) {
            console.log(error)
            return 0;
        }
        
    }


}
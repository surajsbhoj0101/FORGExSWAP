import { Contract, parseUnits, formatUnits, Interface, JsonRpcProvider } from "ethers";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";

const provider = new JsonRpcProvider(import.meta.env.VITE_API_PROVIDER);

export async function checkErcExists(tokenAddress) {
    try {
        const tokenContract = new Contract(tokenAddress, IERC20.abi, provider)
        const tokenName = await tokenContract.name();
        const tokenSymbol = await tokenContract.symbol();
        const decimal = await tokenContract.decimals();
        const totalSupply = await tokenContract.totalSupply()
        return {
             isExist: true,
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        totalSupply: formatUnits(totalSupply, decimal)
        }
    } catch (error) {
        return { isExist: false }
    }

    
}
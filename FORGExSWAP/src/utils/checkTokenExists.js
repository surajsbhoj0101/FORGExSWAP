import { Contract, parseUnits,formatUnits, Interface, JsonRpcProvider } from "ethers";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";

const provider = new JsonRpcProvider(import.meta.env.VITE_API_URL || "https://sepolia.infura.io/v3/c2e1c563b7f64ab78b463601b03a9bdc");


export async function checkErcExists(tokenAddress) {
    
    const tokenContract = new Contract(tokenAddress, IERC20.abi, provider)
    const tokenName = await tokenContract.name();
    const tokenSymbol = await tokenContract.symbol();
    const decimal = await tokenContract.decimals();
    const totalSupply = await tokenContract.totalSupply()

    return tokenName ? {
        isExist: true,
        tokenName:tokenName,
        tokenSymbol:tokenSymbol,
        totalSupply:formatUnits(totalSupply,decimal)
    } : { isExist: false };
}
import { JsonRpcProvider, Contract, ZeroAddress, parseUnits, formatUnits } from "ethers";
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";

const provider = new JsonRpcProvider(import.meta.env.VITE_API_PROVIDER);
const factoryAddress = "0xF62c03E08ada871A0bEb309762E260a7a6a880E6";
const factoryContract = new Contract(factoryAddress, IUniswapV2Factory.abi, provider);


export async function getDecimals(token0,token1) {

    const token0Contract = new Contract(token0, IERC20.abi, provider);
    const token1Contract = new Contract(token1, IERC20.abi, provider);
    const [decimals0, decimals1] = await Promise.all([
        token0Contract.decimals(),
        token1Contract.decimals(),
    ]);

    return [decimals0,decimals1];
}


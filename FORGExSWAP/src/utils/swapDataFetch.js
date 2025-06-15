import { JsonRpcProvider, Contract, formatUnits, ZeroAddress } from "ethers";
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";

const provider = new JsonRpcProvider("https://testnet-rpc.monad.xyz");
const factoryAddress = "0x733e88f248b742db6c14c0b1713af5ad7fdd59d0";
const factory = new Contract(factoryAddress, IUniswapV2Factory.abi, provider);

export async function FetchSwapData(tokenA,tokenB) {
    if (!tokenA || !tokenB) {
        throw new Error("Both tokenA and tokenB must be provided");
    }

    const pairAddress = await factory.getPair(tokenA, tokenB);

    if (!pairAddress || pairAddress === ZeroAddress) {
        return "This Token contract pair doesn't exist";
    }

    const pair = new Contract(pairAddress, IUniswapV2Pair.abi, provider);
    const token0 = await pair.token0();
    const token1 = await pair.token1();
    const [reserve0, reserve1] = await pair.getReserves();

    const token0Contract = new Contract(token0, IERC20.abi, provider);
    const token1Contract = new Contract(token1, IERC20.abi, provider);

    const [decimals0, decimals1] = await Promise.all([
        token0Contract.decimals(),
        token1Contract.decimals(),
    ]);

    const normalizedReserve0 = parseFloat(formatUnits(reserve0, decimals0));
    const normalizedReserve1 = parseFloat(formatUnits(reserve1, decimals1));

    const isToken0 = token0.toLowerCase() === tokenA.toLowerCase();
    const price = isToken0
        ? normalizedReserve1 / normalizedReserve0
        : normalizedReserve0 / normalizedReserve1;

    return price;
}

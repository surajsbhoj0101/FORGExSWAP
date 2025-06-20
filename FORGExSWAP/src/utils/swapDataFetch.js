import { JsonRpcProvider, Contract, ZeroAddress, parseUnits, formatUnits } from "ethers";
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";


const provider = new JsonRpcProvider(import.meta.env.VITE_API_URL || "https://sepolia.infura.io/v3/c2e1c563b7f64ab78b463601b03a9bdc"); 
console.log(import.meta.env.VITE_API_URL || "https://sepolia.infura.io/v3/c2e1c563b7f64ab78b463601b03a9bdc")
const factoryAddress = "0xF62c03E08ada871A0bEb309762E260a7a6a880E6"; //A Factory Contract is a smart contract whose main job is to deploy other contracts.
const factory = new Contract(factoryAddress, IUniswapV2Factory.abi, provider); 

export async function FetchSwapData(tokenA, amountInRaw,pairAddress) {
  
 
  const pair = new Contract(pairAddress, IUniswapV2Pair.abi, provider);
  const token0 = await pair.token0();
  const token1 = await pair.token1();
  const [reserve0, reserve1] = await pair.getReserves();

  // Get decimals
  const token0Contract = new Contract(token0, IERC20.abi, provider);
  const token1Contract = new Contract(token1, IERC20.abi, provider);
  const [decimals0, decimals1] = await Promise.all([
    token0Contract.decimals(),
    token1Contract.decimals(),
  ]);

  let reserveIn, reserveOut, inDecimals, outDecimals;

  if (tokenA.toLowerCase() === token0.toLowerCase()) {
    reserveIn = reserve0;
    reserveOut = reserve1;
    inDecimals = decimals0;
    outDecimals = decimals1;
  } else {
    reserveIn = reserve1;
    reserveOut = reserve0;
    inDecimals = decimals1;
    outDecimals = decimals0;
  }


  const amountIn = parseUnits(amountInRaw, inDecimals); // BigInt


  console.log(reserveOut);
  const amountInWithFee = amountIn * 997n;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;
  const amountOut = numerator / denominator;
  

  return {
    
    amountOut: formatUnits(amountOut, outDecimals),
    inDecimal:inDecimals ,
    amountOutRaw:amountOut  // BigInt
  };
}


export async function checkSwapPairExists(tokenA,tokenB) {
  if (!tokenA || !tokenB) {
    throw new Error("Both tokenA and tokenB must be provided");
  }

  const pairAddress = await factory.getPair(tokenA, tokenB);
  if (!pairAddress || pairAddress === ZeroAddress) {
    return {
      exists:false,
      pairAddress:null
    }
  }else{
    return {
      exists:true,
      pairAddress:pairAddress
    }
  }


}


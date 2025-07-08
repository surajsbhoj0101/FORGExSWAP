import { JsonRpcProvider, Contract, ZeroAddress, parseUnits, formatUnits } from "ethers";
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";


const provider = new JsonRpcProvider(import.meta.env.VITE_API_PROVIDER);
const factoryAddress = "0xF62c03E08ada871A0bEb309762E260a7a6a880E6"; //A Factory Contract is a smart contract whose main job is to deploy other contracts.
const factory = new Contract(factoryAddress, IUniswapV2Factory.abi, provider);

export async function fetchLiquidityData(pairAddress, tokenA,address) {
  const pair = new Contract(pairAddress, IUniswapV2Pair.abi, provider);
  const tokenAmount = fetchLiquidityTokenBalance(pairAddress, address)
  const token0 = await pair.token0();
  const token1 = await pair.token1();
  const [reserve0, reserve1] = await pair.getReserves();

  const tSupply = await pair.totalSupply();
  const totalSupply = formatUnits(tSupply,18)

  // Get decimals
  const token0Contract = new Contract(token0, IERC20.abi, provider);
  const token1Contract = new Contract(token1, IERC20.abi, provider);
  const [decimals0, decimals1] = await Promise.all([
    token0Contract.decimals(),
    token1Contract.decimals(),
  ]);

  let inDecimals, outDecimals, resvIn, resvOut;

  if (tokenA.toLowerCase() === token0.toLowerCase()) {
    inDecimals = decimals0;
    outDecimals = decimals1;
    resvIn = formatUnits(reserve0, inDecimals)
    resvOut = formatUnits(reserve1, outDecimals)
  } else {
    inDecimals = decimals1;
    outDecimals = decimals0;
    resvIn = formatUnits(reserve1, outDecimals)
    resvOut = formatUnits(reserve0, inDecimals)
  }


  return {
    tokenAmount: tokenAmount,
    reserveOut: resvOut,
    reserveIn: resvIn,
    totalSupply: totalSupply
  };

}
async function fetchLiquidityTokenBalance(pairAddress, address) {
  const pair = new Contract(pairAddress, IUniswapV2Pair.abi, provider);
  const result = await pair.balanceOf(address)
  const tokenAmount = formatUnits(result, 18)
  console.log(tokenAmount)
  return tokenAmount
  
}

export async function FetchPairData(tokenA, amountInRaw, pairAddress) {
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

  const lpTokenIss = await pair.totalSupply();
  const lpToken = formatUnits(lpTokenIss, 18)

  let reserveIn, reserveOut, inDecimals, outDecimals, resvIn, resvOut;

  if (tokenA.toLowerCase() === token0.toLowerCase()) {

    reserveIn = reserve0;
    reserveOut = reserve1;
    inDecimals = decimals0;
    outDecimals = decimals1;
    resvIn = formatUnits(reserve0, inDecimals)
    resvOut = formatUnits(reserve1, outDecimals)
  } else {
    reserveIn = reserve1;
    reserveOut = reserve0;
    inDecimals = decimals1;
    outDecimals = decimals0;
    resvIn = formatUnits(reserve1, outDecimals)
    resvOut = formatUnits(reserve0, inDecimals)
  }

  if (!amountInRaw || isNaN(amountInRaw) || amountInRaw.trim() === "") {
    throw new Error("User Input Failed");

  }
  const amountIn = parseUnits(amountInRaw, inDecimals); // BigInt


  console.log(reserveOut);
  const amountInWithFee = amountIn * 997n;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;
  const amountOut = numerator / denominator;


  return {

    amountOut: formatUnits(amountOut, outDecimals),
    amountIn: formatUnits(amountIn, inDecimals),
    inDecimal: inDecimals,
    amountOutRaw: amountOut,
    reserveOut: resvOut,
    reserveIn: resvIn, // BigInt
    totalSupply: lpToken
  };
}


export async function checkPairExists(tokenA, tokenB) {
  
  const wethAddr = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
  if (!tokenA || !tokenB) {
    throw new Error("Both tokenA and tokenB must be provided");
  }

  if ((tokenA === ZeroAddress && tokenB === wethAddr) || (tokenB === ZeroAddress && tokenA === wethAddr)) {
    return {
      exists: true,
      pairAddress: wethAddr
    }
  }

  let token0 = tokenA;
  let token1 = tokenB;

  if (tokenA === ZeroAddress) {
    token0 = wethAddr
  }
  if (tokenB === ZeroAddress) {
    token1 = wethAddr
  }

  const pairAddress = await factory.getPair(token0, token1);

  console.log(pairAddress)
  if (!pairAddress || pairAddress === ZeroAddress) {
    return {
      exists: false,
      pairAddress: null
    }
  } else {
    console.log("Pair Address :", pairAddress);
    return {
      exists: true,
      pairAddress: pairAddress
    }
  }

}


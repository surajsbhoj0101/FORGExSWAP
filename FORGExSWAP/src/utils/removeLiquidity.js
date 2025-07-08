import { Contract, parseUnits } from "ethers";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";

const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
const factoryAddress = "0xF62c03E08ada871A0bEb309762E260a7a6a880E6";

export async function removeLiquidity(
    token0Address,
    token1Address,
    token0Amount,
    token1Amount,
    liquidityAmount, // as string or number
    signer,
    to
) {
    const token0 = new Contract(token0Address, IERC20.abi, signer);
    const token1 = new Contract(token1Address, IERC20.abi, signer);
    const factory = new Contract(factoryAddress, IUniswapV2Factory.abi, signer);

    const [decimals0, decimals1] = await Promise.all([
        token0.decimals(),
        token1.decimals(),
    ]);

    const token0Parsed = parseUnits(token0Amount.toString(), decimals0);
    const token1Parsed = parseUnits(token1Amount.toString(), decimals1);

    const minToken0 = token0Parsed * 98n / 100n;
    const minToken1 = token1Parsed * 98n / 100n;

  
    const lpTokenAddress = await factory.getPair(token0Address, token1Address);
    if (lpTokenAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("Pair does not exist");
    }

    const lpToken = new Contract(lpTokenAddress, IERC20.abi, signer);
    const lpDecimals = await lpToken.decimals();
    const liquidity = parseUnits(liquidityAmount.toString(), lpDecimals);

   
    const allowance = await lpToken.allowance(await signer.getAddress(), routerAddress);
    if (allowance < liquidity) {
        const approveTx = await lpToken.approve(routerAddress, liquidity);
        await approveTx.wait();
        console.log("LP token approved");
    }

    const router = new Contract(routerAddress, IUniswapV2Router02.abi, signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const tx = await router.removeLiquidity(
        token0Address,
        token1Address,
        liquidity,
        minToken0,
        minToken1,
        to,
        deadline
    );

    const receipt = await tx.wait();

    return {
        isTxSuccessful: receipt.status === 1,
        txHash: tx.hash
    };
}

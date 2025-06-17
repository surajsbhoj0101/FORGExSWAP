import { Contract, parseUnits } from "ethers";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { FetchSwapData, checkSwapPairExists } from "./swapDataFetch";

const routerAddress = '0xfb8e1c3b833f9e67a71c859a132cf783b645e436';

export async function swapTokens({
    amountIn,
    tokenInAddress,
    tokenOutAddress,
    signer
}) {
    if (!signer) throw new Error("No signer provided");
    console.log("came")
    const router = new Contract(routerAddress, IUniswapV2Router02.abi, signer);
    console.log("Signer address:", await signer.getAddress());

    const tokenIn = new Contract(tokenInAddress, IERC20.abi, signer);

    console.log("came2")
    const check = await checkSwapPairExists(tokenInAddress, tokenOutAddress);
    if (!check.exists) {
        throw new error("Pair doesn't exists")
    }

    const amountData = await FetchSwapData(tokenInAddress, amountIn, check.pairAddress);
    console.log("Approval confirmed.");
    const amountInParsed = parseUnits(amountIn, amountData.inDecimal);
    console.log(amountInParsed)
    const approveTx = await tokenIn.approve(routerAddress, amountInParsed)
    await approveTx.wait();


    const path = [tokenInAddress, tokenOutAddress]
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; //1000 divide mean changing millisecond to s beacause evm doesn't take ms
    console.log("came3")
    const swapTx = await router.swapExactTokensForTokens(
        amountInParsed,
        amountData.amountOutRaw,
        path,
        await signer.getAddress(),
        deadline
    );
    await swapTx.wait();

    return {
        isTxSuccessful: !!swapTx.hash
    };

}
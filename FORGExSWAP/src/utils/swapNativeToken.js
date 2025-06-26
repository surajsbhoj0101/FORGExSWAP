import { Contract, parseEther } from "ethers";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import { ZeroAddress } from "ethers";
import { WETH_ABI } from '../data/wrapper_abi.js'
import { swapTokens } from "./swapTokens";
import { checkSwapPairExists } from "./swapDataFetch";

const routerAddress = '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3';

export async function swapNativeTokens({
    amountIn,
    tokenInAddress,
    tokenOutAddress,
    signer
}) {
    if (!signer) throw new Error("No signer is provided");

    const wethAddr = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
    const router = new Contract(routerAddress, IUniswapV2Router02.abi, signer);
   
    const weth = new Contract(wethAddr, WETH_ABI, signer);
   
    const check = await checkSwapPairExists(tokenInAddress, tokenOutAddress);
    if (!check.exists) {
        throw new Error("Pair doesn't exist");
    }

    // Native ETH -> WETH 
    if (tokenInAddress === ZeroAddress && tokenOutAddress === wethAddr) {
        const tx = await weth.deposit({ value: parseEther(amountIn) });
        await tx.wait();
        return { isTxSuccessful: !!tx.hash };
    }

    // WETH -> Native ETH 
    if (tokenInAddress === wethAddr && tokenOutAddress === ZeroAddress) {
        const tx = await weth.withdraw(parseEther(amountIn));
        await tx.wait();
        return { isTxSuccessful: !!tx.hash };
    }

    // Native ETH -> Other ERC20 
    if (tokenInAddress === ZeroAddress) {
        const tx = await weth.deposit({ value: parseEther(amountIn) }); //{} seding (wei or ether) or struct
        await tx.wait();
        return await swapTokens({ amountIn, tokenInAddress: wethAddr, tokenOutAddress, signer });
    }

    // ERC20 -> Native ETH 
    if (tokenOutAddress === ZeroAddress) {
        const result = await swapTokens({ amountIn, tokenInAddress, tokenOutAddress: wethAddr, signer });
        if (!result.isTxSuccessful) throw new Error("Swap to WETH failed");
        const tx = await weth.withdraw( result.amountOut);
        await tx.wait();
        return { isTxSuccessful: !!tx.hash };
    }

}

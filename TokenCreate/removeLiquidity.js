const { JsonRpcProvider, Wallet, Contract, parseUnits } = require("ethers");
const IUniswapV2Router02 = require("@uniswap/v2-periphery/build/IUniswapV2Router02.json");
const IERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");
require("dotenv").config();

const provider = new JsonRpcProvider(process.env.VITE_API_URL);
const signer = new Wallet(process.env.PRIVATE_KEY, provider);

const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
const FSWAP = "0xbBED32171f410aeF7CE2c77a2231A6e6e48FbB34";
const WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const toAddress = "0x6888bda3F6E78c58F4d669939FB6dc9C87E714D7";
const lpTokenAddr = "0x0EECC738416724F0aF8C26dC608D5011541133F4"; // Pair (LP token) address

async function remove_Liquidity() {
    console.log(IUniswapV2Router02.abi)
    const lpTokenAmount = parseUnits("67", 18); // LP tokens to burn
    const minFswap = parseUnits("800", 18);     // Minimum FSWAP to receive
    const minWeth = parseUnits("0.38", 18);     // Minimum WETH to receive
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const routerContract = new Contract(routerAddress, IUniswapV2Router02.abi, signer);
    const lpTokenContract = new Contract(lpTokenAddr, IERC20.abi, signer);

    const lpBalance = await lpTokenContract.balanceOf(signer.address);
    console.log("Your LP token balance:", lpBalance.toString());

    

    // Step 1: Approve router to spend LP tokens
    const approveTx = await lpTokenContract.approve(routerAddress, lpTokenAmount);
    await approveTx.wait();
    console.log("Router approved to spend LP tokens");

    // Step 2: Remove liquidity
    const tx = await routerContract.removeLiquidity(
        FSWAP,
        WETH,
        lpTokenAmount,
        minFswap,
        minWeth,
        toAddress,
        deadline
    );

    const receipt = await tx.wait();
    console.log("Liquidity removed! Tx hash:", receipt.transactionHash);
}

(async () => {
    try {
        await remove_Liquidity();
    } catch (err) {
        console.error("Error removing liquidity:", err);
    }
})();

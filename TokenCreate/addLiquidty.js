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

async function addLiquidity() {
    const FswapContract = new Contract(FSWAP, IERC20.abi, signer);
    const WethContract = new Contract(WETH, IERC20.abi, signer);

    const FSWAP_Value = parseUnits("10000", 18);
    const WETH_Value = parseUnits("0.45", 18);

    await FswapContract.approve(routerAddress, FSWAP_Value);
    await WethContract.approve(routerAddress, WETH_Value);

    const minFswap = parseUnits("9800", 18); // 2% slippage
    const minWeth = parseUnits("0.42", 18);  // 2% slippage

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const routerContract = new Contract(routerAddress, IUniswapV2Router02.abi, signer);

    const tx = await routerContract.addLiquidity(
        FSWAP,
        WETH,
        FSWAP_Value,
        WETH_Value,
        minFswap,
        minWeth,
        toAddress,
        deadline
    );

    const receipt = await tx.wait();
    console.log("Liquidity added!", receipt);
}

(async () => {
    await addLiquidity();
})();

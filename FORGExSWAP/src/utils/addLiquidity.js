import { Contract, parseUnits } from "ethers";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";


const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
const fswapAddress = "0xbBED32171f410aeF7CE2c77a2231A6e6e48FbB34";

export async function addLiquidity(customTokenAddress, customTokenAmount, fswapAmount, signer, toAddress) {
    const customTokenContract = new Contract(customTokenAddress, IERC20.abi, signer);
    const fswapContract = new Contract(fswapAddress, IERC20.abi, signer);

    const customTokenParsed = parseUnits(customTokenAmount, 18); // bigint
    const fswapParsed = parseUnits(fswapAmount, 18);             // bigint

    const customTokenValue = customTokenParsed * 9n / 10n;
    const fswapTokenValue = fswapParsed;

    const minCustomToken = customTokenValue * 98n / 100n;
    const minFswapToken = fswapTokenValue * 98n / 100n;


    await customTokenContract.approve(routerAddress, customTokenValue);
    console.log("custom token approved");

    await fswapContract.approve(routerAddress, fswapTokenValue);
    console.log("fswap token approved");

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const routerContract = new Contract(routerAddress, IUniswapV2Router02.abi, signer);
    console.log("Calling addLiquidity");

    const tx = await routerContract.addLiquidity(
        customTokenAddress,
        fswapAddress,
        customTokenValue,
        fswapTokenValue,
        minCustomToken,
        minFswapToken,
        toAddress,
        deadline
    );
    await tx.wait();

    return { isTxSuccessful: !!tx.hash };
}

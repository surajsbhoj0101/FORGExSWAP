import { Contract, parseUnits, Interface } from "ethers";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";


const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
const fswapAddress = "0x81D1eb8037C47E329900A3bf8a78814bc259c770";

export async function addLiquidity(customTokenAddress, customTokenAmount, fswapAmount, signer, toAddress) {
    const customTokenContract = new Contract(customTokenAddress, IERC20.abi, signer);
    const fswapContract = new Contract(fswapAddress, IERC20.abi, signer);

    const customTokenParsed = parseUnits(customTokenAmount, 18); // bigint
    const fswapParsed = parseUnits(fswapAmount, 18);             // bigint

    const customTokenValue = customTokenParsed * 9n / 10n;
    const fswapTokenValue = fswapParsed;

    const minCustomToken = customTokenValue * 98n / 100n;
    const minFswapToken = fswapTokenValue * 98n / 100n;

    const customAllowance = await customTokenContract.allowance(await signer.getAddress(), routerAddress);
    if (customAllowance < customTokenValue) {
        const customTokenApproveTx =  await customTokenContract.approve(routerAddress, customTokenValue);
        await customTokenApproveTx.wait()
        console.log("custom token approved");
    }

    const fswapAllowance = await fswapContract.allowance(await signer.getAddress(), routerAddress);
    if (fswapAllowance < fswapTokenValue) {
        const fswapTokenApproveTx =  await fswapContract.approve(routerAddress, fswapTokenValue);
        await fswapTokenApproveTx.wait();
        console.log("fswap token approved");
    }



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
    const receipt = await tx.wait();

    const iface = new Interface(IUniswapV2Factory.abi);

    let tokenCreatedEvent = null;

    for (const log of receipt.logs) {
        try {
            const parsed = iface.parseLog(log); //Tries to decode the log using the ABI
            if (parsed.name === "PairCreated") {
                tokenCreatedEvent = parsed;
                break;
            }
        } catch (err) {
            continue;
        }
    }


    return {
        isTxSuccessful: !!tx.hash,
        pairAddress: tokenCreatedEvent.args.pair
    };
}

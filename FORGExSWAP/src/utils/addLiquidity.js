import { Contract, parseUnits, Interface } from "ethers";
import IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import IERC20 from "@openzeppelin/contracts/build/contracts/ERC20.json";
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";


const routerAddress = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";

export async function addLiquidity(token0Address, token1Address, token0Amount, token1Amount, signer, toAddress, isTokenCreation) {
    token0Amount = String(Number(token0Amount).toFixed(8))
    token1Amount = String(Number(token1Amount).toFixed(8))
    const token0Contract = new Contract(token0Address, IERC20.abi, signer);
    const token1Contract = new Contract(token1Address, IERC20.abi, signer);

    const [decimals0, decimals1] = await Promise.all([
        token0Contract.decimals(),
        token1Contract.decimals(),
    ]);
    const token0Parsed = parseUnits(token0Amount, decimals0); // bigint
    const token1Parsed = parseUnits(token1Amount, decimals1); // bigint


    const token0Value = isTokenCreation ? token0Parsed * 9n / 10n : token0Parsed;
    const token1Value = token1Parsed;

    const minToken0 = token0Value * 98n / 100n;
    const minToken1 = token1Value * 98n / 100n;

    const token0Allowance = await token0Contract.allowance(await signer.getAddress(), routerAddress);
    if (token0Allowance < token0Value) {
        const token0ApproveTx = await token0Contract.approve(routerAddress, token0Value);
        await token0ApproveTx.wait()
        console.log("token0 Approved");
    }

    const token1Allowance = await token1Contract.allowance(await signer.getAddress(), routerAddress);
    if (token1Allowance < token1Value) {
        const token1ApproveTx = await token1Contract.approve(routerAddress, token1Value);
        await token1ApproveTx.wait();
        console.log("token1 approved");
    }



    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const routerContract = new Contract(routerAddress, IUniswapV2Router02.abi, signer);
    console.log("Calling addLiquidity");

    const tx = await routerContract.addLiquidity(
        token0Address,
        token1Address,
        token0Value,
        token1Value,
        minToken0,
        minToken1,
        toAddress,
        deadline
    );
    const receipt = await tx.wait();

    if (!isTokenCreation) {
        return {
            isTxSuccessful: !!tx.hash,
        }
    }

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



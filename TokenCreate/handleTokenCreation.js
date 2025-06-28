import { JsonRpcProvider, Wallet, Contract, parseUnits, Interface } from "ethers";
import dotenv from "dotenv";
import { tokenFactory_abi } from "../data/TokenFactory_abi.js";

dotenv.config();

const provider = new JsonRpcProvider(process.env.VITE_API_URL);
const signer = new Wallet(process.env.PRIVATE_KEY, provider);
const factoryAddress = "0xde65a90F47e0bD23D025dB2E4b8dc68c0727997C";

async function handleTokenCreation(tokenName, tokenSymbol, tokenSupply) {
    const factoryContract = new Contract(factoryAddress, tokenFactory_abi, signer);
    const supply = parseUnits(tokenSupply.toString(), 0);

    const tx = await factoryContract.createToken(tokenName, tokenSymbol, supply);
    const receipt = await tx.wait();

    // Manually decode event using Interface

    /*
    Interface comes from Ethers.js: import { Interface } from "ethers";

    It uses your contract's ABI (tokenFactory_abi) to understand the logs and decode them.

    Think of iface as a translator that knows how to read the data emitted by your smart contract.
    */

    const iface = new Interface(tokenFactory_abi);

    let tokenCreatedEvent;

    

    /*
    After a transaction, Ethers returns a receipt, which includes receipt.logs — a list of all events emitted.

    This logs array contains raw logs from all contracts touched during the transaction.

    You need to check each log to see if it’s the one you're interested in.
    */

    for (const log of receipt.logs) {
        try {
            const parsed = iface.parseLog(log); //Tries to decode the log using the ABI
            if (parsed.name === "TokenCreated") {
                tokenCreatedEvent = parsed;
                break;
            }
        } catch (err) {
            console.log(err) //If the log doesn't match any event defined in tokenFactory_abi, it throws an error .
        }
    }

    if (!tokenCreatedEvent) {
        throw new Error("TokenCreated event not found in logs");
    }

    return {
        address: tokenCreatedEvent.args.tokenAddress,
        name: tokenCreatedEvent.args.name,
        symbol: tokenCreatedEvent.args.symbol,
        supply: tokenCreatedEvent.args.supply.toString(),
        owner: tokenCreatedEvent.args.owner
    };
}

//  Immediately Invoked Async Function 
(async () => {
    try {
        const info = await handleTokenCreation("FORGEXSWAP", "FSWAP", "10000");
        console.log("✅ Token Created:");
        console.log("Address:", info.address);
        console.log("Name:", info.name);
        console.log("Symbol:", info.symbol);
        console.log("Supply:", info.supply);
        console.log("Owner:", info.owner);
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
})();

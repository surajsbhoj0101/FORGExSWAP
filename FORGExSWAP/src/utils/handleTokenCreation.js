import { Contract, parseUnits, Interface } from "ethers";
import { tokenFactory_abi } from "../data/TokenFactory_abi";

const factoryAddress = "0xde65a90F47e0bD23D025dB2E4b8dc68c0727997C";

export async function handleTokenCreation(tokenName, tokenSymbol, tokenSupply, signer) {
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

    let tokenCreatedEvent = null;



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
    console.log(tokenCreatedEvent.args.tokenAddress)

    return {
        isTxSuccessful: !!tx.hash,
        address: tokenCreatedEvent.args.tokenAddress
    };


}

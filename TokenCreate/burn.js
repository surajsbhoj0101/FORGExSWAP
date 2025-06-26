const { JsonRpcProvider, Wallet, Contract, parseUnits } = require("ethers");
const IERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const { ZeroAddress } = require("ethers");
require("dotenv").config();

const FSWAP = "0xbBED32171f410aeF7CE2c77a2231A6e6e48FbB34";
const provider = new JsonRpcProvider(process.env.VITE_API_URL);
const signer = new Wallet(process.env.PRIVATE_KEY, provider);

async function burnTokens() {
    const toBurn = parseUnits("9999999999999999990000", 18);  // 10,000 tokens
    const burnAddress = "0x000000000000000000000000000000000000dEaD";  // or 0x0...0

    const token = new Contract(FSWAP, IERC20.abi, signer);

    const tx = await token.transfer(ZeroAddress, toBurn);
    console.log("Burn tx hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Burn complete!", receipt.transactionHash);
}

(async () => {
    await burnTokens();
})();

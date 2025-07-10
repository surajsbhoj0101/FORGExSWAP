const { JsonRpcProvider, Wallet, Contract, parseUnits } = require("ethers");
const IERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const { ZeroAddress } = require("ethers");
require("dotenv").config();

const FSWAP = " 0xFe078e9Bc54F443a1e64F5A2ae289E43A07fBce7";
const provider = new JsonRpcProvider(process.env.VITE_API_URL);
const signer = new Wallet(process.env.PRIVATE_KEY, provider);

async function burnTokens() {
    const toBurn = parseUnits("9", 18);  
    const burnAddress = "0x000000000000000000000000000000000000dEaD"; 

    const token = new Contract(FSWAP, IERC20.abi, signer);

    const tx = await token.transfer(ZeroAddress, toBurn);
    console.log("Burn tx hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Burn complete!", receipt.transactionHash);
}

(async () => {
    await burnTokens();
})();

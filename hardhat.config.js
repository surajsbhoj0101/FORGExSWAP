require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks:{
    sepolia:{
      url: `${process.env.VITE_API_URL}`,
      accounts:
        [process.env.PRIVATE_KEY],
    },
  },
};

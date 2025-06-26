import pkg from 'hardhat';
const { ethers } = pkg;


async function main() {
    const Factory = await ethers.getContractFactory("TokenFactory");
    const FactoryContract = await Factory.deploy();
    await FactoryContract.waitForDeployment();
    console.log("Contract deployed to ",await FactoryContract.getAddress());
}

main();
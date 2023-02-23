const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [signer] = await ethers.getSigners();

  const ERC20Contract = await ethers.getContractFactory("ApmFlagToken");
  const contract = await ERC20Contract.deploy();

  await contract.deployed();

  console.log(`Deployed to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

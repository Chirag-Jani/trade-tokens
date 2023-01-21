require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "localhost",
  // specifying the solidity version
  solidity: "0.8.17",
  // specifying the network
  networks: {
    hardhat: {
      // specifying the chain id
      chainId: 31337,
    },
  },
  paths: {
    // these artifacts will help us to interact with deployed smart contract from the React frontend
    artifacts: "./src/artifacts",
  },
};

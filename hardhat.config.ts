import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();
import "hardhat-deploy";


const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const GOERLI_PRC_URL = process.env.GOERLI_RPC_URL!;
const ETHERSCAN_APIKEY = process.env.ETHERSCAN_APIKEY!;

const config: HardhatUserConfig = {
  solidity: "0.8.7",
  networks: {
    localhost: {
      chainId: 31337,
      url: 'http://127.0.0.1:8545/'
    },
    goerli: {
      chainId: 5,
      accounts: [PRIVATE_KEY],
      url:GOERLI_PRC_URL
    }
  },
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      default: 0
    },
    user: {
      default: 1
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_APIKEY
  },
};

export default config;
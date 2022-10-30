import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BASE_FEE, deploymentChains, GAS_PRICE_LINK } from "../helper-hardhat.config";

const deployMock: DeployFunction = async ( hre : HardhatRuntimeEnvironment) => {

    const { getNamedAccounts, deployments, network, ethers } = hre;

    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if(deploymentChains.includes(network.name)) {
        
        log(`Deploying mocks to ${network.name}`); 

        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK],
            log: true
        })
    }

    log("Mocks Deployed!")
    log("----------------------------------")
    log("You are deploying to a local network, you'll need a local network running to interact")
    log(
        "Please run `npx hardhat console --network localhost` to interact with the deployed smart contracts!"
    )
    log("----------------------------------")
}

export default deployMock;
deployMock.tags = ["all", "mock"];
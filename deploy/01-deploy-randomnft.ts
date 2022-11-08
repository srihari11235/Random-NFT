import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deploymentChains, networkConfig, VRF_SUB_FUND_AMOUNT } from "../helper-hardhat.config";
import uploadToNFTStorage from "../scripts/uploadToNFTStorage";
import verify from "../utils/verify";


const metaDataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100
        }
    ]
}

const deployRandomNFT: DeployFunction = async function( hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;

    let subcriptionId = "";
    let vrfCoordinatorAddress = "";
    let vrfCoordinatorMock;
    let tokenURIs: string[] = [
        "ipfs://bafyreif2ntho5lzic5dajwrb4jcngylwrca56jxqnivwzlnbg2hkfdpz6e/metadata.json",
        "ipfs://bafyreiencynthuab5jetrxifsyjqzvxnw2kdhdvosgc6khqhlohxx25x7y/metadata.json",
        "ipfs://bafyreid6du5jw3hgngcpm52h6k3unaxvwgl3shd5fuyurcilt4ltq7u2pm/metadata.json"
    ];

    // run script 'uploadToNFTStorage' and get the IPFS imageUrls from console log
    if(process.env.USE_NFT_STORAGE == "true") {   
        const imageNFTStorageResponse = await uploadToNFTStorage();

        imageNFTStorageResponse.forEach(imageInfo => {
            tokenURIs.push(imageInfo.url);
        });
    } else {
        //implment upload with pinata
    }


    if(deploymentChains.includes(network.name)) {
        vrfCoordinatorMock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        vrfCoordinatorAddress = vrfCoordinatorMock.address;

        const tx = await vrfCoordinatorMock.createSubscription();
        const txReciept = await tx.wait(1);

        subcriptionId = txReciept.events[0].args.subId;
        await vrfCoordinatorMock.fundSubscription(subcriptionId, VRF_SUB_FUND_AMOUNT);

        
    } else {
        vrfCoordinatorAddress = networkConfig[network.config.chainId!].vrfCoordinator!;
        subcriptionId = networkConfig[network.config.chainId!].subscriptionId!;
    }

    const args = [vrfCoordinatorAddress, networkConfig[network.config.chainId!].keyHash, subcriptionId, networkConfig[network.config.chainId!].callBackGasLimit,
    networkConfig[network.config.chainId!].NFTName, networkConfig[network.config.chainId!].NFTSymbol, networkConfig[network.config.chainId!].mintFee, 
    tokenURIs ]

    log("Deploying..");

    const randomNFT = await deploy("RandomNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.config.chainId!].waitBlockConfirmations || 1
    });


    if(network.config.chainId == 31337) {
        await vrfCoordinatorMock.addConsumer(subcriptionId, randomNFT.address);
    }
    
    log("RandomNFT Contract Deployed successfully");

    if(!deploymentChains.includes(network.name) && process.env.ETHERSCAN_APIKEY) {
        log("Verifying..");
        verify(randomNFT.address, args);
        log("Verified");
    }
}

export default deployRandomNFT;
deployRandomNFT.tags = ["all", "randomNFT"]
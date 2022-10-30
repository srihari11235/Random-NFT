import { ethers } from "hardhat";

export const BLOCK_CONFIRMATION = 6;
export const deploymentChains = ["hardhat", "localhost"];
//VRF Mock
export const BASE_FEE = ethers.utils.parseEther("0.25");
export const GAS_PRICE_LINK = ethers.utils.parseEther("0.000000001");
export const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("5");

//TBD: better approach is to read the files directly from folder and get filenames
export const imageInfo = [ 
        {            
            name: "Pug",
            desciption: "Cute Pug",
            fileName: "pug.png"
        }, 
        {
            name: "Shiba Inu",
            desciption: "Shiba Inu Dog",
            fileName: "shibainu.png"
        }, 
        {
            name: "St. Bernard",
            desciption: "St. Bernard Cute Dog",
            fileName: "stbernard.png"
        }
    ];

interface INetworkConfig {
    NFTName: string,
    NFTSymbol: string,
    mintFee: string,
    keyHash?: string,
    subscriptionId?: string,
    callBackGasLimit?: string,
    keepersUpdateInterval?: string,
    vrfCoordinator?: string,
    waitBlockConfirmations: number
}

interface IChainConfig {
    [key: number] : INetworkConfig
}

export const networkConfig : IChainConfig = {
    31337: {
        NFTName: "RandomDogs",
        NFTSymbol: "RDog",
        mintFee: ethers.utils.parseEther("0.001").toString(),
        waitBlockConfirmations: 1,
        vrfCoordinator: "",
        keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // keeping this as its throwing error when kept empty during deployment
        callBackGasLimit: "500000", // keeping this as its throwing error when kept empty during deployment
        subscriptionId: ""
    },
    5: {
        NFTName: "RandomDogs",
        NFTSymbol: "RDog",
        mintFee: ethers.utils.parseEther("0.001").toString(),
        waitBlockConfirmations: 3,
        vrfCoordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callBackGasLimit: "500000",
        subscriptionId: "1254"
    }
}
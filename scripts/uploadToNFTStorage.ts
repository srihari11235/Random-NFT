import { imageInfo } from "../helper-hardhat.config";
// The 'mime' npm package helps us set the correct file type on our File objects
import mime from 'mime'
// The 'fs' builtin module on Node.js provides access to the file system
import fs from 'fs'
// The 'path' module provides helpers for manipulating filesystem paths
import path from 'path'
import { NFTStorage, File } from "nft.storage";
import { Token } from "nft.storage/src/token";

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_APIKEY!;

async function fileFromPath(filePath) {
    const content = await fs.promises.readFile(filePath)
    const type = mime.getType(filePath)
    return new File([content], path.basename(filePath), { type })
}


const uploadToNFTStorage = async () => {

    console.log("Uploading images to NFT Storage..")
    let nftStorageResponse: Token<{
        image: globalThis.File;
        name: string;
        description: string;
    }>[] = [];

    for(let i=0; i < imageInfo.length; i++) 
    {
        const image = await fileFromPath(`images/${imageInfo[i].fileName}`);
        // create a new NFTStorage client using our API key
        const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

        console.log(`Uploading image ${imageInfo[i].fileName}...`);
        // call client.store, passing in the image & metadata
        const storageInfo = await nftstorage.store({
            image,
            name: imageInfo[i].name,
            description: imageInfo[i].desciption
        })   

        nftStorageResponse.push(storageInfo);
    }

    console.log("Upload complete");

    nftStorageResponse.forEach(image => {
        console.log(image.url);
    })
    return nftStorageResponse;
}

//To run script separatly. Better option is to use Tags to run this script only
// uploadToNFTStorage();


export default uploadToNFTStorage;
uploadToNFTStorage.tags = ["all", "nftstorage"]
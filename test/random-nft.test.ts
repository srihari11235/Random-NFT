import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { networkConfig } from "../helper-hardhat.config";

describe("Random NFT Unit Tests", async function() {
    let randomNFT;
    let deployer;
    let vrfCoordinatorV2Mock;

    this.beforeEach("", async function(){
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);

        randomNFT = await ethers.getContract("RandomNft", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);        
    })

    describe("constructor", async function(){
        it("initialises all the required params", async function() {
            const tokenId = await randomNFT.getTokenCounter();
            const mintFee = await randomNFT.getMintFee();

            assert.equal(tokenId, 0);
            assert.equal(mintFee, networkConfig[network.config.chainId!].mintFee);            
        })

    })

    describe("requestNft", () => {
        it("fails if payment isn't sent with the request", async function () {
            await expect(randomNFT.requestNFT()).to.be.revertedWithCustomError(randomNFT,
                "RandomNFT__NotEnoughETHSent"
            )
        })
        it("reverts if payment amount is less than the mint fee", async function () {
            const fee = await randomNFT.getMintFee()
            await expect(
                randomNFT.requestNFT({
                    value: fee.sub(ethers.utils.parseEther("0.001")),
                })
            ).to.be.revertedWithCustomError(randomNFT, "RandomNFT__NotEnoughETHSent")
        })
        it("emits an event and kicks off a random word request", async function () {
            const fee = await randomNFT.getMintFee()
            await expect(randomNFT.requestNFT({ value: fee.toString() })).to.emit(
                randomNFT,
                "NFTRequested"
            )
        })
    })
    describe("fulfillRandomWords", () => {
        // it("mints NFT after random number is returned", async function () {
        //     await new Promise<void>(async (resolve, reject) => {
        //         randomNFT.once("NFTMinted", async () => {
        //             try {
        //                 const tokenUri = await randomNFT.tokenURI("0")
        //                 const tokenCounter = await randomNFT.getTokenCounter()
        //                 assert.equal(tokenUri.toString().includes("ipfs://"), true)
        //                 assert.equal(tokenCounter.toString(), "1");
        //                 resolve();
        //             } catch (e) {
        //                 console.log(e)
        //                 reject(e)
        //             }
        //         })
        //         try {
        //             const fee = await randomNFT.getMintFee()
        //             const tokenId = await randomNFT.getTokenCounter();
        //             const requestNftResponse = await randomNFT.requestNFT({
        //                 value: fee.toString(),
        //             })
        //             const requestNftReceipt = await requestNftResponse.wait(1)
        //             const tx = await vrfCoordinatorV2Mock.fulfillRandomWords(
        //                 requestNftReceipt.events[1].args.requestId,
        //                 randomNFT.address
        //             )

        //             const receipt = await tx.wait(1)

        //             // const newTokenId = await randomNFT.getTokenCounter();
        //             // assert.equal(newTokenId.toString(), tokenId.add(1).toString());
        //         } catch (e) {
        //             console.log(e)
        //             reject(e)
        //         }
        //     })
        // })
    })
    describe("getBreedFromModdedRng", () => {
        it("should return pug if moddedRng < 10", async function () {
            const expectedValue = await randomNFT.getBreedFromModdedRng(7)
            assert.equal(0, expectedValue)
        })
        it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
            const expectedValue = await randomNFT.getBreedFromModdedRng(21)
            assert.equal(1, expectedValue)
        })
        it("should return st. bernard if moddedRng is between 40 - 99", async function () {
            const expectedValue = await randomNFT.getBreedFromModdedRng(77)
            assert.equal(2, expectedValue)
        })
        it("should revert if moddedRng > 99", async function () {
            await expect(randomNFT.getBreedFromModdedRng(100)).to.be.revertedWithCustomError(randomNFT,
                "RandomNft___RangeOutOfBounds"
            )
        })
    })
})
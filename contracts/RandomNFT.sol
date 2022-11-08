//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomNFT__NotEnoughETHSent();
error RandomNft___RangeOutOfBounds();
error RandomNft_TranseferFailed();

contract RandomNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {

    enum Breed{
        PUG,
        ShibaInu,
        StBernard
    }

    //VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subId;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    //Events
    event NFTRequested(uint256 indexed requestId, address requester);
    event NFTMinted(Breed dogBreed, address minter);

    //NFT variables
    mapping(uint256 => address) private vrfMapping;
    uint256 private constant MAX_CHANCE_VALUE = 100;
    string[] internal i_tokenURIs;
    uint256 private immutable i_mint_fee; 
    uint256 private tokenId;

    constructor(
        address vrfCoordinatorAddress,
        bytes32 keyHash,
        uint64 subId,
        uint32 callbackGasLimit,
        string memory name, 
        string memory symbol,
        uint256 mintFee,
        string[] memory tokenURIs
        ) VRFConsumerBaseV2(vrfCoordinatorAddress) ERC721(name, symbol) Ownable() {         
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorAddress);
        i_keyHash = keyHash;
        i_subId = subId;
        i_callbackGasLimit = callbackGasLimit;
        i_mint_fee = mintFee;
        i_tokenURIs = tokenURIs;
        tokenId = 0;
    }

    function requestNFT() public payable {
        if(msg.value < i_mint_fee ) {
            revert RandomNFT__NotEnoughETHSent();
        } 

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        /**
         * We need to store the senders address since fullfil random words in called my Chainlink contract. 
         * if we use msg.sender directly in fulfillRandomWords, msg.sender will have the address of the chainlink contract and not the one who requested the NFT.
         */
        vrfMapping[requestId] = msg.sender;
        emit NFTRequested(requestId, msg.sender);
    }

    /**
     * fulfillRandomWords function is called by chainlink contracts when we erquest for random words
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address requester = vrfMapping[requestId];
        tokenId = tokenId + 1;
        uint256 newTokenId = tokenId;
        
        uint256 moddedRng = randomWords[0] * MAX_CHANCE_VALUE;
        
        //Get the breed of the Dog based on rarity from the modded random word.         
        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        
        //mint the token i.e record the tokenId and the address of the person requesting to mint 
        _safeMint(requester, newTokenId);

        //map the tokenURI to the tokenId, open zeppelin extension has an implementation of the already ('_setTokenURI')
        _setTokenURI(newTokenId, i_tokenURIs[uint256(dogBreed)]);

        emit NFTMinted(dogBreed, requester);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        
        if(!success) {
            revert RandomNft_TranseferFailed();
        }
    }



    function getBreedFromModdedRng(uint256 moddedRng) public pure returns(Breed) {
        uint256 commulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for(uint i=0; i < chanceArray.length; i++){
            if(moddedRng >= commulativeSum && moddedRng < chanceArray[i]) {
                return Breed(i);
            }

            commulativeSum += chanceArray[i];
        }

        revert RandomNft___RangeOutOfBounds();
    }

    /**
     * This change array is used to define the rarity of the breed. 
     * 0 index having 10 percent chance - rarest
     * 1 index having 20 percent chance - less common
     * 3 index having 60 percent chance - very common
     *  */ 
    function getChanceArray() public pure returns(uint256[3] memory) {
        return [10, 40, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns(uint256) {
        return i_mint_fee;        
    }

    function getDogTokenURI(uint256 index) public view returns(string memory) {
        return i_tokenURIs[index];
    }

    function getTokenCounter() public view returns(uint256) {
        return tokenId;
    }
}
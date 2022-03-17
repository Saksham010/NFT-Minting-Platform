// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage,Ownable{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    constructor() ERC721("Saksham","SNFT"){}

    function mintNFT(address recipient, string memory tokenURI)public onlyOwner returns(uint256){
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();

        _mint(recipient,newItemId);
        _setTokenURI(newItemId,tokenURI);

        return newItemId;
    }


}


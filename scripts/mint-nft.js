require("dotenv").config();
const API_URL = process.env.API_URL;

const PUBLIC_KEY = "TOBEDEFINED BY HANDLEER OF METAMASK";
const {createAlchemyWeb3} = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);

const contract = require("../artifacts/contracts/MyNFT.sol/MyNFT.json");

console.log(JSON.stringify(contract.abi));

const contractAddress = "0xec80c98011FEfe4b62857888BF469309117DA873"
const nftContract = new web3.eth.Contract(contract.abi, contractAddress);


async function mintNFT(final_URI){

    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest"); 

    const tx = {
        from: PUBLIC_KEY,
        to: contractAddress,
        nonce: nonce,
        gas: 500000,
        data: nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI(),
    };

    await ethereum.request({
        method:'eth_sign',
        tx,
    }).then((signed_tx)=>{
        web3.eth.sendSignedTransaction(signed_tx.rawTransaction,function(err,hash){
            if(!err){
                console.log("The hash of your transaction is: ",hash);
                
            }
            else{
                console.log("Transaction failed");
            }
        });

    }).catch((error)=>{
        console.log("User did not sign the transaction");
    });
      
      

        
}
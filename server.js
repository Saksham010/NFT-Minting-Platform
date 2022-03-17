const express = require('express');
const app = express();
const port = 3000;

const myjson = require('./metadata.json');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
let GLOBAL_URL = "test";
let GLOBAL_CALLER = "Test";
const path = require('path');


//ExpressFileUpload
const fileupload = require('express-fileupload');
app.use(fileupload());


//MINT 
require("dotenv").config();
const API_URL = process.env.API_URL;
// const PUBLIC_KEY = "0x54e864f0b5AE1F8C2B7404b04b2C7735172653F0";
const {createAlchemyWeb3} = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);
const contract = require("./artifacts/contracts/MyNFT.sol/MyNFT.json");
const contractAddress = "0xec80c98011FEfe4b62857888BF469309117DA873"
const nftContract = new web3.eth.Contract(contract.abi, contractAddress);



//Sleep function
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}
////


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/node_modules/web3.js-browser/build/web3.js',(req,res)=>{
    res.sendFile(path.join(__dirname + '/node_modules/web3.js-browser/build/web3.js'));
})

app.get('/frontend.js',(req,res)=>{
    res.sendFile(path.join(__dirname + '/frontend.js'));
})

//File upload handle
app.post('/saveImage', (req, res) => {
    const image = req.files.myFile;
    const fileName = req.files.myFile.name;
    const path = __dirname + '/Images/' + fileName
  
    image.mv(path, (error) => {
      if (error) {
        console.error(error)
      }
    })


    //IPFS UPLOAD
    console.log(contract.abi);
    
    const pinFileToIPFS = (pinataApiKey, pinataSecretApiKey) => {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

        let data = new FormData();
        data.append('file', fs.createReadStream(path));

        return axios
            .post(url, data, {
                maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey
                }
            })
            .then(function (response) {
                console.log("File Succesfully pinned");
                myjson.image = "https://gateway.pinata.cloud/ipfs/"+response.data.IpfsHash;

                const json_url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

                return axios
                    .post(json_url,myjson,{
                        headers: {
                            pinata_api_key: pinataApiKey,
                            pinata_secret_api_key: pinataSecretApiKey
                        }

                    }).then(function(final_url){
                        console.log("Json pinned successfully");

                        let final_URI = "https://gateway.pinata.cloud/ipfs/"+final_url.data.IpfsHash;

                        fs.unlinkSync(path); //Deleting image file

                        //Updating Global URL
                        GLOBAL_URL = final_URI;
                        console.log("GLOBAL URL : ",GLOBAL_URL);

                    }).catch(function(error){
                        console.log("Json pin unsuccessful");
                        // fs.unlinkSync("./Images/hello.png"); //Deleting image file
                        

                    })
            
            })
            .catch(function (error) {
                console.log("File pin unsuccessful");
                
                // fs.unlinkSync("./Images/hello.png"); //Deleting image file

            });
    };

    api = "5bc1e5190b9939ed2935";
    api_secret = "d718cf7b756caf7a2659707364762ced6b3d59d9cb6c84a06a875866eca7ecc9";

    pinFileToIPFS(api,api_secret);
    res.end("DONE");


})


app.use(express.text());
app.post('/msgSender',(req,res)=>{
    
    console.log("Received Request body : ", req.body);
    


    //CHANGING GLOABL CALLER
    GLOBAL_CALLER = req.body;
    console.log("GLOBAL_CALLER: ",GLOBAL_CALLER);
    res.send("Contract caller received");


    res.end();
})


app.get('/connect',(req,res)=>{
    const PUBLIC_KEY =GLOBAL_CALLER;

    async function getnonce(){
        const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest"); //Nonce
        return nonce;
    }

    console.log("Connect part running");
    console.log(PUBLIC_KEY);
    console.log(GLOBAL_URL);

    function Respond(){
        const Nonce = getnonce();
        const ABIdata =  nftContract.methods.mintNFT(PUBLIC_KEY,GLOBAL_URL).encodeABI();
        console.log("TESTING public key",web3.utils.isAddress(PUBLIC_KEY));
        console.log("TESTING Contract address",web3.utils.isAddress(contractAddress));
        
        const transaction = {
            from: PUBLIC_KEY,
            to: contractAddress,
            data: ABIdata

        };
        res.send(transaction);
    }
    Respond();    
})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



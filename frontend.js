document.addEventListener('DOMContentLoaded',()=>{
    const Connectbtn = document.querySelector("#connect-btn");
    const Submitbtn = document.querySelector("#submit-btn");
    let received_transaction = null;
    
    function ImageUpload(){
        
        let fd = new FormData();
        let myFile = document.querySelector("#upload").files[0];
        
        fd.append('myFile',myFile);

        fetch('/saveImage',{
            method:'POST',
            body: fd
        }).then(response =>{
            sleep(15000);
            console.log("Image succesfullly uploaded");
            Request();

        }).catch(error =>{
            console.log(error);
        })

    }


    Connectbtn.addEventListener("click",()=>{
        const acc =LoginRequest();
        console.log("acc:",acc);

        Connectbtn.removeEventListener("click",LoginRequest);
        Connectbtn.remove;
        // console.log("Running");
        acc.then((data)=>{
            console.log("ACCDATA: ",data);
            RequestPost(data);
        })
        

    });

    async function LoginRequest(){
        let accounts = await ethereum.request({method:'eth_requestAccounts'});
        let currentAccount = accounts[0];
        console.log(currentAccount);
        return currentAccount;
    }


    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
        currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }
    

    function Request(){

        const url = "http://127.0.0.1:3000/connect";

        fetch(url).then(data => {
                return data.json();
            }).then(post => {
            console.log(post);
            signTransaction(post);
            });

    }

    function RequestPost(caller){
        console.log("caller:",caller);
        const Http = new XMLHttpRequest();
        const url = "http://127.0.0.1:3000/msgSender";
        Http.open("POST",url,true);

        Http.onload = function() {//Call a function when the state changes.
            if(Http.status == 200) {
                console.log(this.responseText);
            }
        }

        Http.send(caller);
    }


    function Sendsigned(signed_text){
        const Http = new XMLHttpRequest();
        const url = "http://127.0.0.1:3000/signed";
        Http.open("POST",url,true);

        Http.onload = function() {//Call a function when the state changes.
            if(Http.status == 200) {
                console.log(this.responseText);
            }
        }

        Http.send(signed_text);
    }

    async function signTransaction(tx){
        console.log("This is TX -final check: ",tx);
                
        await ethereum
        .request({
            method: 'eth_sendTransaction',
            params:[tx],
        })
        .then((txHash) => console.log(txHash))
        .catch((error) => console.error);

    }

    Submitbtn.addEventListener("click",function(ev){
        ev.preventDefault();

        ImageUpload();
        console.log("Outside received",received_transaction);
    
    })
})


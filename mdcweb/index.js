// Source code to interact with smart contract


// web3 provider with fallback for old version
if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    try {
        // ask user for permission
        ethereum.enable()
        // user approved permission
    } catch (error) {
        // user rejected permission
        console.log('user rejected permission')
    }
  }
  else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
    // no need to ask for permission
  }
  else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }
  console.log (window.web3.currentProvider)
  
  // contractAddress and abi are setted after contract deploy
  var contractAddress = '0x2adBFc7f1E69181006bc4bb8079ee054BdF9aB8A';
  var abi = JSON.parse('[ { "inputs": [ { "internalType": "string", "name": "_documentID", "type": "string" }, { "internalType": "address", "name": "_reviewer", "type": "address" }, { "internalType": "int8", "name": "_reviewRanking", "type": "int8" } ], "name": "addReview", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_reviewer", "type": "address" } ], "name": "addReviewer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_documentId", "type": "string" }, { "internalType": "string", "name": "_authorName", "type": "string" }, { "internalType": "string", "name": "_timeStamp", "type": "string" }, { "internalType": "string", "name": "_ipfsLink", "type": "string" }, { "internalType": "string", "name": "_checksum", "type": "string" }, { "internalType": "address[]", "name": "_reviewers", "type": "address[]" } ], "name": "createDocument", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_reviewer", "type": "address" } ], "name": "removeReviewer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_logicContractAddress", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_contractAddress", "type": "address" }, { "indexed": true, "internalType": "int8", "name": "_reviewRanking", "type": "int8" } ], "name": "ContractReviewed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_documentAddress", "type": "address" }, { "indexed": true, "internalType": "string", "name": "_authorName", "type": "string" }, { "indexed": false, "internalType": "string", "name": "_authorNameString", "type": "string" } ], "name": "CreateDocument", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "_reviewer", "type": "address" } ], "name": "ReviewerAddition", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "_reviewer", "type": "address" } ], "name": "ReviewerRemoval", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "", "type": "string" } ], "name": "documentAddressMap", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "logicContract", "outputs": [ { "internalType": "contract LogicContract", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_documentIdInput", "type": "string" } ], "name": "readDocumentByID", "outputs": [ { "internalType": "string", "name": "_documentId", "type": "string" }, { "internalType": "string", "name": "_authorName", "type": "string" }, { "internalType": "string", "name": "_timeStamp", "type": "string" }, { "internalType": "string", "name": "_ipfsLink", "type": "string" }, { "internalType": "string", "name": "_checksum", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_documentID", "type": "string" }, { "internalType": "address", "name": "_reviewer", "type": "address" } ], "name": "readReview", "outputs": [ { "internalType": "int8", "name": "reviewRank", "type": "int8" } ], "stateMutability": "view", "type": "function" } ]');
  //contract instance
  contract = new web3.eth.Contract(abi, contractAddress);
  
  // Accounts
  var account;
  
  web3.eth.getAccounts(function(err, accounts) {
    if (err != null) {
      alert("Error retrieving accounts.");
      return;
    }
    if (accounts.length == 0) {
      alert("No account found! Make sure the Ethereum client is configured properly.");
      return;
    }
    account = accounts[0];
    console.log('Account: ' + account);
    web3.eth.defaultAccount = account;
  });
  
  //Create an entry for the document
  function createDocument(){
    var cmd_docid =  document.getElementById("cmd_did").value;
    var cmd_aname =  document.getElementById("cmd_aname").value;
    var cmd_tstamp =  document.getElementById("cmd_tstamp").value;
    var cmd_ipfslink =  document.getElementById("cmd_ipfslink").value;
    var cmd_checksum =  document.getElementById("cmd_checksum").value;
    var cmd_reviewers = document.getElementById("cmd_reviewers").value.toString();
    const cmd_reviewers_array  = cmd_reviewers.split(",");
    contract.methods.createDocument(cmd_docid,cmd_aname,cmd_tstamp,cmd_ipfslink,cmd_checksum,cmd_reviewers_array).send({from:account}).then(function(tx){
      console.log('The transaction output is : ', tx);
      document.getElementById('cmd_transactionRes').textContent = JSON.stringify(tx);
      alert(JSON.stringify(tx));
    })    
  }

  //Function to read the document using documentID
  function readDocument(){
    var rmd_docid =  document.getElementById("rmd_did").value;
    contract.methods.readDocumentByID(rmd_docid).call().then(function(rmd){
      document.getElementById('rmd_document').textContent = JSON.stringify(rmd);
      const responseJSON = JSON.parse(JSON.stringify(rmd));
      console.log(responseJSON._ipfsLink); 
      document.getElementById('rmd_link').href= responseJSON._ipfsLink;
      downloadDocument(responseJSON._checksum);
      
    })    
  }

  //Read the review value of a given document by the given reviewer
  function readReview(){
    var readrv_rvwaddr = document.getElementById("readrv_rvwaddr").value;
    var readrv_docid = document.getElementById("readrv_docid").value;
    contract.methods.readReview(readrv_docid,readrv_rvwaddr).call().then(function(rvw) {
      console.log('The read value for the review is : ', rvw);
      document.getElementById('readrv_transactionRes').textContent = JSON.stringify(rvw);
    })
  }

  //Add a review for the given document ID by the given reviewer
  function addReview(){
    var addrv_rvwaddr = document.getElementById("addrv_rvwaddr").value;
    var addrv_docid = document.getElementById("addrv_docid").value;
    var addrv_rvw = document.getElementById("addrv_rvw").value;
    contract.methods.addReview(addrv_docid, addrv_rvwaddr, addrv_rvw).send({from:account}).then(function(tx) {
      document.getElementById('addrv_transactionRes').textContent = JSON.stringify(tx);
      
    })
  }

  //Add an authorized reviewer to the logic contract through master document contract
  function addReviewer(){
    var addrvw_rvwaddr = document.getElementById("addrvw_rvwaddr").value;
    contract.methods.addReviewer(addrvw_rvwaddr).send({from:account}).then(function(tx) {
      document.getElementById('addrvw_transactionRes').textContent = JSON.stringify(tx);
      alert(JSON.stringify(tx));
    })
  }

  //Function to search the document using the event logs
  // Can only be used against indexed parameters
  function searchDocument(){
    var srch_input = document.getElementById("srch_input").value;
    var srch_output = [];
    const radioButtons = document.querySelectorAll('input[name="srch_input"]');
    var srch_param = 'test';
    for(const radioButton of radioButtons ){
      if(radioButton.checked){
        srch_param = radioButton.value;
        break;
      }
    }
    if(srch_param=="ownername"){
      contract.getPastEvents('CreateDocument', {

        //Use filter for non string event parameters
        //filter:{_authorName : Web3.utils.sha3(srch_input)},

        //Use topics for string event parameters
        topics : [,,Web3.utils.sha3(srch_input)],
        fromBlock: 0,
        toBlock: 'latest'
      }).then (function(eventDetails){
                eventDetails.forEach((eventDetail)=>{
                  //console.log(eventDetail);
                  srch_output.push(eventDetail.returnValues._documentAddress);
          });
          document.getElementById('srch_Result').textContent =srch_output;
      });  
    }else if(srch_param == 'reviewrank'){
      var reviewRankCriteria = Array.from({length:srch_input},(_,i)=>i+1);
      contract.getPastEvents('ContractReviewed', {
        filter:{_reviewRanking : reviewRankCriteria},
        fromBlock: 0,
        toBlock: 'latest'
      }).then (function(eventDetails){
                eventDetails.forEach((eventDetail)=>{
                  //console.log(eventDetail);
                  srch_output.push(eventDetail.returnValues._contractAddress);
          });
          document.getElementById('srch_Result').textContent =srch_output;
      });  
    }
  }







  /***********************IPFS Related methods ****************************/
  //Function to upload the file to IPFS network
  function uploadDocument(){

    //Infura API for client side access.
    const IPFS= IpfsHttpClient.create("https://ipfs.infura.io:5001");

    //IPFS upload using local IPFS deamon. To be used after changing the application to server side and having a IPFS deamon in the server.
    // const IPFS = IpfsHttpClient.create({protocol:'http',
    //                                     host:'localhost',
    //                                     port:'5001',
    //                                     path:'api/v0'});
    const fileInput = document.getElementById('cmd_file').files[0];
    var fileReader= new FileReader();

    //Read the data as base64 encoded string using readDataURL()
    fileReader.readAsDataURL(fileInput);
    var ipfsData = {};
    ipfsData["fileName"]=(document.getElementById("cmd_did").value);
    ipfsData["author"]=(document.getElementById("cmd_aname").value);
    fileReader.onload = function() {
      ipfsData["fileContent"]=(fileReader.result);     
      console.log(JSON.stringify(ipfsData));
      IPFS.add({path:fileInput.name,content:JSON.stringify(ipfsData)}).then((addResult)=>{
        document.getElementById("cmd_ipfslink").value = 'https://ipfs.io/ipfs/'+addResult.cid.toString();
        document.getElementById("cmd_checksum").value = addResult.cid.toString();
      })
    };

}

async function  downloadDocument(CID){
 var docContent = await getDocument(CID);
 var docContentJSON = JSON.parse(docContent);
 reverseDocument(docContentJSON.fileContent,docContentJSON.fileName);

}

async function getDocument(CID){

  //Infura API for client side access.
  const IPFS= IpfsHttpClient.create("https://ipfs.infura.io:5001");
  var stringBuffer='';
  for await(const chunkData of IPFS.cat(CID))
  { 
      var u8arr = (chunkData.toString().split(','));
      while(u8arr.length>0){
        const sliceChunk = u8arr.splice(0,65536);
        stringBuffer+=(String.fromCharCode.apply(String,sliceChunk));
      }
  }
  return (stringBuffer);
}

//Function to decode the base64 encoded string back to file
function reverseDocument(dataURL,fileName){
  var arr = dataURL.split(','),mime = arr[0].match(/:(.*?);/)[1],
  bstr = window.atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  } 

  const blob = new Blob([u8arr],{type: mime});
  if(window.navigator.msSaveOrOpenBlob){
    window.navigator.msSaveBlob(blob,fileName);
  }else{
    const elem = window.document.createElement('a');
    var url  = window.URL.createObjectURL(blob);
    elem.href = url;
    elem.download = fileName;        
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
    window.URL.revokeObjectURL(url);
  }
}

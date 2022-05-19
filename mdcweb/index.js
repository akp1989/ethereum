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
  

  function readDocument(){
    var rmd_docid =  document.getElementById("rmd_did").value;
    contract.methods.readDocumentByID(rmd_docid).call().then(function(rmd){
      document.getElementById('rmd_document').textContent = JSON.stringify(rmd);
      const responseJSON = JSON.parse(JSON.stringify(rmd));
      console.log(responseJSON._ipfsLink); 
      document.getElementById('rmd_link').href= responseJSON._ipfsLink;
      
    })    
  }

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

  function readReview(){
    var readrv_rvwaddr = document.getElementById("readrv_rvwaddr").value;
    var readrv_docid = document.getElementById("readrv_docid").value;
    contract.methods.readReview(readrv_docid,readrv_rvwaddr).call().then(function(rvw) {
      console.log('The read value for the review is : ', rvw);
      document.getElementById('readrv_transactionRes').textContent = JSON.stringify(rvw);
    })
  }
  function addReview(){
    var addrv_rvwaddr = document.getElementById("addrv_rvwaddr").value;
    var addrv_docid = document.getElementById("addrv_docid").value;
    var addrv_rvw = document.getElementById("addrv_rvw").value;
    contract.methods.addReview(addrv_docid, addrv_rvwaddr, addrv_rvw).send({from:account}).then(function(tx) {
      document.getElementById('addrv_transactionRes').textContent = JSON.stringify(tx);
      
    })
  }

  function addReviewer(){
    var addrvw_rvwaddr = document.getElementById("addrvw_rvwaddr").value;
    contract.methods.addReviewer(addrvw_rvwaddr).send({from:account}).then(function(tx) {
      document.getElementById('addrvw_transactionRes').textContent = JSON.stringify(tx);
      alert(JSON.stringify(tx));
    })
  }

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
        //filter:{_authorName : Web3.utils.sha3(srch_input)},
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

  function uploadDocument(){
    const IPFS= IpfsHttpClient.create("https://ipfs.infura.io:5001");
    // const IPFS = IpfsHttpClient.create({protocol:'http',
    //                                     host:'localhost',
    //                                     port:'5001',
    //                                     path:'api/v0'});
    const fileInput = document.getElementById('cmd_file').files[0];
    var fileReader= new FileReader();
    fileReader.readAsText(fileInput);
    fileReader.onload = function() {
  
      IPFS.add({path:fileInput.name,content:fileReader.result}).then((addResult)=>{
        console.log(addResult);
        document.getElementById("cmd_ipfslink").value = 'https://ipfs.io/ipfs/'+addResult.cid.toString();
        document.getElementById("cmd_checksum").value = addResult.cid.toString();
      })

  };
}

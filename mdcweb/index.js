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
  var contractAddress = '0x2edb23D7f4801909F1155eF7F948bf5B2198CD15';
  var abi = JSON.parse('[ { "inputs": [ { "internalType": "address", "name": "_logicContractAddress", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "contractAddress", "type": "address" }, { "indexed": false, "internalType": "address", "name": "reviewer", "type": "address" } ], "name": "ContractReviewed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "string", "name": "_documentId", "type": "string" } ], "name": "CreateDocument", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "reviewer", "type": "address" } ], "name": "ReviewerAddition", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "reviewer", "type": "address" } ], "name": "ReviewerRemoval", "type": "event" }, { "inputs": [ { "internalType": "string", "name": "_documentID", "type": "string" }, { "internalType": "address", "name": "_reviewer", "type": "address" }, { "internalType": "int8", "name": "_reviewRanking", "type": "int8" } ], "name": "addReview", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_reviewer", "type": "address" } ], "name": "addReviewer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_documentId", "type": "string" }, { "internalType": "string", "name": "_authorName", "type": "string" }, { "internalType": "string", "name": "_timeStamp", "type": "string" }, { "internalType": "string", "name": "_ipfsLink", "type": "string" }, { "internalType": "string", "name": "_checksum", "type": "string" }, { "internalType": "address[]", "name": "_reviewers", "type": "address[]" } ], "name": "createDocument", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "", "type": "string" } ], "name": "documentAddressMap", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "logicContract", "outputs": [ { "internalType": "contract LogicContract", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_documentIdInput", "type": "string" } ], "name": "readDocumentByID", "outputs": [ { "internalType": "string", "name": "_documentId", "type": "string" }, { "internalType": "string", "name": "_authorName", "type": "string" }, { "internalType": "string", "name": "_timeStamp", "type": "string" }, { "internalType": "string", "name": "_ipfsLink", "type": "string" }, { "internalType": "string", "name": "_checksum", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_documentID", "type": "string" }, { "internalType": "address", "name": "_reviewer", "type": "address" } ], "name": "readReview", "outputs": [ { "internalType": "int8", "name": "reviewRank", "type": "int8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_reviewer", "type": "address" } ], "name": "removeReviewer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]');
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
      console.log('The read value for the document : ', rmd);
      document.getElementById('rmd_document').textContent = JSON.stringify(rmd);
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
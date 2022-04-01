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
  var contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
  var abi = JSON.parse('[ { "inputs": [ { "internalType": "address", "name": "_documentAddress", "type": "address" }, { "internalType": "address", "name": "_reviewer", "type": "address" }, { "internalType": "int8", "name": "_reviewRank", "type": "int8" } ], "name": "addReview", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_reviewer", "type": "address" } ], "name": "addReviewer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_documentAddress", "type": "address" }, { "internalType": "string", "name": "_authorName", "type": "string" }, { "internalType": "string", "name": "_timeStamp", "type": "string" }, { "internalType": "string", "name": "_ipfsLink", "type": "string" }, { "internalType": "string", "name": "_checksum", "type": "string" }, { "internalType": "address[]", "name": "_reviewers", "type": "address[]" } ], "name": "createDocument", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address[]", "name": "_reviewers", "type": "address[]" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "documentAddress", "type": "address" }, { "indexed": false, "internalType": "address", "name": "reviewer", "type": "address" } ], "name": "ContractReviewed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "documentAddress", "type": "address" } ], "name": "CreateDocument", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "_reviewer", "type": "address" } ], "name": "removeReviewer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "reviewer", "type": "address" } ], "name": "ReviewerAddition", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "reviewer", "type": "address" } ], "name": "ReviewerRemoval", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "contractMap", "outputs": [ { "internalType": "string", "name": "authorName", "type": "string" }, { "internalType": "string", "name": "timeStamp", "type": "string" }, { "internalType": "string", "name": "ipfsLink", "type": "string" }, { "internalType": "string", "name": "checkSum", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "isReviewer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_documentAddress", "type": "address" } ], "name": "readDocument", "outputs": [ { "components": [ { "internalType": "string", "name": "authorName", "type": "string" }, { "internalType": "string", "name": "timeStamp", "type": "string" }, { "internalType": "string", "name": "ipfsLink", "type": "string" }, { "internalType": "string", "name": "checkSum", "type": "string" }, { "internalType": "address[]", "name": "reviewersAssigned", "type": "address[]" } ], "internalType": "struct LogicContract.ContractDetails", "name": "contractDetails", "type": "tuple" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" } ], "name": "reviewerRanking", "outputs": [ { "internalType": "int8", "name": "", "type": "int8" } ], "stateMutability": "view", "type": "function" } ]');
  
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
    var rmd_address =  document.getElementById("rmd_daddress").value;
    contract.methods.readDocument(rmd_address).call().then(function(rmd){
      console.log('The read value for the document : ', rmd);
      document.getElementById('rmd_document').textContent = rmd;
    })    
  }

  function createDocument(){
    var cmd_address =  document.getElementById("cmd_daddress").value;
    var cmd_aname =  document.getElementById("cmd_aname").value;
    var cmd_tstamp =  document.getElementById("cmd_tstamp").value;
    var cmd_ipfslink =  document.getElementById("cmd_ipfslink").value;
    var cmd_checksum =  document.getElementById("cmd_checksum").value;
    var cmd_reviewers = document.getElementById("cmd_reviewers").value.toString();
    const cmd_reviewers_array  = cmd_reviewers.split(",");
    contract.methods.createDocument(cmd_address,cmd_aname,cmd_tstamp,cmd_ipfslink,cmd_checksum,cmd_reviewers_array).send({from:account}).then(function(tx){
      console.log('The transaction output is : ', tx);
      document.getElementById('cmd_transactionRes').textContent = JSON.stringify(tx);
      alert(JSON.stringify(tx));
    })    
  }
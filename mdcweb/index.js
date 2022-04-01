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
  var abi = JSON.parse('[ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]');
  
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
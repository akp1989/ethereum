pragma solidity >=0.4.22 <0.9.0;

//import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol"; 
import "./ERC20Int.sol";
 
contract Multisign{
    uint constant public MAX_OWNER_COUNT = 10;  
    
    //ERC20 public ercToken;
    ERC20Int public ercToken;
    address private _owner;

    /***********Events**********************/
    event Submission(uint indexed transactionId);
    event Confirmation(address indexed sender, uint indexed transactionId);
    event Revocation(address indexed sender, uint indexed transactionId);
    event Execution(uint indexed transactionId);
    event ExecutionFailure(uint indexed transactionId);
    
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    
    event RequirementChange(uint required);
    event Deposit(address indexed sender, uint value);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


    /*******************Transaction structure**************/
    struct Transaction {
        address token;
        address to;
        uint256 value;
        //bytes data;
        bool executed;
    }

    /******************* Map storage***************************/
    mapping (uint => Transaction) public transactions;
    mapping (address => bool) public isOwner;
    // Map of (transactionID => (sender => status of confirmation))
    mapping (uint => mapping (address => bool)) public confirmations;
    
    mapping (bytes32 => address) public tokenList;
    
    address[] public owners;
    
    uint public required;
    uint public transactionCount;


    /***************************Modifiers*********************/
    // Check if the sender is the owner
    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    //Check if the address is not a zero address
    modifier notNull(address _address) {
        require(_address != address(0));
        _;
    }

    /* Modifiers acting on the isOwner state variable */
    //Check if the owner does/not exist
    modifier ownerExists(address owner) {
        require(isOwner[owner]);
        _;
    }
    modifier ownerDoesNotExist(address owner) {
        require(!isOwner[owner]);
        _;
    }

    /* Modifiers acting on the transactions state variable */
    // Check if the transaction destination is not zero address
    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].to != address(0));
        //require(transactions[transactionId].token != address(0));
        _;
    }
    //Check if the transaction status is not executed
    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed);
        _;
    }
    
    /* Modifiers acting on the confirmations state variable */
    // Check if the transaction by the given owner is confirmed (true) or not (false)
    modifier confirmed(uint transactionId, address owner) {
        require(confirmations[transactionId][owner]);
        _;
    }
    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner]);
        _;
    }

    // Modifier to check 
    // If  * ownerCount, requiredCount is not zero
    //     * required count does not exceed ownerCount
    //     * ownnerCount does not exceed MAX_OWNER_COUNT
    modifier validRequirement(uint ownerCount, uint _required) {
        require(ownerCount <= MAX_OWNER_COUNT && _required <= ownerCount && ownerCount != 0  && _required != 0);
        _;
    }

    /*********** Fallback receive ether function *****************/ 
    receive() external payable{
        if (msg.value > 0)
            emit Deposit(msg.sender, msg.value);
    }
        
    
    /******************************************Constructor***************************************/
    constructor(address[] memory _owners, uint _required) validRequirement(_owners.length, _required)
    {
        transferOwnership(msg.sender);
        //populate the isOwner mapping with the address from the array of owners
        for (uint i=0; i<_owners.length; i++) {
            require(!isOwner[_owners[i]] && _owners[i] != address(0));
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        required = _required;
        tokenList[bytes32("ETH")] = 0xC8cef56818734664C37e6fc4da12dCfe35aDf01b;
    }

    function transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // Add Token
    function addNewToken(bytes32 symbol, address tokenAddress) public notNull(tokenAddress) onlyOwner returns (bool) {
        tokenList[symbol] = tokenAddress;
        return true;
    }

    // Remove Token
    function removeToken(bytes32 symbol) public onlyOwner returns (bool) {
        delete(tokenList[symbol]);
        return true;
    }

    /**********************Start - Wallet and owner related methods********************** */
    // Adds a new owner (transaction to be sent by wallet)
    function addOwner(address owner) public onlyOwner ownerDoesNotExist(owner) notNull(owner) validRequirement(owners.length + 1, required)
    {
        isOwner[owner] = true;
        owners.push(owner);
        emit OwnerAddition(owner);
    }
    
    // Remove an existing owner (transaction to be sent by wallet)
    function removeOwner(address owner) public onlyOwner ownerExists(owner)
    {
        isOwner[owner] = false;

        //Replace the given owner index with the owner from the last position of the owner array
        //Reduce the owner array length by 1
        for (uint i=0; i<owners.length - 1; i++)
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        owners.pop();
  
        // If the required count exceeds the number of owners then reduce the required count to owner count
        if (required > owners.length)
            changeRequirement(owners.length);
        emit OwnerRemoval(owner);
    }

    /// @dev Allows to replace an owner with a new owner. Transaction has to be sent by wallet.
     function replaceOwner(address owner, address newOwner)  public  onlyOwner  ownerExists(owner)  ownerDoesNotExist(newOwner)
    {
        for (uint i=0; i<owners.length; i++)
            if (owners[i] == owner) {
                owners[i] = newOwner;
                break;
            }
        isOwner[owner] = false;
        isOwner[newOwner] = true;
        emit OwnerRemoval(owner);
        emit OwnerAddition(newOwner);
    }

    // Allows to change the number of required confirmations (transaction to be sent by wallet)
    function changeRequirement(uint _required) public onlyOwner validRequirement(owners.length, _required)
    {
        required = _required;
        emit RequirementChange(_required);
    }
    /**********************End - Wallet and owner related methods********************** */




    /**********************Start - Token transaction related methods********************** */

    // Allows an owner to submit and confirm a transaction.
     function submitTransaction(bytes32 symbol,address destination,uint256 value) public payable
     /***returns (uint transactionId) ***/
    {   
        uint transactionId = addTransaction(symbol, destination,value);
        confirmTransaction(transactionId);
    }

    // Allows an owner to confirm a transaction.
    function confirmTransaction(uint transactionId) public ownerExists(msg.sender)  transactionExists(transactionId) notConfirmed(transactionId, msg.sender)
    {
        confirmations[transactionId][msg.sender] = true;
        emit Confirmation(msg.sender, transactionId);
        //executeTransaction(transactionId);
    }

    // To revoke a confirmation for a transaction.
    function revokeConfirmation(uint transactionId) public ownerExists(msg.sender) confirmed(transactionId, msg.sender) notExecuted(transactionId)
    {
        confirmations[transactionId][msg.sender] = false;
        emit Revocation(msg.sender, transactionId);
    }

    // Allows anyone to execute a confirmed transaction.
    function executeTransaction(uint transactionId) public ownerExists(msg.sender)  confirmed(transactionId, msg.sender) notExecuted(transactionId)
    {   
       
        if (isConfirmedByRequired(transactionId)){
            Transaction storage txn = transactions[transactionId];
            if(txn.token == 0xC8cef56818734664C37e6fc4da12dCfe35aDf01b){
                if(txn.value>getBalance()){
                    emit ExecutionFailure(transactionId);
                    txn.executed = false;
                }else{
                    payable (txn.to).transfer(txn.value);
                    txn.executed = true;
                    emit Execution(transactionId);
                }
            }else{
                ercToken = ERC20Int(txn.token);

                if(txn.value > ercToken.balanceOf(msg.sender) && txn.value > ercToken.allowance(msg.sender, address(this))){
                    emit ExecutionFailure(transactionId);
                    txn.executed = false;
                }else{
                    ercToken.transferFrom(msg.sender, txn.to, txn.value);
                    txn.executed = true;
                    emit Execution(transactionId);
                }
            }

            
        }   
    }

    /**********************End - Token transaction related methods********************** */



    
    /********************** Internal functions*********************************************/
    // Adds a new transaction to the transaction mapping, if transaction does not exist yet.
    function addTransaction(bytes32 symbol_,address to_,uint256 value_) internal notNull(to_)  returns (uint transactionId)
    {
        transactionId = transactionCount;
        address token_ = tokenList[symbol_];

        transactions[transactionId] = Transaction({
            token:token_,
            to: to_,
            value: value_,
            executed: false
        });
        
        transactionCount += 1;
        emit Submission(transactionId);
    }

    // Returns the confirmation status of a transaction.
    function isConfirmedByRequired(uint transactionId)  internal view returns (bool confirmationStatus)
    {
        uint count = 0;
        for (uint i=0; i<owners.length; i++) {
            if (confirmations[transactionId][owners[i]])
                count += 1;
            if (count == required)
                return true;
        }
    }

    // Returns array with owner addresses, which confirmed transaction.
    function getConfirmations(uint transactionId) public view returns (address[] memory _confirmations)
     {
        address[] memory confirmationsTemp = new address[](owners.length);
        uint count = 0;
        uint i;
        for (i=0; i<owners.length; i++)
            if (confirmations[transactionId][owners[i]]) {
                confirmationsTemp[count] = owners[i];
                count += 1;
            }
        _confirmations = new address[](count);
        for (i=0; i<count; i++)
            _confirmations[i] = confirmationsTemp[i];
    }


    //Checking the ether balance of the account
    function getBalance() public view returns (uint256 balance){
        return address(this).balance;
    }

    function getBalanceAddress(address accountAdd) public view returns (uint256 balance){
        return accountAdd.balance;
    }








    /********************************Unused functions ***********************************************************
    // Returns total number of transactions after filers are applied.
    function getTransactionCount(bool pending, bool executed) public  view returns (uint count)
    {
        for (uint i=0; i<transactionCount; i++)
            if (   pending && !transactions[i].executed
                || executed && transactions[i].executed)
                count += 1;
    }

    // Returns list of transaction IDs in defined range.
    function getTransactionIds(uint from, uint to, bool pending, bool executed) public view returns (uint[] memory _transactionIds)
    {
        uint[] memory transactionIdsTemp = new uint[](transactionCount);
        uint count = 0;
        uint i;
        for (i=0; i<transactionCount; i++)
            if (   pending && !transactions[i].executed
                || executed && transactions[i].executed)
            {
                transactionIdsTemp[count] = i;
                count += 1;
            }
        _transactionIds = new uint[](to - from);
        for (i=from; i<to; i++)
            _transactionIds[i - from] = transactionIdsTemp[i];
    }

        //Managing the ERC-20 Token 
    function getBalanceToken(address tokenAddress) public returns (uint256 balance){
        ercToken = ERC20(tokenAddress);
        return ercToken.balanceOf(msg.sender);
         
    }

    function getAllowanceToken(address tokenAddress) public  returns (uint256 allowance){
        ercToken = ERC20(tokenAddress);
        return ercToken.allowance(msg.sender,address(this));
         
    }

    function approveToken(uint256 amount, address tokenAddress) public returns(bool approval){
        //(bool success, bytes memory result) =  tokenAddress.delegatecall(abi.encodeWithSignature("approve(address spender, uint256 amount)", address(this),amount));
        (bool success, bytes memory result) = tokenAddress.delegatecall(abi.encode(bytes4(keccak256("approve(address spender, uint256 amount)")),address(this),amount));
        return abi.decode(result, (bool));
    }

    *********************************************************************************/


}
const { assert, expect } = require("chai")

const Multisign = artifacts.require("./Multisign.sol")
const GenToken = artifacts.require("./GenToken.sol")

require("chai").use(require("chai-as-promised")).should()
const BigNumber = web3.utils.BN;

contract('Transaction', function(accounts)  {
    
    const [contractOwner,secondAccount,thirdAccount,fourthAccount,fifthAccount] = accounts;
  
    let multiSign;
    let genToken;
    
    
    let byte32GNRA = web3.utils.fromAscii("GNRA");
    let byte32TEST = web3.utils.fromAscii("TEST");

    before(async () => {
        genToken = await GenToken.deployed();
        multiSign = await Multisign.deployed();
        
        console.log(genToken.address);
        console.log(multiSign.address);
        
    })


    describe('Deployment Status', () => {
 
        it('deployed successfully', async () => {
        const address = await multiSign.address

        assert.notEqual(address, '')
        assert.notEqual(address, undefined)
        assert.notEqual(address, null)
        assert.notEqual(address, 0x0)
        })
    })


    describe('Adding a new token',() => {
        it('Adding the TEST token', async() =>{
            await multiSign.addNewToken(byte32GNRA,genToken.address,{from:contractOwner})
            await multiSign.addNewToken(byte32TEST,'0x60B62958f540CAcD5174327D2C498a3069f86ee6',{from:contractOwner}).should.be.fulfilled
        })
    })

    describe('Removing a token',() => {
        it('Removing the TEST token', async() =>{
            await multiSign.removeToken(byte32TEST,{from:contractOwner}).should.be.fulfilled
        })
    })


    describe('Adding a new owner', () =>{
        it('Adding the 4th account ',async() =>{
            await multiSign.addOwner(fourthAccount,{from:contractOwner}).should.be.fulfilled
        })
        it('Adding the 5th account ',async() =>{
            await multiSign.addOwner(fifthAccount,{from:contractOwner}).should.be.fulfilled
        })
    })
    describe('Removing the owner', () =>{
        it('Removing the 4th account ',async() =>{
            await multiSign.removeOwner(fourthAccount,{from:contractOwner}).should.be.fulfilled
        })
    })
    describe('Replace the owner', () =>{
        it('Replace the 5th account with the 4th account ',async() =>{
            await multiSign.replaceOwner(fifthAccount,fourthAccount,{from:contractOwner}).should.be.fulfilled
        })
    })
    

    describe('Creating a new transaction', ()=>{
        let amount = new BigNumber(500);
        it('Creating a transaction from contract owner to transfer token to fifth account',async()=>{
            await multiSign.submitTransaction(byte32GNRA,fifthAccount,amount,{from:contractOwner}).should.be.fulfilled;
             

        })
    })

    describe('Check the confirmation status for the cretaed transaction',()=>{
        let transactionId = new BigNumber(0);
        it('Checking the approvers for the created transaction',async()=>{
            console.log(await multiSign.getConfirmations(transactionId));
        })
    })

    describe('Confirm the transaction from secondAccount and check the confirmation status and the address that confirmed',()=>{
        let transactionId = new BigNumber(0);
        it('Confirming the transaction as secondAccount', async() => {
            await multiSign.confirmTransaction(transactionId,{from:secondAccount}).should.be.fulfilled;
        })

        it('Checking the approvers for the approved transaction',async()=>{
            console.log(await multiSign.getConfirmations(transactionId));
        })
    })

    describe('Execute the transaction',()=>{
        let transactionId = new BigNumber(0);
        let amount=2000;
        let balanceA,balanceE;

        it('Check the balance of the contractOwner and fifthAccount before execution', async() =>{
            balanceA = await genToken.balanceOf(contractOwner);
            balanceE = await genToken.balanceOf(fifthAccount);
            console.log("Balance of contract owner is : " + balanceA + "and balance of fifth account is" + balanceE);
        })

        it('Approving the Wallet to transact with genToken',async()=>{
             await genToken.approve(multiSign.address,amount,{from:contractOwner});
             let approvalAmount = await genToken.allowance(contractOwner,multiSign.address);
             console.log("Approved amount for transaction from " +contractOwner + " by " +multiSign.address +" is "+approvalAmount.toNumber());
        })

        it('Executing the actual transfer and check the balance of the contractOwner and fifth account'),async()=>{
            await multiSign.executeTransaction((transactionId),{from:contractOwner});
            balanceA = await genToken.balanceOf(contractOwner);
            balanceE = await genToken.balanceOf(fifthAccount);
            console.log("Balance of A is : " + balanceA + "and balance of E is" + balanceE);
            
        }
 
    })

    describe('Transferring ether to the contract',()=>{
         
       let etherAmount=2; 
       let etherBalance;

       it('Check the balance of the contract before transfer', async() =>{
             etherBalance = await multiSign.getBalance();
             console.log("Ether balance of the contract is :"+ etherBalance.toNumber());
        })
       it('Transfer ether', async() =>{
           await multiSign.sendTransaction({from:contractOwner,value:etherAmount});
             
       })

       it('Check the balance of the contract after transfer', async() =>{
            etherBalance = await multiSign.getBalance();
            console.log("Ether balance of the contract is :"+ etherBalance.toNumber());
       })

       it('Transfer ether second time', async() =>{
            await multiSign.sendTransaction({from:secondAccount,value:etherAmount});
          
        })

        it('Check the balance of the contract after second transfer', async() =>{
            etherBalance = await multiSign.getBalance();
            console.log("Ether balance of the contract is :"+ etherBalance.toNumber());
        })

        


        describe('Creating a new ether transaction', ()=>{
            let amount = new BigNumber(2);
            it('Creating a transaction from contract owner to transfer token to fifth account',async()=>{
                await multiSign.submitTransaction('0x455448',fifthAccount,amount,{from:contractOwner}).should.be.fulfilled;
   
            })
        })

        describe('Confirm the transaction from secondAccount ',()=>{
            let transactionId = new BigNumber(1);
            it('Confirming the transaction as secondAccount', async() => {
                await multiSign.confirmTransaction(transactionId,{from:secondAccount}).should.be.fulfilled;
            })

        })

        describe('Execute the ether transaction',()=>{
            let transactionId = new BigNumber(1);
            it('Executing the actual transfer and check the balance of the contractOwner and fifth account'),async()=>{
                await multiSign.executeTransaction((transactionId),{from:contractOwner});
                etherBalance = await multiSign.getBalance();
                console.log("Ether balance of the contract post transaction execution is :"+ etherBalance.toNumber());
                
            }
    
        })
 
    })
})


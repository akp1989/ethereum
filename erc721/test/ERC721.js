const { assert, expect } = require("chai")

const RunNFT = artifacts.require("./RunNFT.sol")

require("chai").use(require("chai-as-promised")).should()

contract('RunNFT', function(accounts)  {

const [contractOwner,newOwner,approvedF, approvedS, operator] = accounts;

  let runNFT
  const name = 'RunNFT';
  const symbol = 'RNFT';

  const firstTokenId = 0;
  const secondTokenId = 1;
  const nonExistentTokenId = 999;
  const thirdTokenId = 3;
  const baseURI = 'https://api.example.com/v1/runnft/'; 

  // this would attach the deployed smart contract and its methods 
  // to the `runNFT` variable before all other tests are run
  before(async () => {
    runNFT = await RunNFT.new(name,symbol,baseURI)
    await runNFT.mint(contractOwner);
    await runNFT.mint(contractOwner);
    await runNFT.approve(approvedF, firstTokenId, { from: contractOwner })
    await runNFT.setApprovalForAll(operator, true, { from: contractOwner })
  })

  // check if deployment goes smooth
  describe('Deployment Status', () => {
    // check if the smart contract is deployed 
    // by checking the address of the smart contract
    it('deployed successfully', async () => {
      const address = await runNFT.address

      assert.notEqual(address, '')
      assert.notEqual(address, undefined)
      assert.notEqual(address, null)
      assert.notEqual(address, 0x0)
    })

    // Check if the token name is RunNFT
    it('token name', async () => {      
      const message = await runNFT.name()
      assert.equal(message, 'RunNFT')
    })

    // Check if the token symbol is RNFT
    it('token symbol', async () => {
        const message = await runNFT.symbol()
        assert.equal(message, 'RNFT')
      })
  })

  describe('URI generation for the token', function () {
    
   
    it('Checking the URI for the minted tokens', async function () {
      console.log ("The baseURI of the RUNNFT token is : " +baseURI )
      const uriFirstToken = await runNFT.tokenURI(firstTokenId)
      const uriSecondToken = await runNFT.tokenURI(secondTokenId)
      expect(uriFirstToken).to.equal(baseURI.concat(firstTokenId)) 
      console.log("The URI of the first token is : " +uriFirstToken )
      expect(uriSecondToken).to.equal(baseURI.concat(secondTokenId)) 
      console.log("The URI of the second token is : " +uriSecondToken )
    });
  
    it('returns the amount of tokens owned by the second account', async function () {
      const balance = await runNFT.balanceOf(newOwner)
      console.log("The balance of second account is :"+ balance);
      expect(balance.toNumber()).to.equal(0)

    });
 
});


  describe('balanceOf', function () {
    
      it('returns the amount of tokens owned by the the contract owner', async function () {
        const balance = await runNFT.balanceOf(contractOwner)
        console.log("The balance of contract owner is :"+ balance);
        expect(balance.toNumber()).to.equal(2)
      });
    
      it('returns the amount of tokens owned by the second account', async function () {
        const balance = await runNFT.balanceOf(newOwner)
        console.log("The balance of second account is :"+ balance);
        expect(balance.toNumber()).to.equal(0)
 
      });
   
  });

  describe('ownerOf', function () {
   
    it('returns the owner of the given token ID', async function () {
        const owner = await runNFT.ownerOf(firstTokenId)
        console.log("The owner of the token ID : "+firstTokenId + " is:"+owner)
        expect(owner).to.be.equal(contractOwner)
      });
   
    it('reverts due to non existent token id', async function () {
      try{
        await runNFT.ownerOf(nonExistentTokenId)
       }catch(error){

         assert.include(error.message,"nonexistent token","Non existent ID")
         console.log( error.message)
       } 
    
    });
  });

  describe('transfers', function () {
    let tokenBalance;

    it('transfers the ownership of the given token ID to the second address from non-approved, non-operator', async function () {
      try{
        await runNFT.transferFrom(contractOwner, newOwner ,firstTokenId,{from:approvedS})
       }catch(error){
         assert.include(error.message," not owner nor approved","Non approved/operator transfer")
         console.log( error.message)
       } 
    });

    it('Checking the balance of the accounts before transfer', async function () {
      tokenBalance = await runNFT.balanceOf(contractOwner)
      console.log("The balance of owner account before transfer is :"+ tokenBalance)
      expect(tokenBalance.toNumber()).to.equal(2)
      tokenBalance = await runNFT.balanceOf(newOwner)
      console.log("The balance of second account before transfer is :"+ tokenBalance)
      expect(tokenBalance.toNumber()).to.equal(0)
    });

    it('transfers the ownership of the given token ID to the second address from approved account', async function () {  
       await runNFT.transferFrom(contractOwner, newOwner ,firstTokenId,{from:approvedF})
    });
  
    it('Checking the balance of the accounts before transfer', async function () {  
      tokenBalance = await runNFT.balanceOf(contractOwner);
      console.log("The balance of owner account post transfer is :"+ tokenBalance);
      expect(tokenBalance.toNumber()).to.equal(1)
       
      tokenBalance = await runNFT.balanceOf(newOwner);
      console.log("The balance of second account post transfer is :"+ tokenBalance);
      expect(tokenBalance.toNumber()).to.equal(1)

      let newOwnerAddress = await runNFT.ownerOf(firstTokenId)
      console.log("The owner of the " + firstTokenId + " post the transfer is : " + newOwnerAddress)
      expect(newOwnerAddress).to.equal(newOwner)
  
    });

    it('Checking the if the approval for the first token is cleared', async function () {  
      var approvedAddress = await runNFT.getApproved(firstTokenId);
      console.log("The address approve for the first token post transfer is  :"+ approvedAddress);
      expect(approvedAddress).to.equal("0x0000000000000000000000000000000000000000");
    });

  });
})

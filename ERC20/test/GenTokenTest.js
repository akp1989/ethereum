const { assert, expect } = require("chai")

const GenToken = artifacts.require("./GenToken.sol")

require("chai").use(require("chai-as-promised")).should()

contract('GenToken', function(accounts)  {

const [contractOwner,secondAccount,thirdAccount] = accounts;

  let genToken

  // this would attach the deployed smart contract and its methods 
  // to the `genToken` variable before all other tests are run
  before(async () => {
    genToken = await GenToken.deployed()
  })

  // check if deployment goes smooth
  describe('Deployment Status', () => {
    // check if the smart contract is deployed 
    // by checking the address of the smart contract
    it('deployed successfully', async () => {
      const address = await genToken.address

      assert.notEqual(address, '')
      assert.notEqual(address, undefined)
      assert.notEqual(address, null)
      assert.notEqual(address, 0x0)
    })

    // Check if the token name is GeneraToken
    it('token name', async () => {
      const message = await genToken.name()
      assert.equal(message, 'GeneraToken')
    })

    // Check if the token symbol is GNRA
    it('token symbol', async () => {
        const message = await genToken.symbol()
        assert.equal(message, 'GNRA')
      })
  })


  describe('BalanceOf',() =>{

    it("Balance of the contractOwner",async () => {
        const balance = await genToken.balanceOf(contractOwner)
        expect(balance.toNumber()).to.greaterThan(0)
    })
    it("Balance of the secondAccount",async () => {
        const balance = await genToken.balanceOf(secondAccount)
        expect(balance.toNumber()).to.equal(0)
    })
    it("Balance of the thirdAccount",async () => {
        const balance = await genToken.balanceOf(thirdAccount)
        expect(balance.toNumber()).to.equal(0)
    })
    
  })

  describe('Transfer', () => {
      it("Transfer to the secondAccount", async() => {
          await genToken.transfer(secondAccount, 100, {from:contractOwner})
          const newBalance = await genToken.balanceOf(secondAccount)
          expect(newBalance.toNumber()).to.equal(100)
      })

      it("Transfer to the thirdAccount", async() => {
        await genToken.transfer(thirdAccount, 200, {from:contractOwner})
        const newBalance = await genToken.balanceOf(thirdAccount)
        expect(newBalance.toNumber()).to.equal(200)
    })
  })

  describe('Allowance',() =>{

    it("Allowance of secondAccount",async () => {
        const allowance = await genToken.allowance(contractOwner,secondAccount)
        expect(allowance.toNumber()).to.equal(0)
    })
    it("Setting the allowance of second account",async () => {
        await genToken.approve(secondAccount,100, {from:contractOwner})
         
    })
    it("New allowance of the secondAccount",async () => {
        const allowance = await genToken.allowance(contractOwner,secondAccount)
        expect(allowance.toNumber()).to.equal(100)
    })
    
  })

  describe('TransferFrom',() =>{

 
    it("Tranferring from ownerAccount to ThirdAccount by secondAccount - More than balance",async () => {
        try{
           await genToken.transferFrom(contractOwner,thirdAccount,10001,{from:secondAccount}) 
           //assert.fail("The transaction should throw low balance error")
       }catch(error){
            assert.include(error.message,"balance","Balance low error")
            return error.message
       }
    })
    //testing for negative usecase with should - chai-as-promised
    it("Tranferring from ownerAccount to ThirdAccount by secondAccount - More than allowance",async () => {
        await genToken.transferFrom(contractOwner,thirdAccount,101,{from:secondAccount}).should.be.rejectedWith("transfer amount exceeds allowance")
    })
    
    it("Transferring from ownerAccount to ThirdAccount by secondAcount - Within balance and allowance - part1",async() => {
        await genToken.transferFrom(contractOwner,thirdAccount,51,{from:secondAccount}).should.be.fulfilled
    })
     
  })
  

})

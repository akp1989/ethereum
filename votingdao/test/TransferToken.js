const chai = require('chai')
const { assert } = chai
const { ether, constants, expectEvent, shouldFail, time, snapshot } = require('@openzeppelin/test-helpers');
const { advanceBlockTo } = require('@openzeppelin/test-helpers/src/time');
const Ethers  = require('ethers');
const config = require('./../web3js/library/config')

const ethers = new Ethers.providers.JsonRpcProvider(config.ganache.httpurl);
const BN = web3.utils.BN
const _1e18 = new BN('1000000000000000000') 
const zeroAddress = '0x0000000000000000000000000000000000000000'

chai.use(require('chai-as-promised')).should()

const Voting = artifacts.require('./StorageVote.sol')
const SubmitProposal = artifacts.require('./SubmitProposal.sol')
const SubmitVote = artifacts.require('./SubmitVote.sol')
const ProcessProposal = artifacts.require('./ProcessProposal.sol')
const TransferToken = artifacts.require('./TransferToken.sol')
const TreasuryAccount = artifacts.require('./Treasury.sol')
const Token = artifacts.require('./GenToken.sol')

const TOKEN_SUPPLY = new BN(10).pow(new BN(18)).mul(new BN(1000000000))

const initSummonerBalance = 1000

const deploymentConfig = {
    'SUMMONER': '0xD4c39eB634bEE5989cb73D1b4CEe39903B6213C2',
    'VOTING_DURATON_IN_PERIODS': 1209600,
    'PROPOSAL_DEPOSIT': 100, 
    'TOKEN_TRIBUTE' : 10,
    'PROCESSING_REWARD': 1,
    'TRANSFER_AMOUNT' : 10
  }
  
  async function advanceTime (seconds) {
    await time.increase(time.duration.seconds(seconds));
  }
  
  async function advanceTimeInPeriods (periods) {
    await advanceTime(deploymentConfig.VOTING_DURATON_IN_PERIODS)
  }

  contract('TransferToken', ([deployer, summoner, applicant1, applicant2, processor, ...otherAccounts]) => {

    let voting
    let token
    let treasury
    let treasuryAddress
    let submitProposal
    let submitVote
    let processProposal;
    let transferTokenDAO;
    let transferTokenEthers;
    var snapshotimage;

    /****************************************************************************
    * Verfication functions - Start
    ****************************************************************************/

    /******* Verify transferring DAO token ***********/
    const verifyDAOTokenTransfer = async (
        proposal,
        options
    ) => {
    

    const initialTreasuryBalance = options.initialTreasuryBalance
                                    ? options.initialTreasuryBalance
                                    : 0
    const initialReceiverBalance = options.initialReceiverBalance
                                    ? options.initialReceiverBalance
                                    : 0

    const receiverBalance = await token.balanceOf(applicant2)
    assert.equal(
        receiverBalance,
        initialReceiverBalance + (deploymentConfig.TRANSFER_AMOUNT)
    )

    const treasuryBalance = await token.balanceOf(treasuryAddress)
    assert.equal(
        treasuryBalance,
        initialTreasuryBalance +  (deploymentConfig.PROPOSAL_DEPOSIT * 2) + (deploymentConfig.TOKEN_TRIBUTE * proposal.sharesRequested * 2) - deploymentConfig.TRANSFER_AMOUNT
    )
    }

    /******* Verify transferring Ether ***********/
    const verifyEtherTransfer = async (
        proposal,
        options
    ) => {
    

    const initialTreasuryBalance = options.initialTreasuryBalance
                                    ? options.initialTreasuryBalance
                                    : 0
    const initialReceiverBalance = options.initialReceiverBalance
                                    ? options.initialReceiverBalance
                                    : 0
    var receiverBalance = await ethers.getBalance(applicant2);
    assert.equal(
        receiverBalance.toBigInt(),
        initialReceiverBalance.add(Ethers.utils.parseEther(deploymentConfig.TRANSFER_AMOUNT.toString()).toBigInt())
    )
    var treasuryBalance = await ethers.getBalance(treasuryAddress);
    assert.equal(
            treasuryBalance.toBigInt(),
            initialTreasuryBalance.sub(Ethers.utils.parseEther(deploymentConfig.TRANSFER_AMOUNT.toString()))
    )
    }

    /****************************************************************************
     * Verfication functions - End
     ****************************************************************************/

    /****************************************************************************
     * Before initialization
     ****************************************************************************/
     before('Deploy contracts', async () => {
        token = await Token.new(TOKEN_SUPPLY)
        submitProposal = await SubmitProposal.new();
        submitVote = await SubmitVote.new();
        processProposal = await ProcessProposal.new();
  
        voting = await Voting.new(
                                  summoner,
                                  deploymentConfig.VOTING_DURATON_IN_PERIODS,
                                  deploymentConfig.PROPOSAL_DEPOSIT, 
                                  deploymentConfig.TOKEN_TRIBUTE,
                                  deploymentConfig.PROCESSING_REWARD,
                                  true,
                                  token.address,
                                  submitProposal.address,
                                  submitVote.address,
                                  processProposal.address);
        treasuryAddress = await voting.treasury();
        treasury = await TreasuryAccount.at(treasuryAddress)
        
        transferTokenDAO = await TransferToken.new(deploymentConfig.TRANSFER_AMOUNT, applicant2,voting.address, treasuryAddress, token.address,{from:summoner});
        transferTokenEthers = await TransferToken.new(10, applicant2,voting.address, treasuryAddress, token.address,{from:summoner});
      })  

     /****************************************************************************
     * Before Each and After Each initialization
     ****************************************************************************/
      beforeEach(async() =>{
        snapshotimage = await snapshot()
  
        proposal1 = {
          objectiveProposal : true,
          applicant1: transferTokenDAO.address,
          sharesRequested: 1,
          details: 'Sample Proposal for transferring token',
        }

        proposal2 = {
            objectiveProposal : true,
            applicant1: transferTokenEthers.address,
            sharesRequested: 1,
            details: 'Sample Proposal for transferring Ethers',
          }
        token.transfer(summoner, initSummonerBalance, { from: deployer })
      })
  
      afterEach(async () => {
        await snapshotimage.restore()
      })


      describe('DAO Token transfer', () => {

        beforeEach(async () => {
          await token.transfer(proposal1.applicant1, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
          await token.transfer(proposal2.applicant1, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
          
          await token.approve(voting.address, (deploymentConfig.PROPOSAL_DEPOSIT * 2), { from: summoner })
          await transferTokenDAO.approve(new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)))
          await transferTokenEthers.approve(new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)))
  
          await voting.submitProposal(proposal1.objectiveProposal,
                                        [proposal1.applicant1],
                                        proposal1.sharesRequested,
                                        proposal1.details,
                                        { from: summoner }
                                        )

        

          await voting.submitVote(0, proposal1.applicant1, 1, { from: summoner });
          await advanceTimeInPeriods(0)
          await voting.processProposal(0, { from: processor })

          await voting.submitProposal(proposal2.objectiveProposal,
                                        [proposal2.applicant1],
                                        proposal2.sharesRequested,
                                        proposal2.details,
                                        { from: summoner }
                                        )
          await voting.submitVote(1, proposal2.applicant1, 1, { from: summoner });
          await advanceTimeInPeriods(0)
          await voting.processProposal(1, { from: processor })

        })
  
        it('Happy case - DAO Token transferred', async () => {
            await transferTokenDAO.transfer(0,true, {from:summoner});
            await verifyDAOTokenTransfer(proposal1,{});
        })

        it('Failed scenario - Non member calling the transfer function', async () => {
            await transferTokenDAO.transfer(0,true, {from:applicant2}).should.be.rejectedWith("TokenTransfer :: transfer,  Cannot be called by a non-member");
        })
        it('Failed scenario - Different proposal supporting transfer', async () => {
            await transferTokenDAO.transfer(1,true, {from:summoner}).should.be.rejectedWith("TokenTransfer :: transfer, The transfer is not supported by a valid proposal");
        })
        
    })


    describe('Ethers transfer', () => {

        beforeEach(async () => {
          await token.transfer(proposal1.applicant1, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
          await token.transfer(proposal2.applicant1, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
          
          await token.approve(voting.address, (deploymentConfig.PROPOSAL_DEPOSIT * 2), { from: summoner })
          
          await transferTokenDAO.approve(new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)))
          await transferTokenEthers.approve(new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)))
  
          await voting.submitProposal(proposal1.objectiveProposal,
                                        [proposal1.applicant1],
                                        proposal1.sharesRequested,
                                        proposal1.details,
                                        { from: summoner }
                                        )

        

          await voting.submitVote(0, proposal1.applicant1, 1, { from: summoner });
          await advanceTimeInPeriods(0)
          await voting.processProposal(0, { from: processor })

          await voting.submitProposal(proposal2.objectiveProposal,
                                        [proposal2.applicant1],
                                        proposal2.sharesRequested,
                                        proposal2.details,
                                        { from: summoner }
                                        )
          await voting.submitVote(1, proposal2.applicant1, 1, { from: summoner });
          await advanceTimeInPeriods(0)
          await voting.processProposal(1, { from: processor })
          await  treasury.send(Ethers.utils.parseEther('20'),{from:deployer})

        })
  
        it('Happy case - Ether transferred', async () => {
            const initialReceiverBalance = await ethers.getBalance(applicant2);
            const initialTreasuryBalance = await ethers.getBalance(treasuryAddress);
            await transferTokenEthers.transfer(1,false, {from:summoner});
            console.log(await ethers.getBalance(applicant2));
            await verifyEtherTransfer(proposal1,{initialTreasuryBalance:initialTreasuryBalance,initialReceiverBalance : initialReceiverBalance});
        })

        it('Failed scenario - Non member calling the transfer function', async () => {
            await transferTokenEthers.transfer(1,false, {from:applicant2}).should.be.rejectedWith("TokenTransfer :: transfer,  Cannot be called by a non-member");
        })
        it('Failed scenario - Different proposal supporting transfer', async () => {
            await transferTokenEthers.transfer(0,false, {from:summoner}).should.be.rejectedWith("TokenTransfer :: transfer, The transfer is not supported by a valid proposal");
        })
        
    })
})
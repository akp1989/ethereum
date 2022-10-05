const chai = require('chai')
const { assert } = chai
const { ether, constants, expectEvent, shouldFail, time, snapshot } = require('@openzeppelin/test-helpers');
const { advanceBlockTo } = require('@openzeppelin/test-helpers/src/time');

const BN = web3.utils.BN
const transferAmount = 10;

chai.use(require('chai-as-promised')).should()

const Voting = artifacts.require('./Voting.sol')
const TreasuryAccount = artifacts.require('./Treasury.sol')
const Token = artifacts.require('./GenToken.sol')
const TransferToken=artifacts.require('./TransferToken.sol')

const TOKEN_SUPPLY = new BN(10).pow(new BN(18)).mul(new BN(1000000000))

const initSummonerBalance = 1000

const deploymentConfig = {
    'SUMMONER': '0x9a8d670c323e894dda9a045372a75d607a47cb9e',
    'PERIOD_DURATION_IN_SECONDS': 120,
    'VOTING_DURATON_IN_PERIODS': 2,
    'GRACE_DURATON_IN_PERIODS': 2,
    'PROPOSAL_DEPOSIT': 100, 
    'TOKEN_TRIBUTE' : 10,
    'PROCESSING_REWARD': 1,
  }
  
  async function advanceTime (seconds) {
    await time.increase(time.duration.seconds(seconds));
  }
  
  async function advanceTimeInPeriods (periods) {
    await advanceTime(periods * deploymentConfig.PERIOD_DURATION_IN_SECONDS)
  }

 
  contract('Transfer Token', ([deployer, summoner, applicant1, applicant2, processor, ...otherAccounts]) => {

    let voting
    let token
    let treasury
    let tokenTransfer_token
    let tokenTransfer_ether
    let treasuryAddress
    var snapshotimage;

    /****************************************************************************
       * Before initialization
       ****************************************************************************/
     before('Deploy contracts', async () => {
        token = await Token.new(TOKEN_SUPPLY)
        voting = await Voting.new(
                                  summoner,
                                  deploymentConfig.PERIOD_DURATION_IN_SECONDS,
                                  deploymentConfig.VOTING_DURATON_IN_PERIODS,
                                  deploymentConfig.PROPOSAL_DEPOSIT, 
                                  deploymentConfig.TOKEN_TRIBUTE,
                                  deploymentConfig.PROCESSING_REWARD,
                                  true,
                                  token.address,)
        treasuryAddress = await voting.treasuryAccount();
        treasury = await TreasuryAccount.at(treasuryAddress)

        tokenTransfer_token = await TransferToken.new(transferAmount, applicant1, voting.address, treasury.address, token.address, {from:summoner});
        tokenTransfer_ether = await TransferToken.new(transferAmount, applicant2, voting.address, treasury.address, token.address, {from:summoner});
  
      })  
  
      /****************************************************************************
       * Before Each and After Each initialization
       ****************************************************************************/
      beforeEach(async() =>{
        snapshotimage = await snapshot()
  
        proposal1 = {
          objectiveProposal : true,
          applicant1: tokenTransfer_token.address,
          sharesRequested: 1,
          details: 'Sample Proposal for transferring daoToken',
        }
  
        proposal2 = {
          objectiveProposal : true,
          applicant1: tokenTransfer_ether.address,
          sharesRequested: 1,
          details: 'Sample Proposal for transferring ether',
        }
        
        //Transfer token to summoner
        await token.transfer(summoner, initSummonerBalance, { from: deployer })

        //Summoner approves token for voting contract to spend on proposal deposit *3 
        await token.approve(voting.address, new BN(3).mul(new BN(deploymentConfig.PROPOSAL_DEPOSIT)), { from: summoner })

        //Transfer token tribute to applicant of proposal1
        await token.transfer(proposal1.applicant1, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await tokenTransfer_token.approve(new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: summoner})
       
        //Transfer token tribute to applicant of proposal2
        await token.transfer(proposal2.applicant1, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await tokenTransfer_ether.approve(new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: summoner})

      
    })
  
    afterEach(async () => {
    await snapshotimage.restore()
    })


    describe('Transfer token - Testing transfer of daoToken', () => {
        
        beforeEach(async () => {
  
            await voting.addMember(deployer,1,{from:summoner});
            await voting.addMember(processor,1,{from:summoner});
            await treasury.send(web3.utils.toWei(new BN(transferAmount)+ new BN(1), "ether"), {from: deployer})
            await voting.submitProposal(proposal1.objectiveProposal,
                [proposal1.applicant1],
                proposal1.sharesRequested,
                proposal1.details,
                { from: summoner }
                )

                await advanceTimeInPeriods(1)

                await voting.submitVote(0, proposal1.applicant1, 1, { from: summoner });
                await voting.submitVote(0, proposal1.applicant1, 1, { from: deployer });
                await voting.submitVote(0, proposal1.applicant1, 0, { from: processor })

                await advanceTimeInPeriods(deploymentConfig.VOTING_DURATON_IN_PERIODS)
                await advanceTimeInPeriods(deploymentConfig.GRACE_DURATON_IN_PERIODS)

                await voting.processProposal(0, { from: processor })
                await voting.submitProposal(proposal2.objectiveProposal,
                    [proposal2.applicant1],
                    proposal2.sharesRequested,
                    proposal2.details,
                    { from: summoner }
                    )
                await advanceTimeInPeriods(1)
    
                await voting.submitVote(1, proposal2.applicant1, 1, { from: summoner });
                await voting.submitVote(1, proposal2.applicant1, 1, { from: deployer });
                await voting.submitVote(1, proposal2.applicant1, 0, { from: processor })
    
                await advanceTimeInPeriods(deploymentConfig.VOTING_DURATON_IN_PERIODS)
                await advanceTimeInPeriods(deploymentConfig.GRACE_DURATON_IN_PERIODS)
    
                await voting.processProposal(1, { from: processor })
    

        })
  
        it('Happy case - daoToken transferred to applicant1 ', async () => {
            

            let receiverBalance_bfr  = await token.balanceOf(applicant1);
            let treasuryBalance_bfr = await treasury.getTokenBalance();
            await tokenTransfer_token.transfer( 0,true,{from:summoner});

            let receiverBalance_aft = await token.balanceOf(applicant1);
            let treasuryBalance_aft = await treasury.getTokenBalance();
            assert.equal(Number(receiverBalance_aft.sub(receiverBalance_bfr))
                        , Number(transferAmount));
            
            assert.equal(Number(treasuryBalance_bfr.sub(treasuryBalance_aft))
                                ,Number(transferAmount));


            await tokenTransfer_token.transfer( 0,true,{from:summoner}).should.be.rejectedWith("TokenTransfer :: transfer, Transfer for the proposal already executed");
        })

        it('Fail - proposer is not a member', async () => {
            await tokenTransfer_token.transfer( 0,true,{from:applicant1}).should.be.rejectedWith("TokenTransfer :: transfer,  Cannot be called by a non-member");
        })


        it('Happy case - ether transferred to applicant2 ', async () => {

            let receiverBalance_bfr  = await web3.eth.getBalance(applicant2);
            let treasuryBalance_bfr = await web3.eth.getBalance(treasuryAddress);
            await tokenTransfer_ether.transfer( 1,false,{from:summoner});
            let receiverBalance_aft =  await web3.eth.getBalance(applicant2);
            let treasuryBalance_aft = await web3.eth.getBalance(treasuryAddress);
            
            assert.equal(Number(web3.utils.fromWei(new BN(receiverBalance_aft).sub(new BN(receiverBalance_bfr))))
                        , Number(transferAmount));
            
            assert.equal(Number(web3.utils.fromWei(new BN(treasuryBalance_bfr).sub(new BN(treasuryBalance_aft))))
            , Number(transferAmount));

            await tokenTransfer_ether.transfer( 1,false,{from:summoner}).should.be.rejectedWith("TokenTransfer :: transfer, Transfer for the proposal already executed");
        })


        it('Fail - proposaer is not a member', async () => {
            await tokenTransfer_ether.transfer( 1,false,{from:applicant2}).should.be.rejectedWith("TokenTransfer :: transfer,  Cannot be called by a non-member");
        })
  
      })


})
  
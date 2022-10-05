// const chai = require('chai')
// const { assert } = chai
// const { ether, constants, expectEvent, shouldFail, time, snapshot } = require('@openzeppelin/test-helpers');
// const { advanceBlockTo } = require('@openzeppelin/test-helpers/src/time');

// const BN = web3.utils.BN

// chai.use(require('chai-as-promised')).should()

// const Voting = artifacts.require('./Voting.sol')
// const TreasuryAccount = artifacts.require('./Treasury.sol')
// const Token = artifacts.require('./GenToken.sol')
// const VotingParams = artifacts.require('./VotingParams.sol')

// const TOKEN_SUPPLY = new BN(10).pow(new BN(18)).mul(new BN(1000000000))

// const initSummonerBalance = 1000

// const deploymentConfig = {
//     'SUMMONER': '0x9a8d670c323e894dda9a045372a75d607a47cb9e',
//     'PERIOD_DURATION_IN_SECONDS': 120,
//     'VOTING_DURATON_IN_PERIODS': 2,
//     'GRACE_DURATON_IN_PERIODS': 2,
//     'PROPOSAL_DEPOSIT': 100, 
//     'TOKEN_TRIBUTE' : 10,
//     'PROCESSING_REWARD': 1,
//   }
  
//   async function advanceTime (seconds) {
//     await time.increase(time.duration.seconds(seconds));
//   }
  
//   async function advanceTimeInPeriods (periods) {
//     await advanceTime(periods * deploymentConfig.PERIOD_DURATION_IN_SECONDS)
//   }

 
//   contract('Voting Params', ([deployer, summoner, applicant1, applicant2, processor, ...otherAccounts]) => {

//     let voting
//     let token
//     let treasury
//     let votingParam

//     var snapshotimage;

   
  
//       /****************************************************************************
//        * Before initialization
//        ****************************************************************************/
//       before('Deploy contracts', async () => {
//         token = await Token.new(TOKEN_SUPPLY)
//         voting = await Voting.new(
//                                   summoner,
//                                   deploymentConfig.PERIOD_DURATION_IN_SECONDS,
//                                   deploymentConfig.VOTING_DURATON_IN_PERIODS,
//                                   deploymentConfig.PROPOSAL_DEPOSIT, 
//                                   deploymentConfig.TOKEN_TRIBUTE,
//                                   deploymentConfig.PROCESSING_REWARD,
//                                   true,
//                                   token.address,)
//         const treasuryAddress = await voting.treasuryAccount();
//         treasury = await TreasuryAccount.at(treasuryAddress)
  
//       })  
  
//       /****************************************************************************
//        * Before Each and After Each initialization
//        ****************************************************************************/
//       beforeEach(async() =>{
//         snapshotimage = await snapshot()
  
//         proposal1 = {
//           objectiveProposal : true,
//           applicant1: applicant1,
//           sharesRequested: 1,
//           details: 'Sample Proposal for testing',
//         }
  
//         proposal2 = {
//           objectiveProposal : false,
//           applicant1: applicant1,
//           applicant2: applicant2,
//           sharesRequested: 1,
//           details: 'Sample Proposal for testing',
//         }
//         token.transfer(summoner, initSummonerBalance, { from: deployer })
//       })
  
//       afterEach(async () => {
//         await snapshotimage.restore()
//       })
  
  
//       describe('Updating Voting Parameters - Testing updateVotingParameters', () => {
        
//         var newProposalDeposit = new BN(20);
//         var newTokenTribute = new BN(10);
//         var newProcessingReward = new BN(5);
//         beforeEach(async () => {
  
//           votingParam = await VotingParams.new(newProposalDeposit, newTokenTribute, newProcessingReward,token.address);
          
//           proposal3 = {
//             objectiveProposal : true,
//             applicant1: votingParam.address,
//             sharesRequested: 1,
//             details: 'Sample Proposal for updating voting parameters',
//           }
  
//           await token.transfer(proposal3.applicant1, new BN(proposal3.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
//           await token.approve(voting.address, deploymentConfig.PROPOSAL_DEPOSIT, { from: summoner })
//           await votingParam.approve(voting.address, new BN(proposal3.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
    
//           await voting.submitProposal(proposal3.objectiveProposal,
//                                       [proposal3.applicant1],
//                                       proposal3.sharesRequested,
//                                       proposal3.details,
//                                       { from: summoner }
//                                       )
//           await voting.addMember(deployer,1,{from:summoner});
//           await voting.addMember(processor,1,{from:summoner});
  
//           await advanceTimeInPeriods(1)
  
//           await voting.submitVote(0, proposal3.applicant1, 1, { from: summoner });
//           await voting.submitVote(0, proposal3.applicant1, 1, { from: deployer });
//           await voting.submitVote(0, proposal3.applicant1, 0, { from: processor })
  
//           await advanceTimeInPeriods(deploymentConfig.VOTING_DURATON_IN_PERIODS)
//           await advanceTimeInPeriods(deploymentConfig.GRACE_DURATON_IN_PERIODS)
//           await voting.processProposal(0, { from: processor })
//         })
  
//         it('Happy case - Voting parameters updated from proposal ', async () => {
//           await voting.processVotingResult(0,0);
//           assert.equal(newTokenTribute, + await voting.tokenTribute());
//           assert.equal(newProposalDeposit, +  await voting.proposalDeposit());
//           assert.equal(newProcessingReward, +  await voting.processingReward());
//         })
        
  
//       })
  
//   })
  
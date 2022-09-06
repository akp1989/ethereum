const chai = require('chai')
const { assert } = chai
const { ether, constants, expectEvent, shouldFail, time, snapshot } = require('@openzeppelin/test-helpers');

const BN = web3.utils.BN
const _1e18 = new BN('1000000000000000000') 

chai.use(require('chai-as-promised')).should()

const Voting = artifacts.require('./Voting.sol')
const TreasuryAccount = artifacts.require('./Treasury.sol')
const Token = artifacts.require('./GenToken.sol')

const TOKEN_SUPPLY = new BN(10).pow(new BN(18)).mul(new BN(1000000000))

const initSummonerBalance = 1000

const deploymentConfig = {
    'SUMMONER': '0x9a8d670c323e894dda9a045372a75d607a47cb9e',
    'PERIOD_DURATION_IN_SECONDS': 120,
    'VOTING_DURATON_IN_PERIODS': 2,
    'GRACE_DURATON_IN_PERIODS': 2,
    'ABORT_WINDOW_IN_PERIODS': 1,
    'PROPOSAL_DEPOSIT': 100, 
    'PROCESSING_REWARD': 1,
  }
  
  async function advanceTime (seconds) {
    const timeNow = await time.latest();
    await timeNow.increase(time.duration.seconds(seconds));
  }
  
  async function advanceTimeInPeriods (periods) {
    await advanceTime(periods * PERIOD_DURATION_IN_SECONDS)
  }

 

 

  contract('Voting', ([deployer, summoner, applicant1, applicant2, processor, ...otherAccounts]) => {

    let voting
    let token
    let treasury

    var snapshotimage;


    const verifySubmitProposal = async (
      proposal,
      proposalIndex,
      proposer,
      options
    ) => {
      
      const initialTotalSharesRequested = options.initialTotalSharesRequested
        ? options.initialTotalSharesRequested
        : 0
      const initialTotalShares = options.initialTotalShares
        ? options.initialTotalShares
        : 0
      const initialProposalLength = options.initialProposalLength
        ? options.initialProposalLength
        : 0
      const initialVotingBalance = options.initialVotingBalance
        ? options.initialVotingBalance
        : 0
      const initialApplicantBalance = options.initialApplicantBalance
        ? options.initialApplicantBalance
        : 0
      const initialProposerBalance = options.initialProposerBalance
        ? options.initialProposerBalance
        : 0
  
      const expectedStartingPeriod = options.expectedStartingPeriod
        ? options.expectedStartingPeriod
        : 1
  
      const proposalData = await voting.proposalQueue.call(proposalIndex)
      assert.equal(proposalData.proposer, proposer)
      

      if (typeof proposal.sharesRequested === 'number') {
        assert.equal(proposalData.sharesRequested, proposal.sharesRequested)
      } else {
        // for testing overflow boundary with BNs
        assert(proposalData.sharesRequested.eq(proposal.sharesRequested))
      }
      
      assert.equal(proposalData.startingPeriod, expectedStartingPeriod)
      assert.equal(proposalData.processed, false)
      assert.equal(proposalData.didPass, false)
      assert.equal(proposalData.aborted, false)
      assert.equal(proposalData.tokenTribute, proposal.tokenTribute)
      assert.equal(proposalData.details, proposal.details)
      assert.equal(proposalData.maxTotalSharesAtYesVote, 0)
  
      const totalSharesRequested = await voting.totalSharesRequested()
      if (typeof proposal.sharesRequested === 'number') {
        assert.equal(
          totalSharesRequested,
          proposal.sharesRequested + initialTotalSharesRequested
        )
      } else {
        // for testing overflow boundary with BNs
        assert(
          totalSharesRequested.eq(
            proposal.sharesRequested.add(new BN(initialTotalSharesRequested))
          )
        )
      }
  
      const totalShares = await voting.totalShares()
      assert.equal(totalShares, initialTotalShares)
  
      const proposalQueueLength = await voting.getProposalQueueLength()
      assert.equal(proposalQueueLength, initialProposalLength + 1)
  
      const votingBalance = await token.balanceOf(treasury.address)
      assert.equal(
        votingBalance,
        initialVotingBalance + proposal.tokenTribute + deploymentConfig.PROPOSAL_DEPOSIT
      )
  
      const applicantBalance = await token.balanceOf(proposal.applicant)
      assert.equal(
        applicantBalance,
        initialApplicantBalance - proposal.tokenTribute
      )
  
      const proposerBalance = await token.balanceOf(proposer)
      assert.equal(
        proposerBalance,
        initialProposerBalance - deploymentConfig.PROPOSAL_DEPOSIT
      )
    }
  

    
    before('Deploy contracts', async () => {
      token = await Token.new(TOKEN_SUPPLY)
      voting = await Voting.new(
                                summoner,
                                deploymentConfig.PERIOD_DURATION_IN_SECONDS,
                                deploymentConfig.VOTING_DURATON_IN_PERIODS,
                                deploymentConfig.GRACE_DURATON_IN_PERIODS,
                                deploymentConfig.ABORT_WINDOW_IN_PERIODS,
                                deploymentConfig.PROPOSAL_DEPOSIT, 
                                deploymentConfig.PROCESSING_REWARD,
                                false,
                                token.address,)
      const treasuryAddress = await voting.treasuryAccount();
      console.log(treasuryAddress);
      treasury = await TreasuryAccount.at(treasuryAddress)

    })  
    
    beforeEach(async() =>{
      snapshotimage = await snapshot()

      proposal1 = {
        objectiveProposal : true,
        applicant: applicant1,
        tokenTribute: 10,
        sharesRequested: 1,
        details: 'Sample Proposal for testing',
      }

      proposal2 = {
        objectiveProposal : false,
        applicant: [applicant1,applicant2],
        tokenTribute: 10,
        sharesRequested: 1,
        details: 'Sample Proposal for testing',
      }
      token.transfer(summoner, initSummonerBalance, { from: deployer })
    })

    afterEach(async () => {
      await snapshotimage.restore()
    })

    it('verify deployment parameters', async () => {
      // eslint-disable-next-line no-unused-vars
      //const now = await blockTime()
      
      const daoTokenAddress = await voting.daoToken()
      assert.equal(daoTokenAddress, token.address)

      const treasuryAccountAddress = await voting.treasuryAccount()
      assert.equal(treasuryAccountAddress, treasury.address)

      const treasuryOwner = await treasury.owner()
      assert.equal(treasuryOwner, voting.address)

      const treasuryToken = await treasury.daoToken()
      assert.equal(treasuryToken, token.address)

      const periodDuration = await voting.periodDuration()
      assert.equal(+periodDuration, deploymentConfig.PERIOD_DURATION_IN_SECONDS)

      const votingPeriodLength = await voting.votingPeriodLength()
      assert.equal(+votingPeriodLength, deploymentConfig.VOTING_DURATON_IN_PERIODS)

      const gracePeriodLength = await voting.gracePeriodLength()
      assert.equal(+gracePeriodLength, deploymentConfig.GRACE_DURATON_IN_PERIODS)

      const abortWindow = await voting.abortWindow()
      assert.equal(+abortWindow, deploymentConfig.ABORT_WINDOW_IN_PERIODS)

      const proposalDeposit = await voting.proposalDeposit()
      assert.equal(+proposalDeposit, deploymentConfig.PROPOSAL_DEPOSIT)

      const processingReward = await voting.processingReward()
      assert.equal(+processingReward, deploymentConfig.PROCESSING_REWARD)

      const currentPeriod = await voting.getCurrentPeriod()
      assert.equal(+currentPeriod, 0)

      const summonerData = await voting.members(summoner)
      assert.equal(summonerData.delegateKey.toLowerCase(), summoner.toLowerCase()) // delegateKey matches
      assert.equal(summonerData.shares, 1)
      assert.equal(summonerData.exists, true)
      assert.equal(summonerData.highestIndexVote, 0)
      
      const summonerAddressByDelegateKey = await voting.memberAddressByDelegateKey(
        summoner
      )
      assert.equal(summonerAddressByDelegateKey.toLowerCase(), summoner.toLowerCase())
  
      const totalShares = await voting.totalShares()
      assert.equal(+totalShares, 1)

      const tokenSupply = await token.totalSupply()
      assert.equal(+tokenSupply.toString(), TOKEN_SUPPLY)
      
      const summonerBalance = await token.balanceOf(summoner)
      assert.equal(+summonerBalance.toString(), initSummonerBalance)
      
      const deployerBalance = await token.balanceOf(deployer)
      assert.equal(deployerBalance, TOKEN_SUPPLY - initSummonerBalance)

    })

    describe('Submit Proposal',() =>{

      beforeEach(async()=>{
        await token.transfer(proposal1.applicant, proposal1.tokenTribute, {from: deployer})
        await token.approve(voting.address, deploymentConfig.PROPOSAL_DEPOSIT, { from: summoner })
        await token.approve(voting.address, proposal1.tokenTribute, {from: proposal1.applicant})
      })

      it('Submit proposal- objective',async() =>{
        await voting.submitProposal(proposal1.objectiveProposal,
                                    [proposal1.applicant],
                                    proposal1.tokenTribute,
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    {from:summoner}
                                   )

        await verifySubmitProposal(proposal1, 0, summoner, {
          initialTotalShares: 1,
          initialApplicantBalance: proposal1.tokenTribute,
          initialProposerBalance: initSummonerBalance
        })
      })
    
    })

  })
 

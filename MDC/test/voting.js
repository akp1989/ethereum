const chai = require('chai')
const { assert } = chai
const { ether, constants, expectEvent, shouldFail, time, snapshot } = require('@openzeppelin/test-helpers');

const BN = web3.utils.BN
const _1e18 = new BN('1000000000000000000') 
const zeroAddress = '0x0000000000000000000000000000000000000000'

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
    'TOKEN_TRIBUTE' : 10,
    'PROCESSING_REWARD': 1,
  }
  
  async function advanceTime (seconds) {
    await time.increase(time.duration.seconds(seconds));
  }
  
  async function advanceTimeInPeriods (periods) {
    await advanceTime(periods * deploymentConfig.PERIOD_DURATION_IN_SECONDS)
  }

 

 

  contract('Voting', ([deployer, summoner, applicant1, applicant2, processor, ...otherAccounts]) => {

    let voting
    let token
    let treasury

    var snapshotimage;

    /****************************************************************************
     * Verfication functions - Start
     ****************************************************************************/
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
      //assert.equal(totalShares, initialTotalShares)
      assert.equal(totalShares, initialTotalShares)
      const proposalQueueLength = await voting.getProposalQueueLength()
      assert.equal(proposalQueueLength, initialProposalLength + 1)
  
      const votingBalance = await token.balanceOf(treasury.address)
      assert.equal(
        votingBalance,
        initialVotingBalance + (deploymentConfig.TOKEN_TRIBUTE * proposal.sharesRequested) + deploymentConfig.PROPOSAL_DEPOSIT
      )
      
      const applicantBalance = await token.balanceOf(proposal.applicant1)
      assert.equal(
        applicantBalance,
        initialApplicantBalance - (deploymentConfig.TOKEN_TRIBUTE * proposal.sharesRequested)
      )
  
      const proposerBalance = await token.balanceOf(proposer)
      assert.equal(
        proposerBalance,
        initialProposerBalance - deploymentConfig.PROPOSAL_DEPOSIT
      )
    }
    
    // VERIFY SUBMIT VOTE
    const verifySubmitVote = async (
      proposal,
      proposalIndex,
      options
    ) => {
      vote = options.voteCount ? options.voteCount:1
      const MemberVote = await voting.getMemberProposalVote.call(summoner, proposalIndex)

      if(options.objectiveProposal){
        if(options.yesVote){
          assert.equal(MemberVote[0][0], 1)    //Value of yes vote
          assert.equal(MemberVote[1][0], 0)    //Value of no vote
          assert.equal(MemberVote[2][0], options.applicant)    //Address of voted candidate
        }else{
          assert.equal(MemberVote[0][0], 0)    //Value of yes vote
          assert.equal(MemberVote[1][0], 1)    //Value of no vote
          assert.equal(MemberVote[2][0], options.applicant)    //Address of voted candidate
        }
        
      }else{
        const quadVote = await voting.sqrt(vote);
        assert.equal(MemberVote[0][0], vote)    //Value of vote
        assert.equal(MemberVote[1][0].toString, quadVote.toString)    //Value of quadratic vote
        assert.equal(MemberVote[2][0], options.applicant)    //Address of voted candidate
      }

    }



    // VERIFY PROCESS PROPOSAL - note: doesnt check forced reset of delegate key
  const verifyProcessProposal = async (
    proposal,
    proposalIndex,
    proposer,
    processor,
    options
  ) => {
    // eslint-disable-next-line no-unused-vars
    const totalCandidates = options.totalCandidates
                            ? options.totalCandidates
                            : 1
    const initialTotalSharesRequested = options.initialTotalSharesRequested
                                        ? options.initialTotalSharesRequested
                                        : 0
    const initialTotalShares = options.initialTotalShares
                                ? options.initialTotalShares
                                : 0
    const initialApplicantShares = options.initialApplicantShares
                                    ? options.initialApplicantShares
                                    : 0 // 0 means new member, > 0 means existing member
    const initialTreasuryBalance = options.initialTreasuryBalance
                                    ? options.initialTreasuryBalance
                                    : 0
    const initialApplicantBalance = options.initialApplicantBalance
                                    ? options.initialApplicantBalance
                                    : 0
    const initialProposerBalance = options.initialProposerBalance
                                    ? options.initialProposerBalance
                                    : 0
    const initialProcessorBalance = options.initialProcessorBalance
                                    ? options.initialProcessorBalance
                                    : 0
    const expectedFinalTotalSharesRequested = options.expectedFinalTotalSharesRequested
                                              ? options.expectedFinalTotalSharesRequested
                                              : 0
    const expectedWinner = options.expectedWinner 
                            ? options.expectedWinner
                            : zeroAddress
    const didPass = typeof options.didPass === 'boolean' ? options.didPass : true
    const aborted = typeof options.aborted === 'boolean' ? options.aborted : false
    const isApplicantProposer = typeof options.isApplicantProposer === 'boolean' ? options.isApplicantProposer : false 


 
    const proposalData = await voting.proposalQueue.call(proposalIndex)
    
    assert.equal(proposalData.processed, true)
    assert.equal(proposalData.didPass, didPass)
    assert.equal(proposalData.aborted, aborted)
   
    const totalSharesRequested = await voting.totalSharesRequested()
    assert.equal(totalSharesRequested, expectedFinalTotalSharesRequested)
 
    const totalShares = await voting.totalShares()
    const expectedTotalShares =  didPass && !aborted
                                ? new BN(initialTotalShares).add(new BN(proposalData.sharesRequested))
                                : new BN(initialTotalShares)
    assert.equal(totalShares.toString(),expectedTotalShares.toString())


    const treasuryBalance = await token.balanceOf(treasury.address)
    const expectedTreasuryBalance  = new BN(initialTreasuryBalance) 
                                      .add(new BN(proposalData.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)).mul(new BN(totalCandidates))) 
                                      .add(new BN(deploymentConfig.PROPOSAL_DEPOSIT)) 
    assert.equal(treasuryBalance.toString(),expectedTreasuryBalance.toString());
      


    // proposer and applicant are different
    if (isApplicantProposer) {
      const proposerBalance = await token.balanceOf(proposer)
      const expectedBalance = !aborted
                              ? new BN(initialProposerBalance)
                                 .sub( new BN(deploymentConfig.PROPOSAL_DEPOSIT) )
                                .sub( new BN(proposalData.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE) ) )
                            : initialProposerBalance 
      assert.equal(proposerBalance.toString(), expectedBalance.toString())
      // proposer is applicant
    } else {
      const applicantBalance = await token.balanceOf(proposal.applicant1)
      const expectedApplicantBalance = !aborted
                                        ? new BN(initialApplicantBalance)
                                        .sub( new BN(proposalData.sharesRequested).mul( new BN(deploymentConfig.TOKEN_TRIBUTE) ) )
                                        : new BN(initialApplicantBalance)
      assert.equal(applicantBalance.toString(),expectedApplicantBalance.toString());

      const proposerBalance = await token.balanceOf(proposer)
      const expectedProposerBalance = new BN (initialProposerBalance) 
                                        .sub(new BN (deploymentConfig.PROPOSAL_DEPOSIT))
      assert.equal(proposerBalance.toString(), expectedProposerBalance.toString())
    }

    const processorBalance = await token.balanceOf(processor)
    assert.equal(processorBalance, initialProcessorBalance
    )

    if (didPass && !aborted) {

      assert.equal(expectedWinner, proposalData.electedCandidate)

      // existing member
      if (initialApplicantShares > 0) {
        const memberData = await voting.members(proposalData.electedCandidate)
        const expectedSharesRequested = new BN(proposalData.sharesRequested).add( new BN(initialApplicantShares) )
        assert.equal(memberData.shares.toString(),  expectedSharesRequested.toString())
     
        // new member
      } else {
        const newMemberData = await voting.members(proposalData.electedCandidate)
        assert.equal(newMemberData.delegateKey, proposalData.electedCandidate)
        assert.equal(newMemberData.shares.toString(), proposalData.sharesRequested.toString())
        assert.equal(newMemberData.exists, true)

        const newMemberAddressByDelegateKey = await voting.memberAddressByDelegateKey(proposalData.electedCandidate)
        assert.equal(newMemberAddressByDelegateKey, proposalData.electedCandidate)
      }
    }
  }
    /****************************************************************************
     * Verfication functions - End
     ****************************************************************************/

    





    /****************************************************************************
     * Before initialization
     ****************************************************************************/
    before('Deploy contracts', async () => {
      token = await Token.new(TOKEN_SUPPLY)
      voting = await Voting.new(
                                summoner,
                                deploymentConfig.PERIOD_DURATION_IN_SECONDS,
                                deploymentConfig.VOTING_DURATON_IN_PERIODS,
                                deploymentConfig.GRACE_DURATON_IN_PERIODS,
                                deploymentConfig.ABORT_WINDOW_IN_PERIODS,
                                deploymentConfig.PROPOSAL_DEPOSIT, 
                                deploymentConfig.TOKEN_TRIBUTE,
                                deploymentConfig.PROCESSING_REWARD,
                                true,
                                token.address,)
      const treasuryAddress = await voting.treasuryAccount();
      treasury = await TreasuryAccount.at(treasuryAddress)

    })  

    /****************************************************************************
     * Before Each and After Each initialization
     ****************************************************************************/
    beforeEach(async() =>{
      snapshotimage = await snapshot()

      proposal1 = {
        objectiveProposal : true,
        applicant1: applicant1,
        sharesRequested: 1,
        details: 'Sample Proposal for testing',
      }

      proposal2 = {
        objectiveProposal : false,
        applicant1: applicant1,
        applicant2: applicant2,
        sharesRequested: 1,
        details: 'Sample Proposal for testing',
      }
      token.transfer(summoner, initSummonerBalance, { from: deployer })
    })

    afterEach(async () => {
      await snapshotimage.restore()
    })


    /****************************************************************************
     * Verify deployment parameters
     ****************************************************************************/
    it('verify deployment parameters', async () => {
     
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

      const tokenTribute = await voting.tokenTribute()
      assert.equal(+tokenTribute, deploymentConfig.TOKEN_TRIBUTE)

      const processingReward = await voting.processingReward()
      assert.equal(+processingReward, deploymentConfig.PROCESSING_REWARD)

      const currentPeriod = await voting.getCurrentPeriod()
      assert.equal(+currentPeriod, 0)

      const summonerData = await voting.members(summoner)
      assert.equal(summonerData.delegateKey.toLowerCase(), summoner.toLowerCase()) // delegateKey matches
      //assert.equal(summonerData.shares, 1)
      assert.equal(summonerData.shares, 4)
      assert.equal(summonerData.exists, true)
      assert.equal(summonerData.highestIndexVote, 0)
      
      const summonerAddressByDelegateKey = await voting.memberAddressByDelegateKey(
        summoner
      )
      assert.equal(summonerAddressByDelegateKey.toLowerCase(), summoner.toLowerCase())
  
      const totalShares = await voting.totalShares()
      //assert.equal(+totalShares, 1)
      assert.equal(+totalShares, 4)

      const tokenSupply = await token.totalSupply()
      assert.equal(+tokenSupply.toString(), TOKEN_SUPPLY)
      
      const summonerBalance = await token.balanceOf(summoner)
      assert.equal(+summonerBalance.toString(), initSummonerBalance)
      
      const deployerBalance = await token.balanceOf(deployer)
      assert.equal(deployerBalance, TOKEN_SUPPLY - initSummonerBalance)

    })



    /****************************************************************************
    * Submit proposal
    ****************************************************************************/
    describe('Submit Proposal',() =>{

      beforeEach(async()=>{
        await token.transfer(proposal1.applicant1, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await token.approve(voting.address, deploymentConfig.PROPOSAL_DEPOSIT, { from: summoner })
        await token.approve(voting.address, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: proposal1.applicant1})
      })

      it('Happy case - Submit proposal- objective',async() =>{
        await voting.submitProposal(proposal1.objectiveProposal,
                                    [proposal1.applicant1],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    {from:summoner}
                                   )

        await verifySubmitProposal(proposal1, 0, summoner, {
          initialTotalShares: 4,
          initialApplicantBalance: new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)),
          initialProposerBalance: initSummonerBalance
        })
      })

      it('Fail - Zero candidates', async() =>{
        await voting.submitProposal(proposal1.objectiveProposal,
                                    [],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    {from:summoner}
                                  ).should.be.rejectedWith('Voting::submitProposal - at least 1 candidate is required');
      })

      it('Fail - Objective proposal with multiple candidates', async() =>{
        await voting.submitProposal(proposal1.objectiveProposal,
                                    [proposal1.applicant1, applicant2],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    {from:summoner}
                                  ).should.be.rejectedWith('Voting::submitProposal - objectiveProposal needs only one candidate');
      })

      it('Fail - Insufficient proposal deposit', async () => {
        await token.transfer(deployer, initSummonerBalance, { from: summoner })
        // SafeMath reverts in ERC20.transferFrom
        await voting.submitProposal(proposal1.objectiveProposal,
                                    [proposal1.applicant1],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    {from:summoner}
                                  ).should.be.rejectedWith('Voting:: submitProposal - proposer does not have enough token for deposit');
      })

      it('Fail - Insufficient authorized proposal deposit', async () => {
        await token.decreaseAllowance(voting.address, 1, { from: summoner })
        // SafeMath reverts in ERC20.transferFrom
        await voting.submitProposal(proposal1.objectiveProposal,
                                    [proposal1.applicant1],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    {from:summoner}
                                  ).should.be.rejectedWith('Voting:: submitProposal - deposit transfer not authorized by proposer');
      })
  
      it('Fail - Insufficient applicant tokens', async () => {
        await token.transfer(deployer, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: proposal1.applicant1})
        
        // SafeMath reverts in ERC20.transferFrom
        await voting.submitProposal( proposal1.objectiveProposal,
                                    [proposal1.applicant1],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    {from:summoner}
                                  ).should.be.rejectedWith("Voting:: submitProposal - candidate does not have enough token for deposit")
      })

      it('Fail - Insufficient authorized applicant tokens', async () => {
        await token.decreaseAllowance(voting.address, 1, { from: proposal1.applicant1 })
        
        // SafeMath reverts in ERC20.transferFrom
        await voting.submitProposal( proposal1.objectiveProposal,
                                    [proposal1.applicant1],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    {from:summoner}
                                  ).should.be.rejectedWith("Voting:: submitProposal - processing fee transfer not authorized by candidate")
      })
  
      it('Fail - Proposal by non-delegator', async () => {
        await voting.submitProposal( proposal1.objectiveProposal,
                                    [proposal1.applicant1],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    { from: applicant1 }
                                  ).should.be.rejectedWith('Voting::onlyDelegate - not a delegate')
      })
    
    })

    /****************************************************************************
    * Submit vote
    ****************************************************************************/
    describe('Submit vote - objective yes', () => {
      beforeEach(async () => {
        await token.transfer(proposal1.applicant1, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await token.approve(voting.address, deploymentConfig.PROPOSAL_DEPOSIT, { from: summoner })
        await token.approve(voting.address, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: proposal1.applicant1})
  
        await voting.submitProposal(proposal1.objectiveProposal,
                                    [proposal1.applicant1],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    { from: summoner }
                                    )
   
      })
      
      it('Happy case - Yes Vote', async () => {
        await advanceTimeInPeriods(1)        
        await voting.submitVote(0, proposal1.applicant1, 1, { from: summoner })  
        await verifySubmitVote(proposal1, 0, {objectiveProposal: proposal1.objectiveProposal, yesVote : true,applicant: proposal1.applicant1})

      })
      it('Fail - member has already voted', async () => {
        await advanceTimeInPeriods(1)
        await voting.submitVote(0, proposal1.applicant1, 0, { from: summoner })
        await voting.submitVote(0, proposal1.applicant1, 0, { from: summoner }).should.be.rejectedWith('Voting::submitVote - member has already voted objectively')
      })
      it('Fail - objective vote should be zero or one', async () => {
        await advanceTimeInPeriods(1) 
        await voting.submitVote(0, proposal1.applicant1, 2, { from: summoner }).should.be.rejectedWith( "Voting::submitVote - A vote must be 0 or 1")
      })
     
    })



    describe('Submit vote - objective false', () => {
      beforeEach(async () => {
        await token.transfer(proposal1.applicant1, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await token.approve(voting.address, deploymentConfig.PROPOSAL_DEPOSIT, { from: summoner })
        await token.approve(voting.address, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: proposal1.applicant1})
  
        await voting.submitProposal(proposal1.objectiveProposal,
                                    [proposal1.applicant1],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    { from: summoner }
                                    )
          
      })
      
      it('Happy case - No vote', async () => {
        await advanceTimeInPeriods(1)        
        await voting.submitVote(0, proposal1.applicant1, 0, { from: summoner })  
        await verifySubmitVote(proposal1, 0, {objectiveProposal: proposal1.objectiveProposal, yesVote : false,applicant: proposal1.applicant1})

      })

      it('Fail - voting period not started', async () => { 
        await voting.submitVote(0, proposal1.applicant1, 0, { from: summoner }).should.be.rejectedWith('Voting::submitVote - voting period has not started')
      })

      it('Fail - voting period closed', async () => {
        await advanceTimeInPeriods(3) 
        await voting.submitVote(0, proposal1.applicant1, 0, { from: summoner }).should.be.rejectedWith('Voting::submitVote - proposal voting period has expired')
      })

      
    })



    describe('Submit vote - non-objective', () => {
      beforeEach(async () => {
        await token.transfer(proposal2.applicant1, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await token.transfer(proposal2.applicant2, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await token.approve(voting.address, deploymentConfig.PROPOSAL_DEPOSIT, { from: summoner })
        await token.approve(voting.address, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: proposal2.applicant1})
        await token.approve(voting.address, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: proposal2.applicant2})
  
        await voting.submitProposal(proposal2.objectiveProposal,
                                    [proposal2.applicant1, proposal2.applicant2],
                                    proposal2.sharesRequested,
                                    proposal2.details,
                                    { from: summoner }
                                    )
      })
      
      it('Happy case - submit normal vote', async () => {
        await advanceTimeInPeriods(1)        
        await voting.submitVote(0, proposal2.applicant1, 1, { from: summoner })  
        await verifySubmitVote(proposal2, 0,{objectiveProposal: proposal2.objectiveProposal, yesVote : true, applicant: proposal2.applicant1, voteCount: 1})

      })
      it('Fail - objective vote should be zero or one', async () => {
        await advanceTimeInPeriods(1) 
        await voting.submitVote(0, proposal1.applicant1, 0, { from: summoner }).should.be.rejectedWith( "Voting::submitVote - For non objective voting atleast vote should be cast")
      })

      //To test this change the initial share of summoner to 4
      it('Happy case - submit quadratic vote', async () => {
        await advanceTimeInPeriods(1)        
        await voting.submitVote(0, proposal2.applicant1, 4, { from: summoner })  
        await verifySubmitVote(proposal2, 0,{objectiveProposal: proposal2.objectiveProposal, yesVote : true, applicant: proposal2.applicant1, voteCount: 4})

      })

      it('Fail - member has already voted', async () => {
        await advanceTimeInPeriods(1)
        await voting.submitVote(0, proposal1.applicant1, 5, { from: summoner }).should.be.rejectedWith('Voting::submitVote - not enough shares to cast this quantity of votes')
      })
      
      it('Fail - member has already voted', async () => {
        await advanceTimeInPeriods(1)
        await voting.submitVote(0, proposal1.applicant1, 5, { from: summoner }).should.be.rejectedWith('Voting::submitVote - not enough shares to cast this quantity of votes')
      })

      it('Fail - voter not a member', async () => {
        await advanceTimeInPeriods(1)
        await voting.submitVote(0, proposal1.applicant1, 5, { from: applicant1 }).should.be.rejectedWith('Voting::onlyMember - not a member')
      })

      
    })


    /****************************************************************************
    * Process Proposal
    ****************************************************************************/
     describe('Process proposal - Objective', () => {
     
     
      beforeEach(async () => {
        await token.transfer(proposal1.applicant1, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await token.approve(voting.address, deploymentConfig.PROPOSAL_DEPOSIT, { from: summoner })
        await token.approve(voting.address, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: proposal1.applicant1})
  
        await voting.submitProposal(proposal1.objectiveProposal,
                                    [proposal1.applicant1],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    { from: summoner }
                                    )
        await voting.addMember(deployer,1,{from:summoner});
        await voting.addMember(processor,1,{from:summoner});
      })


      it('Happy case - Objective vote - elected', async () => {
        await advanceTimeInPeriods(1)

        await voting.submitVote(0, proposal1.applicant1, 1, { from: summoner });
        await voting.submitVote(0, proposal1.applicant1, 1, { from: deployer });
        await voting.submitVote(0, proposal1.applicant1, 0, { from: processor })

        await advanceTimeInPeriods(deploymentConfig.VOTING_DURATON_IN_PERIODS)
        await advanceTimeInPeriods(deploymentConfig.GRACE_DURATON_IN_PERIODS)
        await voting.processProposal(0, { from: processor })

        await verifyProcessProposal(proposal1, 0, summoner, processor, {
          initialTotalSharesRequested: 1,
          initialTotalShares: 6,
          initialApplicantShares : 0,
          initialTreasuryBalance: 0,
          initialApplicantBalance : new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)),
          initialProposerBalance: initSummonerBalance,
          initialProcessorBalance: 0,
          expectedFinalTotalSharesRequested: 0,
          expectedWinner : proposal1.applicant1,
          didPass: true,
          aborted: false,
          isApplicantProposer: false,
          
        })
      })

  
      it('Happy case - Objective vote - Not elected', async () => {
        await advanceTimeInPeriods(1)

        await voting.submitVote(0, proposal1.applicant1, 0, { from: summoner });
        await voting.submitVote(0, proposal1.applicant1, 0, { from: deployer });
        await voting.submitVote(0, proposal1.applicant1, 1, { from: processor })

        await advanceTimeInPeriods(deploymentConfig.VOTING_DURATON_IN_PERIODS)
        await advanceTimeInPeriods(deploymentConfig.GRACE_DURATON_IN_PERIODS)
        await voting.processProposal(0, { from: processor })
        
        await verifyProcessProposal(proposal1, 0, summoner, processor, {
          initialTotalSharesRequested: 1,
          initialTotalShares: 6,
          initialApplicantShares : 0,
          initialTreasuryBalance: 0,
          initialApplicantBalance : new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)),
          initialProposerBalance: initSummonerBalance,
          initialProcessorBalance: 0,
          expectedFinalTotalSharesRequested: 0,
          expectedWinner : zeroAddress,
          didPass: false,
          aborted: false,
          isApplicantProposer: false,
          
        })
      })


    })




    describe('Process proposal - Elective', () => {
      
      beforeEach(async () => {
        await token.transfer(proposal1.applicant1, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await token.approve(voting.address, deploymentConfig.PROPOSAL_DEPOSIT, { from: summoner })
        await token.approve(voting.address, new BN(proposal1.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: proposal1.applicant1})
  
        await voting.submitProposal(proposal1.objectiveProposal,
                                    [proposal1.applicant1],
                                    proposal1.sharesRequested,
                                    proposal1.details,
                                    { from: summoner }
                                    )

        await token.transfer(proposal2.applicant1, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await token.transfer(proposal2.applicant2, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: deployer})
        await token.approve(voting.address, deploymentConfig.PROPOSAL_DEPOSIT, { from: summoner })
        await token.approve(voting.address, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: proposal2.applicant1})
        await token.approve(voting.address, new BN(proposal2.sharesRequested).mul(new BN(deploymentConfig.TOKEN_TRIBUTE)), {from: proposal2.applicant2})                            
        await voting.submitProposal(proposal2.objectiveProposal,
                                    [proposal2.applicant1, proposal2.applicant2],
                                    proposal2.sharesRequested,
                                    proposal2.details,
                                    { from: summoner }
                                    )
        await voting.addMember(deployer,1,{from:summoner});
        await voting.addMember(processor,1,{from:summoner});
      })


      it('Happy case - Quadratic vote - Elected', async () => {

        await advanceTimeInPeriods(2)
        await voting.submitVote(0, proposal1.applicant1, 1, { from: summoner });
        await voting.submitVote(0, proposal1.applicant1, 1, { from: deployer });
        await voting.submitVote(0, proposal1.applicant1, 0, { from: processor })

        await voting.submitVote(1, proposal2.applicant1, 4, { from: summoner });
        await voting.submitVote(1, proposal2.applicant1, 1, { from: deployer });
        await voting.submitVote(1, proposal2.applicant2, 1, { from: processor })

        await advanceTimeInPeriods(new BN(deploymentConfig.VOTING_DURATON_IN_PERIODS).add(new BN(1)))
        await advanceTimeInPeriods(new BN(deploymentConfig.GRACE_DURATON_IN_PERIODS).add(new BN(1)))
        await voting.processProposal(0, { from: processor })
       
        await voting.processProposal(1, { from: processor })
        
        await verifyProcessProposal(proposal2, 1, summoner, processor, {
          totalCandidates : 2,
          initialTotalSharesRequested: 1,
          initialTotalShares: 7, //Adding the total shares with the shares from proposal1 6+1
          initialApplicantShares : 1, // Applicant1 already have a share from the processed proposal1
          initialTreasuryBalance: 110, //Adding the proposal1 deposit and proposal1 applicant fees
          initialApplicantBalance : new BN(proposal2.sharesRequested).mul( new BN(deploymentConfig.TOKEN_TRIBUTE) ),
          initialProposerBalance: new BN(initSummonerBalance).sub( new BN(deploymentConfig.PROPOSAL_DEPOSIT)), //Reducing the proposal deposit for proposal1
          initialProcessorBalance: 0,
          expectedFinalTotalSharesRequested: 0,
          expectedWinner : proposal2.applicant1,
          didPass: true,
          aborted: false,
          isApplicantProposer: false,
        })
      })
 
 
    })


})
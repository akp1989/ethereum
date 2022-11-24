import type {NextPage} from 'next'
import Head from 'next/head'
import {useState} from 'react'
import styles from '../styles/Home.module.css'
import { Box,Container,Stack, Button,InputLabel,FormLabel, FormControlLabel, RadioGroup, Radio,Select,FormControl, MenuItem } from '@mui/material' 
import { TextField } from '@mui/material'
import { downloadContent} from '../component/ipfs'
import { getProposal, getVotingStatus, submitVote, processProposal} from '../component/votingContractCall'
import { BigNumber } from 'ethers'

const dateForDisplay =  new Date().getFullYear()
                        + new Date().toLocaleString("en-US", { month: "2-digit" }) 
                        + new Date().toLocaleString("en-US", { day : '2-digit'})
                        +'T' + new Date().toLocaleTimeString();

const viewProposalPageModel = {
  proposalIndex: '',
  isObjective: '',
  isProcessed: '',
  isPassed: '',
  proposer: '',
  candidates: [], 
  candidate:'',
  electedCandidate: '',
  sharesRequested:0,
  startingPeriod:0, 
  votingStatus:'',
  cid: '',
  votes: 1,
  proposalDescription: '',
  transactionResponse: '',
}

const Home: NextPage = () => { 
  
  let [formData, setFormData] = useState(viewProposalPageModel);

  const handleChange = (event) =>{
    formData = {
      ...formData, 
      [event.target.name]: event.target.value.trim()
    }
    setFormData(formData);
    console.log(formData);
  }

  const resetFormData = async() =>{
    setFormData(viewProposalPageModel);
  }
  
  const _getVotingStatus = async(startingPeriod) => {
    let votingStatus = await getVotingStatus(startingPeriod);
    formData = {
      ...formData,
      votingStatus : (votingStatus) ? 'VotingExpired' : 'Voting in Progress',
    }
    setFormData(formData);
  }
  const getProposalForIndex = async() =>{
    resetFormData();
    let proposal = await getProposal(formData.proposalIndex);
   
    let proposalDesc;
    let _votingStatus;
    try {
      proposalDesc = await downloadContent(proposal.details);
      _getVotingStatus(proposal.startingPeriod);
    } catch (error) {
      console.log("Error retrieving content from IPFS for",proposal.details);
    }
    
    formData = {
      ...formData, 
      isObjective: proposal.objectiveProposal,
      isProcessed: proposal.processed,
      isPassed: proposal.didPass,
      proposer: proposal.proposer,
      candidates: proposal.candidates,
      electedCandidate: proposal.electedCandidate,
      cid : proposal.details,
      sharesRequested : BigNumber.from(proposal.sharesRequested).toNumber(),
      startingPeriod : BigNumber.from(proposal.startingPeriod).toNumber(),  
      proposalDescription : JSON.stringify(proposalDesc.data),
    }
    setFormData(formData);
  }

  const _submitVote = async() => {
    resetFormData();
    let transactionResponse = await submitVote(formData.proposalIndex,formData.candidate,formData.votes); 
    formData = {
      ...formData, 
      
      transactionResponse: transactionResponse
    }
    setFormData(formData);
  }

  const _processProposal = async() =>{
    resetFormData();
    let transactionResponse = await processProposal(formData.proposalIndex);
    formData = {
      ...formData, 
      transactionResponse: transactionResponse
    }
    setFormData(formData);

  }

  return (
    <div className={styles.container}>
      
      <Container component="main" maxWidth="lg" style={{ background: '#FFFFFF' }}>
      
        <Box component="form" noValidate autoComplete="off"
              sx={{
                '& .MuiTextField-root': { m: 0, width: '30ch' },
              }}> 
          <Stack direction="row" spacing={5} marginLeft={2} marginTop={2} marginBottom={2}>
            <Stack direction="column"  spacing={1} > 
                <TextField
                      type='text'
                      label='Proposal Index'
                      name='proposalIndex'
                      onChange={handleChange}
                      variant = 'outlined'
                      value={formData.proposalIndex}
                      >                  
                </TextField> 

                <Button variant="contained" sx={{width:200}} onClick={async() => await getProposalForIndex()}>Get Proposal</Button>
                <br></br>

                <TextField
                      type='text'
                      label='Proposer'
                      name='proposer'
                      variant = 'outlined'
                      value={formData.proposer}
                      disabled
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='Shares Requested'
                      name='sharesRequested'
                      variant = 'outlined'
                      value={formData.sharesRequested}
                      disabled
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='Starting period  '
                      name='startingPeriod'
                      variant = 'outlined'
                      value={formData.startingPeriod}
                      disabled
                      >                  
                </TextField> 
                <br></br>
                <Stack direction="row" spacing={1}>
                <TextField
                      type='text'
                      label='Voting status'
                      name='votingStatus'
                      variant = 'outlined'
                      value={formData.votingStatus}
                      disabled
                      style={{width:'180px'}}
                      >                  
                </TextField> 

                <Button variant="contained" sx={{width:10}} onClick={async() => await _getVotingStatus(formData.startingPeriod)}>Get</Button>
                </Stack>
                <br></br>
                <RadioGroup
                      aria-labelledby="proposalobjective-radio-buttons-group"
                      name="Objective"
                      value={formData.isObjective}
                    >
                  <Stack direction="row"   justifyContent="flex-start" alignItems="flex-start" spacing={1}>

                    <Box >
                      <FormLabel id="proposalobjective-radio-buttons-group" disabled={true}>Objective Proposal</FormLabel><br></br>
                      <FormControlLabel value="true" control={<Radio /> } label="True" />
                      <FormControlLabel value="false" control={<Radio />} label="False" />
                    </Box>

                  </Stack>
                </RadioGroup>


                <RadioGroup
                      aria-labelledby="proposalprocessed-radio-buttons-group"
                      name="Processed"
                      value={formData.isProcessed}
                    >
                  <Stack direction="row"   justifyContent="flex-start" alignItems="flex-start" spacing={1}>

                    <Box>
                      <FormLabel id="proposalprocessed-radio-buttons-group" disabled={true}>Proposal Processed</FormLabel><br></br>
                      <FormControlLabel value="true" control={<Radio />} label="True" />
                      <FormControlLabel value="false" control={<Radio />} label="False" />
                    </Box>

                  </Stack>
                </RadioGroup>

                <RadioGroup
                      aria-labelledby="proposalpassed-radio-buttons-group"
                      name="Passed"
                      value={formData.isPassed}
                    >
                  <Stack direction="row"   justifyContent="flex-start" alignItems="flex-start" spacing={1}>

                    <Box>
                      <FormLabel id="proposalpassed-radio-buttons-group" disabled={true}>Proposal Passed</FormLabel><br></br>
                      <FormControlLabel value="true" control={<Radio />} label="True" />
                      <FormControlLabel value="false" control={<Radio />} label="False" />
                    </Box>

                  </Stack>
                </RadioGroup>

                <br></br>
                <FormControl size="small">
                <InputLabel id="candidates-select-label">Candidates</InputLabel>
                <Select labelId='candidates-select-label'
                        value={formData.candidate}
                        label="Select candidate"
                        onChange={handleChange}
                        style={{width:'240px'}}
                        name='candidate'>

                  {formData.candidates.map( 
                                            address =><MenuItem key={address} value={address}> {address} </MenuItem>
                                          )}
                </Select>
                </FormControl>
                <br></br>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" sx={{width:150}} onClick={async() => await _submitVote()}>Vote</Button>
                  <Button variant="contained" sx={{width:150}} onClick={async() => await _processProposal()}>Process</Button>
                </Stack>
                
              </Stack>

              <Stack direction="column"  alignSelf="top" spacing={1}> 
                <Box mb={2}>
                <TextField
                      type='text'
                      label='Proposal description'
                      name='proposalDescription'
                      value={formData.proposalDescription}
                      variant = 'outlined'
                      multiline
                      rows={16} 
                      style={{width:'480px'}}
                      disabled
                      >                  
                </TextField> 
                </Box>
                <br></br>
                
                <Box mb={2}>
                <TextField
                      type='text'
                      label='Transaction Response'
                      name='transactionResponse'
                      value={formData.transactionResponse}
                      variant = 'outlined'
                      multiline
                      rows={8} 
                      style={{width:'480px'}}
                      disabled
                      >                  
                </TextField> 
                </Box>
              </Stack>
          </Stack> 
        </Box>
      </Container>


    </div>
  )
}

export default Home

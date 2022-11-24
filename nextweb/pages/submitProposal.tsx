import type {NextPage} from 'next'
import Head from 'next/head'
import {useState} from 'react'
import styles from '../styles/Home.module.css'
import { Box,Grid,Container,Stack, Button,Input,FormLabel, FormControlLabel, RadioGroup, Radio } from '@mui/material' 
import { TextField } from '@mui/material'
import { uploadContent} from '../component/ipfs'
import { createProposal} from '../component/votingContractCall'

const dateForDisplay =  new Date().getFullYear()
                        + new Date().toLocaleString("en-US", { month: "2-digit" }) 
                        + new Date().toLocaleString("en-US", { day : '2-digit'})
                        +'T' + new Date().toLocaleTimeString();

const submitProposalPageModel = {

  isObjective: false,
  candidates: '', 
  sharesRequested:'', 
  details: '',
  timeStamp:dateForDisplay,
  proposalDescription: '',
  ipfsHash:'',
  uploadfile:null,
  transactionResponse:null,
}

const Home: NextPage = () => { 
  
  let [formData, setFormData] = useState(submitProposalPageModel);

  const handleChange = (event) =>{
    formData = {
      ...formData, 
      [event.target.name]: event.target.value.trim()
    }
    setFormData(formData);
    console.log(formData);
  }
  
  const uploadToIPFS = async() =>{

    var uploadResponse =  await uploadContent(formData.proposalDescription);
     
    formData = {
      ...formData, 
      details : uploadResponse.CID ? 'https://ipfs.io/ipfs/'+uploadResponse.CID : uploadResponse,
      ipfsHash : uploadResponse.CID,
    }
    setFormData(formData);
  }
  

  const submitProposal = async() =>{
    let transactionResponse = await createProposal(formData);
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
                <RadioGroup
                      //row
                      aria-labelledby="proposalobjective-radio-buttons-group"
                      name="isObjective"
                      onChange={handleChange}
                    >
                  <Stack direction="row"   justifyContent="flex-start" alignItems="flex-start" spacing={1}>

                    <Box>
                      <FormLabel id="proposalobjective-radio-buttons-group">Objective Proposal</FormLabel><br></br>
                      <FormControlLabel value={true} control={<Radio />} label="True" />
                      <FormControlLabel value={false} control={<Radio />} label="False" />
                    </Box>

                  </Stack>
                </RadioGroup>
                <br></br>
                <TextField
                      type='text'
                      label='Candiates'
                      name='candidates'
                      onChange={handleChange}
                      variant = 'outlined'
                      multiline
                      rows={5} 
                      helperText='Enter as 0x...,0x...'
                      >                  
                </TextField> 
                <br></br>
                
                <TextField
                      type='text'
                      label='Shares Requested'
                      name='sharesRequested'
                      onChange={handleChange}
                      variant = 'outlined'
                      value={formData.sharesRequested}
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='IPFS Link for Details'
                      name='details'
                      value= {formData.details}
                      onChange={handleChange}
                      variant = 'outlined'
                      >                  
                </TextField> 
                <br></br>

                <Button variant="contained" sx={{width:200}} onClick={async() => await submitProposal()}>Create Proposal</Button>
              </Stack>

              <Stack direction="column"  alignSelf="top" spacing={1}> 
                <Box mb={2}>
                <TextField
                      type='text'
                      label='Proposal description'
                      name='proposalDescription'
                      onChange={handleChange}
                      variant = 'outlined'
                      multiline
                      rows={8} 
                      style={{width:'420px'}}
                      helperText='Enter as JSON'
                      >                  
                </TextField> 
                <br></br>
                  <Button variant="contained"  sx={{width:200}} onClick={async() => await uploadToIPFS()}> Upload </Button>
                </Box>
                <br></br>



                <Box>
                <TextField
                      type='text'
                      label='Transaction Result'
                      name='transactionResponse'
                      value = {formData.transactionResponse? formData.transactionResponse:''}
                      variant = 'outlined'
                      multiline
                      rows={8} 
                      disabled
                      style={{width:'420px'}}
                      sx={{topMargin:'240px'}}
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

import type {NextPage} from 'next'
import Head from 'next/head'
import {useState} from 'react'
import styles from '../styles/Home.module.css'
import { Box,Grid,Container,Stack, Button,Input,FormLabel, FormControlLabel, RadioGroup, Radio } from '@mui/material' 
import { TextField } from '@mui/material' 
import { createTransfer,balanceTransfer,completeTransfer} from '../component/votingContractCall'

const dateForDisplay =  new Date().getFullYear()
                        + new Date().toLocaleString("en-US", { month: "2-digit" }) 
                        + new Date().toLocaleString("en-US", { day : '2-digit'})
                        +'T' + new Date().toLocaleTimeString();

const transferPageModel = {

  amount: 0,
  receiver: '', 
  dao:'', 
  treasury: '',
  timeStamp:dateForDisplay,
  contractAddress: '',
  daoToken: '',
  allowance:0,
  balance : 0,
  isDaoToken: false,
  proposalIndex: '',
  transactionResponse:'',
}

const Home: NextPage = () => { 
  
  let [formData, setFormData] = useState(transferPageModel);

  const handleChange = (event) =>{
    formData = {
      ...formData, 
      [event.target.name]: event.target.value.trim()
    }
    setFormData(formData);
    console.log(formData);
  }
  
  const _createTransfer = async() =>{
    let transactionResponse = await createTransfer(formData);
    formData = {
      ...formData, 
      transactionResponse: JSON.stringify(transactionResponse)
    }
    setFormData(formData);
  }
  const _balanceTransfer = async() =>{
    let transactionResponse = await balanceTransfer(formData.contractAddress);
    formData = {
      ...formData, 
      balance: transactionResponse.balance,
      allowance : transactionResponse.allowance
    }
    setFormData(formData);
  }
  
  const _transfer = async() => {
    let transactionResponse = await completeTransfer(formData.contractAddress, formData.proposalIndex, formData.isDaoToken);
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
                      label='Amount'
                      name='amount'
                      onChange={handleChange}
                      value={formData.amount}
                      variant = 'outlined'
                      >                  
                </TextField> 
                <br></br>
                
                <TextField
                      type='text'
                      label='Receiver Address'
                      name='receiver'
                      onChange={handleChange}
                      variant = 'outlined'
                      value={formData.receiver}
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='DAO Address'
                      name='dao'
                      value= {formData.dao}
                      onChange={handleChange}
                      variant = 'outlined'
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='Treasury Address'
                      name='treasury'
                      value= {formData.treasury}
                      onChange={handleChange}
                      variant = 'outlined'
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='Token Address'
                      name='daoToken'
                      value= {formData.daoToken}
                      onChange={handleChange}
                      variant = 'outlined'
                      >                  
                </TextField> 
                <br></br>

                <Button variant="contained" sx={{width:200}} onClick={async() => await _createTransfer()}>Create Contract</Button>
            </Stack>

              <Stack direction="column"  alignSelf="top" spacing={1}> 
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

              </Stack>
          </Stack> 

          <Stack direction="row" spacing={5} marginLeft={2} marginTop={2} marginBottom={2}>
            <Stack direction="column"  spacing={1} > 
              <TextField
                    type='text'
                    label='Address'
                    name='contractAddress'
                    value= {formData.contractAddress}
                    onChange={handleChange}
                    variant = 'outlined'
                    >                  
              </TextField> 
              <br></br>

              <Button variant="contained" sx={{width:200}} onClick={async() => await _balanceTransfer()}>Get Contract</Button>
              <br></br>

              <Stack direction="row" spacing={1}>
                <TextField
                      type='text'
                      label= 'Balance'
                      name='balance'
                      variant = 'outlined'
                      value={formData.balance}
                      disabled
                      style={{width:'100px'}}
                      >                  
                </TextField> 
                <TextField
                      type='text'
                      label= 'Allowance'
                      name='allowance'
                      variant = 'outlined'
                      value={formData.allowance}
                      disabled
                      style={{width:'100px'}}
                      >                  
                </TextField> 
              </Stack>
              <br></br>
            </Stack>
            <Stack direction="column"  spacing={1} > 
              <RadioGroup
                      //row
                      aria-labelledby="daoToken-radio-buttons-group"
                      name="isDaoToken"
                      onChange={handleChange}
                    >
                  <Stack direction="row"   justifyContent="flex-start" alignItems="flex-start" spacing={1}>

                    <Box>
                      <FormLabel id="daoToken-radio-buttons-group">Is DAO token</FormLabel><br></br>
                      <FormControlLabel value={true} control={<Radio />} label="True" />
                      <FormControlLabel value={false} control={<Radio />} label="False" />
                    </Box>

                  </Stack>
              </RadioGroup>
              <br></br>
              <TextField
                    type='text'
                    label='Proposal Index'
                    name='proposalIndex'
                    value= {formData.proposalIndex}
                    onChange={handleChange}
                    variant = 'outlined'
                    >                  
              </TextField> 
              <br></br>

              <Button variant="contained" sx={{width:200}} onClick={async() => await _transfer()}>Complete Transfer</Button>
              <br></br>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </div>
  )
}

export default Home

import type {NextPage} from 'next'
import Head from 'next/head'
import {useEffect, useState} from 'react'
import styles from '../styles/Home.module.css'
import { Box,Grid,Container,Stack, Button,Input } from '@mui/material'
import { useRouter } from 'next/router'
import { TextFieldsOutlined } from '../node_modules/@mui/icons-material/index'
import { TextField } from '../node_modules/@mui/material/index'
import { uploadDocument} from './lib/ipfs'
import { createMasterDocContract } from './lib/contractCall'


const documentPageModel = {
  documentId: '',
  authorName:'',
  timeStamp:'',
  ipfsLink:'',
  checkSum:'',
  reviewers:'',
  uploadfile:null,
  transactionResult:null,
}

const Home: NextPage = () => {
  const router = useRouter();
  
  let [formData, setFormData] = useState(documentPageModel);

  const dateForDisplay =  new Date().getFullYear()
                         + new Date().toLocaleString("en-US", { month: "2-digit" }) 
                         + new Date().toLocaleString("en-US", { day : '2-digit'})
                         +'T' + new Date().toLocaleTimeString();

  const handleChange = (event) =>{
    formData = {
      ...formData, 
      [event.target.name]: event.target.value.trim()
    }
    setFormData(formData);
    //console.log(formData);
  }
  
  const handleFileChange = (event) => {
    formData = {
      ...formData, 
      [event.target.name]: event.target.files[0]
    }
    setFormData(formData);
    //console.log(formData);
  }

  const uploadToIPFS = async() =>{
    let uploadResponseCID =  await uploadDocument(formData.documentId, formData.authorName, formData.uploadfile);
    formData = {
      ...formData, 
      checkSum: uploadResponseCID,
      ipfsLink : 'https://ipfs.io/ipfs/'+uploadResponseCID
    }
    setFormData(formData);
  }
  

  const createDocument = async() =>{
      await createMasterDocContract(formData);
  }

  return (
    <div className={styles.container}>
      
      <Container component="main" maxWidth="lg" style={{ background: '#FFFFFF' }}>
      
        <Box component="form" noValidate autoComplete="off"
              sx={{
                '& .MuiTextField-root': { m: 0, width: '30ch' },
              }}> 
          <Stack direction="row" alignself='top' spacing={5} marginLeft={2} marginTop={2} marginBottom={2}>
            <Stack direction="column"  alignSelf="top" spacing={1} > 
              <TextField
                      type='text'
                      label='DocumentId'
                      name='documentId'
                      onChange={handleChange}
                      variant = 'outlined'
                      >                  
                </TextField>
                <br></br>

                <TextField
                      type='text'
                      label='Author Name'
                      name='authorName'
                      onChange={handleChange}
                      variant = 'outlined'
                      >                  
                </TextField>
                <br></br>
                
                <TextField
                      type='text'
                      label='Time Stamp'
                      name='timeStamp'
                      onChange={handleChange}
                      variant = 'outlined'
                      defaultValue={dateForDisplay}
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='IPFS Link'
                      name='ipfsLink'
                      value= {formData.ipfsLink}
                      onChange={handleChange}
                      variant = 'outlined'
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='Checksum'
                      name='checkSum'
                      value= {formData.checkSum}
                      onChange={handleChange}
                      variant = 'outlined'
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='Reviewers'
                      name='reviewers'
                      onChange={handleChange}
                      variant = 'outlined'
                      multiline
                      rows={5} 
                      helperText='Enter as 0x...,0x...'
                      >                  
                </TextField> 
                <br></br> 

                <Button variant="contained" sx={{width:200}} onClick={async() => await createDocument()}>Create Document</Button>
              </Stack>

              <Stack direction="column"  alignSelf="top" spacing={15}> 
                <Box container mb={15}>
                  <Input id="uploadfile" name='uploadfile' type="file" onChange={handleFileChange} />
                  <br></br>
                  <Button variant="contained"  sx={{width:200}} onClick={async() => await uploadToIPFS()}  >
                    Upload
                  </Button>
                </Box>
                <br></br>
                <Box container mt={15}>
                  <TextField
                        type='text'
                        label='Transaction Result'
                        name='transactionResult'
                        defaultValue=' '
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

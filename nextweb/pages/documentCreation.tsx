import type {NextPage} from 'next'
import Head from 'next/head'
import {useState} from 'react'
import styles from '../styles/Home.module.css'
import { Box,Grid,Container,Stack, Button,Input } from '@mui/material' 
import { TextField } from '../node_modules/@mui/material/index'
import { uploadDocument} from './../component/ipfs'
import { createDocumentContract } from './../component/contractCall'
import { encryptDocumentKey } from '../component/keyGen'

const documentCreationPageModel = {
  documentId: '',
  authorName:'',
  timeStamp:'',
  ipfsLink:'',
  checkSum:'',
  reviewers:'',
  secretKey: '',
  uploadfile:null,
  transactionResponse:null,

  addParamsKey : '',
  addParamsValue : '',
  addParams:{},
}

const Home: NextPage = () => { 
  
  let [formData, setFormData] = useState(documentCreationPageModel);

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
    var masterSecret = formData.secretKey;
    var uploadResponse =  await uploadDocument(formData.authorName, formData.uploadfile, formData.addParams);
    var documentSecret = await encryptDocumentKey(uploadResponse.secretKey,masterSecret);
    let documentId = uploadResponse.CID.substring(0,4) + uploadResponse.CID.substring(uploadResponse.CID.length-4)
                      + new Date().getFullYear()
                      + new Date().toLocaleString("en-US", { month: "2-digit" }) 
                      + new Date().toLocaleString("en-US", { day : '2-digit'});
    formData = {
      ...formData, 
      documentId: documentId,
      checkSum: uploadResponse.CID,
      ipfsLink : 'https://ipfs.io/ipfs/'+uploadResponse.CID,
      addParams: uploadResponse,
      secretKey: documentSecret
    }
    setFormData(formData);
  }
  
  const updateAddParams = async() =>{
    var addParams = formData.addParams;
    var key = formData.addParamsKey;
    var value = formData.addParamsValue;
    addParams[key] = value;
    formData = {
       ...formData,
       addParams : addParams
    }
    setFormData(formData);
  }
  const createDocument = async() =>{
    let transactionResponse = await createDocumentContract(formData);
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
                      label='DocumentId'
                      name='documentId'
                      value={formData.documentId}
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

                <TextField
                      type='password'
                      label='MasterSecret'
                      name='secretKey'
                      value= {formData.secretKey}
                      onChange={handleChange}
                      variant = 'outlined'
                      >                  
                </TextField> 
                <br></br> 

                <Button variant="contained" sx={{width:200}} onClick={async() => await createDocument()}>Create Document</Button>
              </Stack>

              <Stack direction="column"  alignSelf="top" spacing={1}> 
                <Box mb={2}>
                  <Input id="uploadfile" name='uploadfile' type="file" onChange={handleFileChange} />
                  <br></br>
                  <Button variant="contained"  sx={{width:200}} onClick={async() => await uploadToIPFS()}  >
                    Upload
                  </Button>
                </Box>
                <br></br>
                <Stack direction="row">
                <TextField
                      type='text'
                      label='Params Key'
                      name='addParamsKey'
                      value= {formData.addParamsKey}
                      onChange={handleChange}
                      variant = 'outlined'
                      style={{width:'180px'}}
                      >                  
                </TextField> 
                <TextField
                      type='text'
                      label='Additional Params Value'
                      name='addParamsValue'
                      value= {formData.addParamsValue}
                      onChange={handleChange}
                      variant = 'outlined'
                      >                  
                </TextField>
                </Stack>
                <br></br>
                  <Button variant="contained"  sx={{width:200}} onClick={async() => await updateAddParams()}  >
                    Add Params
                  </Button>
                <br></br>
                <TextField
                        type='text'
                        label='Additional Params'
                        name='addParams'
                        value = {formData.addParams? JSON.stringify(formData.addParams) :''}
                        variant = 'outlined'
                        multiline
                        rows={4} 
                        disabled
                        style={{width:'420px'}}
                        sx={{topMargin:'240px'}}
                        >                  
                </TextField> 
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

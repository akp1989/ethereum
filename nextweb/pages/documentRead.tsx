import type {NextPage} from 'next'
import styles from '../styles/Home.module.css'
import { TextField,Box,Container,Button,Stack } from '@mui/material'
import { useState} from 'react'
import { readDocumentContract } from './lib/contractCall'
import { downloadDocument } from './lib/ipfs'


const documentReadPageModel = {
  documentId: '', 
  transactionResponse:null,
}

const Home: NextPage = () => {
  let [formData, setFormData] = useState(documentReadPageModel);
    
  const handleChange = async(event) =>{
      formData = {
        ...formData,
        [event.target.name] : event.target.value.trim()
      }
      setFormData(formData);
  }

  const readDocument = async() =>{
    var transactionResponse = await readDocumentContract(formData.documentId);
    formData = {
      ...formData,
      transactionResponse: transactionResponse
    }
    setFormData(formData);
    downloadDocument(transactionResponse._checksum);
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
                          value= {formData.documentId}
                          onChange={handleChange}
                          variant = 'outlined' 
                          >                  
              </TextField>
                <br></br>
              
              <Button variant="contained" sx={{width:200}} onClick={async() => await readDocument()}>Read Document</Button>
            </Stack>

            <Stack direction="column"  alignSelf="top" spacing={1}> 
                <TextField
                      type='text'
                      label='Transaction Result'
                      name='transactionResponse'
                      value={formData.transactionResponse? formData.transactionResponse:''}
                      variant = 'outlined'
                      multiline
                      rows={7} 
                      disabled 
                      style={{width:'420px'}}
                      >                  
                </TextField> 
                <br></br> 
              </Stack>

          </Stack>
        </Box>
      </Container>


    </div>
  )
}

export default Home

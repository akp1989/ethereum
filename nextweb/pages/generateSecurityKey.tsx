import type {NextPage} from 'next'
import styles from '../styles/Home.module.css'
import { TextField,Box,Container,Button,Stack } from '@mui/material'
import { useState} from 'react'
import { generateKey } from '../component/keyGen'



const genreateSecurityKeyModel = {
  securityKey: '', 

}

const Home: NextPage = () => {
  let [formData, setFormData] = useState(genreateSecurityKeyModel);
    
  const handleChange = async(event) =>{
      formData = {
        ...formData,
        [event.target.name] : event.target.value.trim()
      }
      setFormData(formData);
  }

  const generateMasterKey = async() =>{
    var transactionResponse = await generateKey();
    formData = {
      ...formData,
      securityKey: transactionResponse
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
          <Stack direction="row"  spacing={5} marginLeft={2} marginTop={2} marginBottom={2}>
            <Stack direction="column"   spacing={1} > 
              
              <Button variant="contained" sx={{width:200}} onClick={async() => await generateMasterKey()}>Create Master Key</Button>
            </Stack>

            <Stack direction="column" spacing={1}> 
                <TextField
                      type='text'
                      label='Generate key'
                      name='securityKey'
                      value={formData.securityKey? formData.securityKey:''}
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

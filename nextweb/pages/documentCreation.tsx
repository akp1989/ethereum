import type {NextPage} from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Box,Grid,Container,Stack, Button,Input } from '@mui/material'
import { useRouter } from 'next/router'
import { TextFieldsOutlined } from '../node_modules/@mui/icons-material/index'
import { TextField } from '../node_modules/@mui/material/index'


type documentPageModel = {
  isFetchingLenderEscrowAccount: boolean
  canClickNext: boolean

}

const Home: NextPage = () => {
  const router = useRouter();
  
  const dateForDisplay =  new Date().getFullYear()
                         + new Date().toLocaleString("en-US", { month: "2-digit" }) 
                         + new Date().toLocaleString("en-US", { day : '2-digit'})
                         +'T' + new Date().toLocaleTimeString();


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
                      variant = 'outlined'
                      >                  
                </TextField>
                <br></br>

                <TextField
                      type='text'
                      label='Author Name'
                      variant = 'outlined'
                      >                  
                </TextField>
                <br></br>
                
                <TextField
                      type='text'
                      label='Time Stamp'
                      variant = 'outlined'
                      defaultValue={dateForDisplay}
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='IPFS Link'
                      variant = 'outlined'
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='Checksum'
                      variant = 'outlined'
                      >                  
                </TextField> 
                <br></br>

                <TextField
                      type='text'
                      label='Reviewers'
                      variant = 'outlined'
                      multiline
                      rows={5} 
                      helperText='Enter as 0x...,0x...'
                      >                  
                </TextField> 
                <br></br> 

                <Button variant="contained" sx={{width:200}}>Create Document</Button>
              </Stack>

              <Stack direction="column"  alignSelf="top" spacing={15}> 
                <Box container mb={15}>
                  <Input id="contained-button-file" type="file" />
                  <br></br>
                  <Button variant="contained"  sx={{width:200}} >
                    Upload
                  </Button>
                </Box>
                <br></br>
                <Box container mt={15}>
                  <TextField
                        type='text'
                        label='Transaction Result'
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

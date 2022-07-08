import type {NextPage} from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { TextField,Box,Container,Button,Stack } from '@mui/material'
import { useRouter } from 'next/router'


type documentPageModel = {
  isFetchingLenderEscrowAccount: boolean
  canClickNext: boolean

}

const Home: NextPage = () => {
  const router = useRouter();

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
              
              <Button variant="contained" sx={{width:200}}>Read Document</Button>
            </Stack>

            <Stack direction="column"  alignSelf="top" spacing={1}> 
                <TextField
                      type='text'
                      label='Transaction Result'
                      defaultValue=' '
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

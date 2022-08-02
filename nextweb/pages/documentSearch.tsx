import type {NextPage} from 'next'
import styles from '../styles/Home.module.css'
import { useState} from 'react'
import { TextField,Box,Container,Button,Stack, FormLabel, FormControlLabel, RadioGroup, Radio } from '@mui/material'
import { searchDocument } from '../component/contractCall'

const documentSearchPageModel = {
    searchKey: '', 
    searchOption: '',
    documentId:[],
    documentAddress:[]
  }
  
  const Home: NextPage = () => {
    let [formData, setFormData] = useState(documentSearchPageModel);

    const handleChange = async(event) =>{
        formData = {
          ...formData,
          [event.target.name] : event.target.value.trim()
        }
        setFormData(formData); 
        //console.log(formData);
    }

    const search  = async() =>{
        var transactionResponse = await searchDocument(formData.searchKey, formData.searchOption);
        formData = {
          ...formData,
          documentId: transactionResponse
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
                  <TextField
                              type='text'
                              label='OwnerName'
                              name='searchKey'
                              value={formData.searchKey}
                              onChange={handleChange}
                              variant = 'outlined' 
                              >                  
                  </TextField>
                  <br></br>

                    <RadioGroup
                        //row
                        aria-labelledby="searchopt-radio-buttons-group"
                        name="searchOption"
                        //value={value}
                        onChange={handleChange}
                     >
                      <Stack direction="row"   justifyContent="flex-start" alignItems="flex-start" spacing={1}>
                        <Box>
                          <FormLabel id="searchopt-radio-buttons-group1">On chain search</FormLabel>
                          <FormControlLabel value="ownerChain" control={<Radio />} label="Owner" />
                        </Box>
                        
                        <Box>
                          <FormLabel id="searchopt-radio-buttons-group2">Off chain search</FormLabel><br></br>
                          <FormControlLabel value="ownerLog" control={<Radio />} label="Owner" />
                          <FormControlLabel value="reviewLog" control={<Radio />} label="Review" />
                        </Box>

                      </Stack>
                    </RadioGroup>

                  <Button variant="contained" sx={{width:200}} onClick={async() => await search()}>Search Document</Button>
                </Stack>
    
                <Stack direction="column" spacing={1}> 
                    <TextField
                          type='text'
                          label='Search Result'
                          name='documentId'
                          value={formData.documentId? formData.documentId:''}
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
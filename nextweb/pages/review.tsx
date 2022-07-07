import type {NextPage} from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { Container, } from '@mui/material'
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

        
 

      </Container>


    </div>
  )
}

export default Home

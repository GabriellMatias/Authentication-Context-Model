import { withSSRAuth } from "@/utils/withSSRAuth"
import { setupAPIClient } from "../services/api"
import decode from 'jwt-decode'

export default function Metrics(){
  
  

  return(
    <>
      <h1>Metrics</h1>
    </>
  )
}

export const getServerSideProps= withSSRAuth(async (context:undefined) =>{
  /*refez a funcao do API do axios para diferenciar quando esta do lado do browser
  e quando esta do lado do servidor. DO lado do servidor e necessario passar
  o contexto para o apiClient */
  const apiClient = setupAPIClient(context)
  
  const response = await apiClient.get('/me')
    
  return{
    props:{}
  }
},
{
  permissions:["metrics.list"],
  roles:['administrator']
})
import { withSSRAuth } from "@/utils/withSSRAuth"

import { useEffect } from "react"
import { Can } from "../components/Can"
import {  useAuthContext } from "../contexts/authContext"

import { setupAPIClient } from "../services/api"
import { api} from "../services/apiClient"

export default function Dashboard(){
  const {user, SignOut} = useAuthContext()
  useEffect(()=>{
    api.get('/me').then(res=> console.log(res)).catch(err => console.log(err))
  },[])
  

  return(
    <>
      <h1>Dashboard {user?.email}</h1>
      <button onClick={SignOut}>Sair</button>
      <Can permissions={['metrics.list']}>
        <div>Metricas</div>
      </Can>
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
})
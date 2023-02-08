import { withSSRAuth } from "@/utils/withSSRAuth"
import { destroyCookie } from "nookies"
import { useEffect } from "react"
import { useAuthContext } from "../contexts/authContext"
import { AuthTokenError } from "../errors/AuthTokenError"
import { setupAPIClient } from "../services/api"
import { api} from "../services/apiClient"

export default function Dashboard(){
  const {user} = useAuthContext()
  useEffect(()=>{
    api.get('/me').then(res=> console.log(res)).catch(err => console.log(err))
  },[])

  return(
    <h1>Dashboard {user?.email}</h1>
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
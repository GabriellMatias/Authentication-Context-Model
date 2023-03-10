import { AuthTokenError } from './../errors/AuthTokenError';
import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { SignOut } from "../contexts/authContext";
/* precisa do contexto dos cookies se o codigo estiver no lado do servidor */

let isRefreshing = false
let failedRequestsQueue = []


export function setupAPIClient(context?: undefined){
  let cookies = parseCookies(context)

  const api = axios.create({
    baseURL:"http://localhost:3333",
    headers:{
      Authorization:`Bearer ${cookies['nextauth.token']}`
    }
  })
  /* vai interceptar o dado depois da resposta ou antes da requisicao */
  /* Use recebe duas funcoes, a primeira e o que fazer se a resposta der sucesso,
  segunda o que fazer se der erro */
  api.interceptors.response.use(response=>{
    return response
  },
  (error: AxiosError) =>{
    if(error.response?.status === 401){
      if(error.response.data?.code  === 'token.expired'){
        cookies = parseCookies(context)
        const {'nextauth.refreshToken':refreshToken} = cookies
        /* pegando todos os dados precisos para refazer uma requisicao para o 
        back end */
        const originalConfig = error.config
  
        if(!isRefreshing){
          isRefreshing = true
  
          api.post('/refresh', {refreshToken}).then(response => {
            const {token} = response.data
      
      
              /* tres parametros, o contexto que nao existe na parte do browser, o nome do cookie e o 
            valor do token*/
            setCookie(context, "nextauth.token", token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path:'/'//qualquer endereco da app tem acesso a esse cookie 
            })
            setCookie(context, "nextauth.refreshToken", response.data.refreshToken,{
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path:'/'//qualquer endereco da app tem acesso a esse cookie 
            })
      
      
            /* atualizando o valor do token dentro do header para toda vez que o usuario logar
            o valor seja atualizado */
            api.defaults.headers["Authorization"] = `Bearer ${token}`
  
            failedRequestsQueue.forEach(request=> request.onSuccess(token))
            failedRequestsQueue =[]
      
            }).catch((err)=>{
              failedRequestsQueue.forEach(request=> request.onFailed(err))
              failedRequestsQueue =[]
              /* verificando se o esta no lado do servidor ou no browser */
              if(process.browser){
                SignOut()
              }
            }).finally(()=>{
              isRefreshing = false
            })
        }
        return new Promise((resolve, reject)=>{
          failedRequestsQueue.push({
            onSuccess: (token:string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`
              resolve(api(originalConfig))     
            },
            onFailed: (error:AxiosError) => {
              reject(error)
              
            },
          })
        })
  
        
      }else{
        if(process.browser){
          SignOut()
        }else{
          return Promise.reject(new AuthTokenError)
        }
      }
    }
    /* se o error nao for tratado em nenhum local desses Ifs, deixe o axios continuar 
    tentando tratar da maneira dele */
    return Promise.reject(error)
  })
  return api
}
import  decode  from 'jwt-decode';
import { AuthTokenError } from "@/src/errors/AuthTokenError"
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { destroyCookie, parseCookies } from "nookies"
import { validateUserPermission } from './validadeUserPermissions';

interface withSSRAuthOptions{
  permissions:string[]
  roles:string[]
}


/* uma funcao que recebe como parametro a funcao SSR e retorna outra funcao
asincrona com o que eu quero fazer. high order function */
export function withSSRAuth<P>(fn:GetServerSideProps<P>, options?:withSSRAuthOptions){
 return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> =>{
  const cookies = parseCookies(context)
  const token = cookies['nextauth.token']


  /* so deixa o usuario acessar o dashboard se estiver autenticado */
  if(!token){
    return{
      redirect:{
        destination:"/",
        permanent:false
      }
    }
  }

  if(options){
    const user = decode<{permissions:string[], roles:string[]}>(token)
    const {permissions, roles} = options
    const userHasPermissions = validateUserPermission({
      user, permissions, roles
    })
    if(!userHasPermissions){
      /*se o usuario nao tiver permissoes, nao precisa deslogar ele
      ou mandar para tela de login, manda para alguma tela
      que todo mundo tem permissao de acessar */
      return{
        redirect:{
        destination:'/dashboard',
        permanent:false
        }
      }
    }
  }


  

  try{
    return await fn(context)
  }catch(err){
    /*se o tipo do errro for o mesmo do AuthTokenError ele retorna true */
    if(err instanceof AuthTokenError){
      destroyCookie(context, 'nextauth.token')
    destroyCookie(context, 'nextauth.refreshToken')
      return{
        redirect:{
          destination:'/',
          permanent:false
        }
      }
    }
  }
 }
}
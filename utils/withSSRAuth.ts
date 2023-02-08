import { AuthTokenError } from "@/src/errors/AuthTokenError"
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { destroyCookie, parseCookies } from "nookies"

/* uma funcao que recebe como parametro a funcao SSR e retorna outra funcao
asincrona com o que eu quero fazer. high order function */
export function withSSRAuth<P>(fn:GetServerSideProps<P>){
 return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> =>{
  const cookies = parseCookies(context)
  /* so deixa o usuario acessar o dashboard se estiver autenticado */
  if(!cookies['nextauth.token']){
    return{
      redirect:{
        destination:"/",
        permanent:false
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
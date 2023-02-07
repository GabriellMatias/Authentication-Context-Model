import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { parseCookies } from "nookies"

/* uma funcao que recebe como parametro a funcao SSR e retorna outra funcao
asincrona com o que eu quero fazer. high order function */
export function withSSRGuest<P>(fn:GetServerSideProps<P>){
 return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> =>{
  const cookies = parseCookies(context)
  if(cookies['nextauth.token']){
    return{
      redirect:{
        destination:"/dashboard",
        permanent:false
      }
    }
  }
  return await fn(context)
 }
}
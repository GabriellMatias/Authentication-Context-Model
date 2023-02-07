
import  Router from "next/router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { setCookie, parseCookies, destroyCookie} from "nookies"

interface UserProps{
  email:string 
  permissions: string[]
  roles: string[]
}

interface SignInCredentials{
  email:string
  password: string
}

interface AuthContextData{

  signIn(credentiais:SignInCredentials): Promise<void>
  isAuthenticated: boolean
  user?:UserProps
}
interface AuthProviderProps{
  children:ReactNode
}

const AuthContext = createContext({} as AuthContextData)


export function SignOut(){
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')
  Router.push('/')
}

export function AuthProvider({children}: AuthProviderProps){


  const [user, setUser] = useState<UserProps>()
  const isAuthenticated = !!user

  useEffect(()=>{
    const {"nextauth.token":token} = parseCookies() 

    if(token){
      api.get('/me').then(response =>{
        const {email, permissions, roles} = response.data
        setUser({
          email,
          permissions,
          roles
        })
      }).catch(() =>{
        SignOut()
      })
    }

  }, [])

  async function signIn({email, password}:SignInCredentials){
    try
    {
      const response = await api.post('sessions', {
        email,
        password,
      })

      const {token, refreshToken, permissions, roles} = response.data

      setUser({
        email,
        permissions,
        roles
      })

      /* tres parametros, o contexto que nao existe na parte do browser, o nome do cookie e o 
      valor do token*/
      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path:'/'//qualquer endereco da app tem acesso a esse cookie 
      })
      setCookie(undefined, "nextauth.refreshToken", refreshToken,{
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path:'/'//qualquer endereco da app tem acesso a esse cookie 
      })

      /* atualizando o valor do token dentro do header para toda vez que o usuario logar
      o valor seja atualizado */
      api.defaults.headers["Authorization"] = `Bearer ${token}`

      Router.push("/dashboard")
    }
    catch(err){
      console.log(err)
    }
  }

  return(
    <AuthContext.Provider value={{signIn, user, isAuthenticated}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () =>{
  const Auth = useContext(AuthContext)
  return Auth
}

import  Router from "next/router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api} from "../services/apiClient"
import { setCookie, parseCookies, destroyCookie} from "nookies"

export interface UserProps{
  email?:string 
  permissions: string[]
  roles: string[]
}

interface SignInCredentials{
  email:string
  password: string
}

interface AuthContextData{
  SignOut:()=>void
  signIn: (credentiais:SignInCredentials) => Promise<void>
  isAuthenticated: boolean
  user?:UserProps
}
interface AuthProviderProps{
  children:ReactNode
}

const AuthContext = createContext({} as AuthContextData)

/*Usando o BroadcastChannel para deslogar o usuario de todas as abas abertas */
let authChannel : BroadcastChannel


export function SignOut(isFirstTime?:boolean){
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')
  Router.push('/')
  
  if(!isFirstTime){
    authChannel.postMessage('logout')
  }
}

export function AuthProvider({children}: AuthProviderProps){


  const [user, setUser] = useState<UserProps>()
  const isAuthenticated = !!user


   useEffect(()=>{
    authChannel  = new BroadcastChannel('auth')
    authChannel.onmessage = (message) =>{
      switch(message.data){
        case 'logout':
          SignOut(true);
          
          break
        
        case 'signIn':
          window.location.replace("http://localhost:3000/dashboard");
          break

        default:
          break
      }
    }

   },[])


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
      authChannel.postMessage("signIn")
    }
    catch(err){
      console.log(err)
    }
  }

  return(
    <AuthContext.Provider value={{signIn, user, SignOut ,isAuthenticated}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () =>{
  const Auth = useContext(AuthContext)
  return Auth
}
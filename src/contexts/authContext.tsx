
import { createContext, ReactNode, useContext } from "react";
import { api } from "../services/api";

interface SignInCredentials{
  email:string
  password: string
}

interface AuthContextData{

  signIn(credentiais:SignInCredentials): Promise<void>
  isAuthenticated: boolean
}
interface AuthProviderProps{
  children:ReactNode
}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({children}: AuthProviderProps){

  const isAuthenticated = false

  async function signIn({email, password}:SignInCredentials){
    const response = await api.post('sessions', {
      email,
      password,
    })
    console.log(response.data)
  }

  return(
    <AuthContext.Provider value={{signIn, isAuthenticated}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () =>{
  const Auth = useContext(AuthContext)
  return Auth
}
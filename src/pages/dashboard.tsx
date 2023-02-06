import { useAuthContext } from "../contexts/authContext"

export default function Dashboard(){
  const {user} = useAuthContext()

  return(
    <h1>Dashboard {user?.email}</h1>
  )
}
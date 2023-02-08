import { validateUserPermission } from "@/utils/validadeUserPermissions"
import { useAuthContext } from "../contexts/authContext"

interface UseCanProps{
  permissions?:string[]
  roles?:string[]
}

export function useCan({permissions, roles}:UseCanProps){
  const {isAuthenticated, user} =  useAuthContext()

  if(!isAuthenticated){
    return false
  }

  const userHasPermissions = validateUserPermission({user, permissions, roles})

  return userHasPermissions

}
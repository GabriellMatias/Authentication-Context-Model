import { UserProps } from './../src/contexts/authContext';
interface ValidadeUserPermissionsProps{
  user:UserProps
  permissions?:string[]
  roles?:string[]
}

/*arquivo criado para tirar a validacao de permissao do hook, pois hooks
so podem ser utilizados em components, ou seja, no front da aplicacao */
export function validateUserPermission({user, permissions, roles}:ValidadeUserPermissionsProps){
  if(permissions?.length > 0){
    /* vai retornar true se o usuario tiver TODAS as permissoes que vc esta esperando */
    const hasAllPermissions = permissions.every(permission =>{
      return user.permissions.includes(permission)
    })
    if(!hasAllPermissions){
      return false
    }
  }

  if(roles?.length > 0){
    /* se o usuario tem pelo menos uma daquelas roles */
    const hasAllRoles = roles.some(role =>{
      return user.roles.includes(role)
    })
    if(!hasAllRoles){
      return false
    }
  }

  return true
}
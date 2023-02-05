
import { useAuthContext } from '../contexts/authContext'
import styles from '../styles/Home.module.css'
import { FormEvent, useState } from 'react'


export default function Home() {

  const {signIn} = useAuthContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')



  async function handleSubmit(event:FormEvent){
    event.preventDefault()
    const data={
      email, 
      password
    }
    await signIn(data)
  }
  return (
   <form className={styles.container}>

    <input 
    type="email" 
    name="email"
    value={email}
    onChange={e=> setEmail(e.target.value)}
    className={styles.inputContent} placeholder="email"/>
    <input 
    type="password" 
    name="password" 
    value={password} 
    onChange={e=> (setPassword(e.target.value))}
    className={styles.inputContent} placeholder="Password"/>

    <button type='submit' onClick={handleSubmit} className={styles.buttonContent}>Login</button>

   </form>
  )
}

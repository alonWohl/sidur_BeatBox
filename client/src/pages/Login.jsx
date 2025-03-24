import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { login } from '@/store/user.actions'
import { useNavigate } from 'react-router-dom'
export function Login() {
  const [user, setUser] = useState({ username: '', password: '' })
  const navigate = useNavigate()

  const handleUserChange = (value) => {
    setUser({ ...user, username: value })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    login(user)
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full justify-center items-center">
      <form className="flex flex-col gap-4 shadow-md rounded-lg p-4 h-[500px] w-[500px] bg-white " onSubmit={handleSubmit}>
        <h2>התחברות</h2>
        <Select onValueChange={handleUserChange} value={user.username} name="username">
          <SelectTrigger>
            <SelectValue placeholder="בחר משתמש" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="moked">מוקד</SelectItem>
            <SelectItem value="tlv">תל אביב</SelectItem>
            <SelectItem value="pt">פתח תקווה</SelectItem>
            <SelectItem value="rishon">רשאון לציון</SelectItem>
            <SelectItem value="rosh">ראש העין</SelectItem>
          </SelectContent>
        </Select>
        <Input type="password" placeholder="סיסמא" onChange={handleChange} value={user.password} name="password" />
        <Button type="submit">התחבר</Button>
      </form>
    </div>
  )
}

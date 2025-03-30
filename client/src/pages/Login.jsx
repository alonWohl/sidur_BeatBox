import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { login } from '@/store/user.actions'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { UserCircle2 } from 'lucide-react'

export function Login() {
  const [user, setUser] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({ username: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleUserChange = (value) => {
    setUser({ ...user, username: value })
    setErrors((prev) => ({ ...prev, username: '' }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { username: '', password: '' }

    if (!user.username) {
      newErrors.username = 'חובה לבחור משתמש'
      isValid = false
    }

    if (!user.password) {
      newErrors.password = 'חובה להזין סיסמא'
      isValid = false
    } else if (user.password.length < 6) {
      newErrors.password = 'הסיסמא חייבת להכיל לפחות 6 תווים'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('נא למלא את כל השדות הנדרשים')
      return
    }

    try {
      setIsSubmitting(true)
      await login(user)
      toast.success('התחברת בהצלחה')
      navigate(`/`)

      // Simplified redirect logic
      // const loggedInUser = await userService.getLoggedInUser()
    } catch (error) {
      console.error('Login error:', error)
      toast.error('שגיאה בהתחברות. נא לנסות שוב.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <UserCircle2 className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">ברוכים הבאים</h2>
          <p className="mt-2 text-sm text-gray-600">התחבר כדי לנהל את המשמרות שלך</p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">בחר סניף</label>
              <Select onValueChange={handleUserChange} value={user.username} name="username" dir="rtl">
                <SelectTrigger
                  className={`w-full text-right ${errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}>
                  <SelectValue placeholder="בחר סניף" />
                </SelectTrigger>
                <SelectContent className="text-right">
                  <SelectItem value="moked" className="text-right">
                    מוקד
                  </SelectItem>
                  <SelectItem value="tlv" className="text-right">
                    תל אביב
                  </SelectItem>
                  <SelectItem value="pt" className="text-right">
                    פתח תקווה
                  </SelectItem>
                  <SelectItem value="rishon" className="text-right">
                    ראשון לציון
                  </SelectItem>
                  <SelectItem value="rosh" className="text-right">
                    ראש העין
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">סיסמא</label>
              <Input
                type="password"
                placeholder="הזן סיסמא"
                onChange={handleChange}
                value={user.password}
                name="password"
                className={`w-full ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#BE202E] cursor-pointer hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  מתחבר...
                </div>
              ) : (
                'התחבר'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

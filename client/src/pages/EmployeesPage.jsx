import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React from 'react'
import { Trash } from 'lucide-react'
import { Loader } from '@/components/Loader'
import { useUserStore } from '@/stores/useUserStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { useSystemStore } from '@/stores/useSystemStore'

const colorOptions = [
  '#FF3366', // bright pink
  '#FF6B2B', // vibrant orange
  '#4834DF', // royal blue
  '#2ECC71', // emerald green
  '#9B59B6', // amethyst purple
  '#E74C3C', // crimson red
  '#1ABC9C', // turquoise
  '#F39C12', // golden orange
  '#3498DB', // clear blue
  '#D35400', // burnt orange
  '#8E44AD', // deep purple
  '#16A085', // green sea
  '#C0392B', // dark red
  '#2980B9', // belize blue
  '#E67E22', // carrot orange
  '#27AE60', // nephritis green
  '#E84393', // hot pink
  '#00B894', // mint green
  '#6C5CE7', // soft purple
  '#00CEC9' // robin's egg blue
]

const ColorPickerPopover = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="flex items-center gap-2 p-1.5 sm:p-2 border rounded-md hover:bg-gray-50 w-full">
            <div className="w-full h-5 min-w-5 sm:w-6 sm:h-6 rounded-sm border" style={{ backgroundColor: value }} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] sm:w-[232px] p-2 sm:p-3">
          <div className="grid grid-cols-5 sm:grid-cols-4 gap-1.5 sm:gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onChange({ target: { name: 'color', value: color } })
                  setOpen(false)
                }}
                className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  value === color
                }`}
                style={{ backgroundColor: color }}
                type="button"
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function EmployeesPage() {
  const user = useUserStore((state) => state.user)
  const [employeeToEdit, setEmployeeToEdit] = useState({ name: '', color: '', branch: user?.name })
  const { employees, loadEmployees, addEmployee, removeEmployee } = useEmployeeStore((state) => ({
    employees: state.employees,
    loadEmployees: state.loadEmployees,
    addEmployee: state.addEmployee,
    removeEmployee: state.removeEmployee
  }))
  const { isLoading, filterBy, setFilterBy } = useSystemStore((state) => ({
    isLoading: state.isLoading,
    filterBy: state.filterBy,
    setFilterBy: state.setFilterBy
  }))

  useEffect(() => {
    if (user?.name) {
      setFilterBy({ name: user.name })
    }
  }, [user, setFilterBy])

  useEffect(() => {
    loadEmployees(filterBy)
  }, [filterBy, loadEmployees])

  const handleAddEmployee = async (e) => {
    e.preventDefault()

    if (employeeToEdit.name.length < 2) {
      toast.error('שם העובד חייב להכיל לפחות 2 תווים')
      return
    }

    if (employees.some((employee) => employee.name === employeeToEdit.name)) {
      toast.error('שם העובד כבר קיים')
      return
    }

    try {
      await addEmployee(employeeToEdit)
      setEmployeeToEdit({ name: '', color: '', branch: user?.name })
      toast.success('העובד נוסף בהצלחה')
    } catch (err) {
      console.error('Error adding employee:', err)
      toast.error('שגיאה בהוספת העובד')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEmployeeToEdit((prev) => ({ ...prev, [name]: value, branch: user?.name }))
  }

  const handleRemoveEmployee = async (employeeId) => {
    try {
      await removeEmployee(employeeId)
      toast.success('העובד הוסר בהצלחה')
    } catch (err) {
      console.error('Error removing employee:', err)
      toast.error('שגיאה בהסרת העובד')
    }
  }

  const handleBranchChange = (value) => {
    setFilterBy({ name: value })
    setEmployeeToEdit((prev) => ({ ...prev, branch: value }))
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96 animate-in fade-in duration-500">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">אנא התחבר כדי להציג את העובדים</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-300 px-4 space-y-6 max-w-[1900px] mx-auto pt-4">
      {isLoading && <Loader />}

      <div className="flex gap-2 items-center justify-between w-full">
        {user.isAdmin && (
          <Select onValueChange={handleBranchChange} value={filterBy.name} className="w-full sm:w-auto">
            <SelectTrigger className="h-8 sm:h-10 text-sm sm:text-base justify-self-start">
              <SelectValue placeholder="בחר סניף" />
            </SelectTrigger>
            <SelectContent>
              {['מוקד', 'תל אביב', 'פתח תקווה', 'רשאון לציון', 'ראש העין'].map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {employees.map((employee) => (
          <div key={employee.id} className="flex flex-col gap-2 p-4 border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: employee.color }} />
                <h3 className="text-lg font-medium">{employee.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleRemoveEmployee(employee.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">סניף:</span>
              <span className="text-sm font-medium">{employee.branch}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">הוסף עובד חדש</h2>
        <form onSubmit={handleAddEmployee} className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              שם העובד
            </label>
            <Input id="name" name="name" value={employeeToEdit.name} onChange={handleChange} placeholder="הכנס שם עובד" className="h-10" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="color" className="text-sm font-medium">
              צבע
            </label>
            <ColorPickerPopover value={employeeToEdit.color} onChange={handleChange} />
          </div>
          <Button type="submit" className="mt-2">
            הוסף עובד
          </Button>
        </form>
      </div>
    </div>
  )
}

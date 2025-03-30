import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { loadEmployees, removeEmployee, updateEmployee, addEmployee } from '../store/employee.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React from 'react'
import { Trash } from 'lucide-react'

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
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border" style={{ backgroundColor: value }} />
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
                className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
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
  const { user } = useSelector((storeState) => storeState.userModule)
  const [employeeToEdit, setEmployeeToEdit] = useState({ name: '', color: '', branch: user?.name })
  const employees = useSelector((storeState) => storeState.employeeModule.employees)
  useEffect(() => {
    loadEmployees()
  }, [])

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
      setEmployeeToEdit({ name: '', color: '', branch: '' })
      toast.success('עובד נוסף בהצלחה')
    } catch (err) {
      const errorMessage = err.response?.data?.err || err.message || 'שגיאה בהוספת עובד'
      toast.error(errorMessage)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEmployeeToEdit({ ...employeeToEdit, [name]: value })
  }

  const handleUpdateEmployee = async (e, employee) => {
    const updatedEmployee = { ...employee, color: e.target.value }
    try {
      await updateEmployee(updatedEmployee)
    } catch (err) {
      const errorMessage = err.response?.data?.err || err.message || 'שגיאה בעדכון עובד'
      toast.error(errorMessage)
    }
  }

  const handleRemoveEmployee = (employeeId) => {
    removeEmployee(employeeId)
  }

  const handleBranchChange = (value) => {
    setEmployeeToEdit({ ...employeeToEdit, branch: value })
  }

  return (
    <div className="flex flex-col h-full items-center p-4">
      <form className="flex flex-col items-center gap-2 mt-8 sm:mt-16 w-full max-w-md" onSubmit={handleAddEmployee}>
        <h2 className="text-lg sm:text-xl font-semibold">הוסף עובד</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 sm:mt-4 w-full">
          <Input
            type="text"
            placeholder="שם"
            name="name"
            value={employeeToEdit.name}
            onChange={handleChange}
            className="text-sm sm:text-base"
            tabIndex={1}
            autoFocus
          />
          <ColorPickerPopover value={employeeToEdit.color} onChange={handleChange} />
          {user?.isAdmin && (
            <Select name="branch" value={employeeToEdit.branch} onValueChange={handleBranchChange} className="w-full sm:w-auto">
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="בחר סניף" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="מוקד">מוקד</SelectItem>
                <SelectItem value="תל אביב">תל אביב</SelectItem>
                <SelectItem value="פתח תקווה">פתח תקווה</SelectItem>
                <SelectItem value="רשאון לציון">רשאון לציון</SelectItem>
                <SelectItem value="ראש העין">ראש העין</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button className="w-full sm:w-auto text-sm sm:text-base">הוסף</Button>
        </div>
      </form>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 container mt-8 sm:mt-16 w-full max-w-6xl">
        {employees.length === 0 && <li className="text-center text-gray-500 col-span-full text-sm sm:text-base">אין עובדים</li>}
        {employees.map((employee) => (
          <li key={employee.id} className="flex flex-col p-3 sm:p-4 gap-2 sm:gap-3 bg-white rounded-lg shadow-sm border">
            <h2 className="text-sm sm:text-md font-bold truncate" style={{ color: employee.color }}>
              {employee.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">סניף: {employee.branch}</p>

            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm text-gray-500">צבע</p>
              <ColorPickerPopover value={employee.color} onChange={(e) => handleUpdateEmployee(e, employee)} />
            </div>

            <Button onClick={() => handleRemoveEmployee(employee.id)} className="text-xs sm:text-sm mt-auto" variant="destructive">
              הסר
              <Trash className="w-4 h-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

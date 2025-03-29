import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { loadEmployees, removeEmployee, updateEmployee, addEmployee } from '../store/employee.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React from 'react'

const colorOptions = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#45B7D1', // blue
  '#96CEB4', // green
  '#FFEEAD', // yellow
  '#D4A5A5', // pink
  '#9B59B6', // purple
  '#3498DB', // bright blue
  '#E67E22', // orange
  '#2ECC71', // emerald
  '#F1C40F', // sun yellow
  '#E74C3C', // crimson
  '#000000', // black
  '#FF0000', // red
  '#00FF00', // green
  '#0000FF', // blue
  '#FFFF00', // yellow
  '#FFA500', // orange
  '#800080', // purple
  '#FFC0CB', // pink
  '#808080', // gray
  '#008000', // green
  '#000080', // blue
  '#800000' // maroon
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
  const [employeeToEdit, setEmployeeToEdit] = useState({ name: '', color: '#000000', branch: '' })
  const { user } = useSelector((storeState) => storeState.userModule)
  const employees = useSelector((storeState) => storeState.employeeModule.employees)
  useEffect(() => {
    loadEmployees()
  }, [])

  const handleAddEmployee = async (e) => {
    e.preventDefault()

    const isDuplicate = employees.some((employee) => {
      return employee.color.toLowerCase() === employeeToEdit.color.toLowerCase()
    })

    if (isDuplicate) {
      toast.error('צבע זה כבר קיים')
      return
    }

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
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEmployeeToEdit({ ...employeeToEdit, [name]: value })
  }

  const handleUpdateEmployee = (e, employee) => {
    const updatedEmployee = { ...employee, color: e.target.value }
    updateEmployee(updatedEmployee)
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
                <SelectItem value="moked">מוקד</SelectItem>
                <SelectItem value="tlv">תל אביב</SelectItem>
                <SelectItem value="pt">פתח תקווה</SelectItem>
                <SelectItem value="rishon">רשאון לציון</SelectItem>
                <SelectItem value="rosh">ראש העין</SelectItem>
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
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

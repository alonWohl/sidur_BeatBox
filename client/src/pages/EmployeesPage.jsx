import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import React from 'react'
import { Trash, PlusCircle, Search, UserPlus, Filter } from 'lucide-react'
import { Loader } from '@/components/Loader'
import { useUserStore } from '@/stores/useUserStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { useSystemStore } from '@/stores/useSystemStore'
import { useEffectUpdate } from '@/hooks/useEffectUpdate'

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
          <button
            type="button"
            className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50 w-full transition-all duration-200 focus:ring-2 focus:ring-offset-1 focus:ring-primary">
            <div className="w-6 h-6 rounded-md border shadow-sm transition-transform duration-200" style={{ backgroundColor: value }} />
            <span className="text-gray-600 text-sm">בחר צבע</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-3">
          <div className="grid grid-cols-5 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                className={`w-10 h-10 rounded-md shadow-sm transition-all hover:scale-110 active:scale-95 hover:shadow-md ${
                  value === color ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                onClick={() => {
                  onChange({ target: { name: 'color', value: color } })
                  setOpen(false)
                }}
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
  const employees = useEmployeeStore((state) => state.employees)
  const loadEmployees = useEmployeeStore((state) => state.loadEmployees)
  const addEmployee = useEmployeeStore((state) => state.addEmployee)
  const removeEmployee = useEmployeeStore((state) => state.removeEmployee)
  const isLoading = useSystemStore((state) => state.isLoading)
  const filterBy = useSystemStore((state) => state.filterBy)
  console.log('🚀 ~ EmployeesPage ~ filterBy:', filterBy)
  const setFilterBy = useSystemStore((state) => state.setFilterBy)

  const [employeeToEdit, setEmployeeToEdit] = useState({
    name: '',
    color: colorOptions[0], // Default to first color
    branch: user?.name || ''
  })
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadEmployees(filterBy)
  }, [filterBy])

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
      setEmployeeToEdit({
        name: '',
        color: colorOptions[0],
        branch: user?.name || ''
      })
      setShowAddForm(false)
      toast.success('העובד נוסף בהצלחה')
    } catch (err) {
      console.error('Error adding employee:', err)
      toast.error('שגיאה בהוספת העובד')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEmployeeToEdit((prev) => ({
      ...prev,
      [name]: value,
      branch: user?.name || prev.branch
    }))
  }

  const confirmDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee)
    setShowDeleteDialog(true)
  }

  const handleRemoveEmployee = async () => {
    if (!employeeToDelete) return

    try {
      await removeEmployee(employeeToDelete.id)
      setShowDeleteDialog(false)
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

  const filteredEmployees = employees.filter((employee) => employee.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96 animate-in fade-in duration-500">
        <div className="text-center space-y-4 bg-gray-50 p-8 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800">ברוכים הבאים לניהול העובדים</h3>
          <p className="text-gray-600">אנא התחבר כדי להציג את העובדים</p>
          <Button variant="outline" className="mt-2">
            התחבר
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen pb-24 overflow-y-auto overscroll-contain">
      <div className="flex flex-col w-full animate-in fade-in duration-300 p-4 space-y-6 max-w-[1900px] mx-auto">
        {isLoading && <Loader />}

        <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <UserPlus className="h-6 w-6" />
            <h1>ניהול עובדים</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="חיפוש עובדים..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4" />
            </div>

            {user.isAdmin && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <Select onValueChange={handleBranchChange} value={filterBy?.name} className="w-full sm:w-auto">
                  <SelectTrigger className="h-10 text-base">
                    <SelectValue placeholder="בחר סניף" />
                  </SelectTrigger>
                  <SelectContent>
                    {['מוקד', 'תל אביב', 'פתח תקווה', 'ראשון לציון', 'ראש העין'].map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>{showAddForm ? 'סגור טופס' : 'הוסף עובד'}</span>
            </Button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border animate-in fade-in-0 slide-in-from-top-5 duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              הוסף עובד חדש
            </h2>
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
              <div className="flex gap-2 mt-2">
                <Button type="submit" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  הוסף עובד
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  בטל
                </Button>
              </div>
            </form>
          </div>
        )}

        {filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-gray-50 p-12 rounded-lg text-center space-y-4">
            <div className="text-gray-400 p-6 rounded-full bg-gray-100">
              <UserPlus className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-medium text-gray-700">אין עובדים להצגה</h3>
            <p className="text-gray-500">התחל להוסיף עובדים חדשים או שנה את פילטר החיפוש</p>
            <Button onClick={() => setShowAddForm(true)} className="mt-4">
              הוסף עובד ראשון
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full pb-8">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex flex-col gap-2 p-5 border rounded-xl shadow-sm hover:shadow-md transition-all bg-white overflow-hidden group animate-in fade-in-50 duration-300"
                style={{ borderTop: `4px solid ${employee.color}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ backgroundColor: employee.color }}>
                      {employee.name.charAt(0)}
                    </div>
                    <h3 className="text-lg font-medium">{employee.name}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50"
                    onClick={() => confirmDeleteEmployee(employee)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <span className="text-sm">סניף:</span>
                  <span className="text-sm font-medium px-2 py-0.5 bg-gray-100 rounded-full">{employee.branch}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את העובד?</AlertDialogTitle>
            <AlertDialogDescription>
              {employeeToDelete && `עובד "${employeeToDelete.name}" יימחק לצמיתות. פעולה זו אינה ניתנת לביטול.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveEmployee} className="bg-red-500 hover:bg-red-600">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import { useEffect, useState } from 'react'
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
import { Trash, PlusCircle, Search, UserPlus, Check, X, Info, Building2, Palette, ClipboardList, User, AlertCircle, Pencil } from 'lucide-react'
import { Loader } from '@/components/Loader'
import { useUserStore } from '@/stores/useUserStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { useSystemStore } from '@/stores/useSystemStore'
import { Checkbox } from '@/components/ui/checkbox'

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

// Define department options
const DEPARTMENTS = ['manager', 'waiters', 'cooks']
const DEPARTMENT_NAMES = {
  manager: 'אחמ"ש',
  waiters: 'מלצרים',
  cooks: 'טבחים'
}

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
            <Palette className="h-4 w-4 text-gray-500 mr-1" />
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
  const updateEmployee = useEmployeeStore((state) => state.updateEmployee)
  const removeEmployee = useEmployeeStore((state) => state.removeEmployee)
  const isLoading = useSystemStore((state) => state.isLoading)
  const filterBy = useSystemStore((state) => state.filterBy)
  const setFilterBy = useSystemStore((state) => state.setFilterBy)

  const [employeeToEdit, setEmployeeToEdit] = useState({
    name: '',
    color: colorOptions[0], // Default to first color
    branch: user?.name || '',
    departments: [] // Start with no departments selected
  })
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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

    // Check if at least one department is selected (only for non-Moked branches)
    const isMoked = employeeToEdit.branch === 'מוקד'
    if (!isMoked && (!employeeToEdit.departments || employeeToEdit.departments.length === 0)) {
      toast.error('יש לבחור לפחות מחלקה אחת')
      return
    }

    try {
      // For Moked employees, set departments to empty array
      const employeeData = { ...employeeToEdit }
      if (isMoked) {
        employeeData.departments = [] // Empty departments for Moked employees
      }
      await addEmployee(employeeData)
      setEmployeeToEdit({
        name: '',
        color: colorOptions[0],
        branch: user?.name || '',
        departments: [] // Reset to no departments
      })
      setShowAddForm(false)
      toast.success('העובד נוסף בהצלחה')
    } catch (err) {
      console.error('Error adding employee:', err)
      // Display the specific error message from the server
      const errorMessage = err.response?.data?.err || 'שגיאה בהוספת העובד'
      toast.error(errorMessage)
    }
  }

  const handleEditEmployee = (employee) => {
    setEmployeeToEdit({
      ...employee,
      departments: employee.departments || []
    })
    setIsEditing(true)
    setShowAddForm(true)
  }

  const handleUpdateEmployee = async (e) => {
    e.preventDefault()

    if (employeeToEdit.name.length < 2) {
      toast.error('שם העובד חייב להכיל לפחות 2 תווים')
      return
    }

    if (employees.some((employee) => employee.name === employeeToEdit.name && employee.id !== employeeToEdit.id)) {
      toast.error('שם העובד כבר קיים')
      return
    }

    const isMoked = employeeToEdit.branch === 'מוקד'
    if (!isMoked && (!employeeToEdit.departments || employeeToEdit.departments.length === 0)) {
      toast.error('יש לבחור לפחות מחלקה אחת')
      return
    }

    try {
      // For Moked employees, set departments to empty array
      const employeeData = { ...employeeToEdit }
      if (isMoked) {
        employeeData.departments = [] // Empty departments for Moked employees
      }
      await updateEmployee(employeeData)
      setEmployeeToEdit({
        name: '',
        color: colorOptions[0],
        branch: user?.name || '',
        departments: [] // Reset to no departments
      })
      setIsEditing(false)
      setShowAddForm(false)
      toast.success('העובד עודכן בהצלחה')
    } catch (err) {
      console.error('Error updating employee:', err)
      // Display the specific error message from the server
      const errorMessage = err.response?.data?.err || 'שגיאה בעדכון העובד'
      toast.error(errorMessage)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEmployeeToEdit((prev) => {
      const newState = {
        ...prev,
        [name]: value,
        branch: user?.name || prev.branch
      }

      // If branch is changed to "מוקד", clear departments
      if (name === 'branch' && value === 'מוקד') {
        newState.departments = []
      }

      return newState
    })
  }

  const handleDepartmentChange = (departmentId) => {
    setEmployeeToEdit((prev) => {
      const departments = prev.departments || []
      if (departments.includes(departmentId)) {
        // If already selected, remove it (unless it's the last one)
        if (departments.length === 1) {
          toast.error('עובד חייב להיות שייך למחלקה אחת לפחות')
          return prev
        }
        return { ...prev, departments: departments.filter((id) => id !== departmentId) }
      } else {
        // Otherwise add it
        return { ...prev, departments: [...departments, departmentId] }
      }
    })
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
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header section - fixed */}
      <div className="flex-shrink-0 p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <UserPlus className="h-6 w-6 text-[#BE202E]" />
            <h1>ניהול עובדים</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="חיפוש עובדים..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4" />
            </div>

            {user.isAdmin && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-600" />
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

            <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-1 bg-[#BE202E] hover:bg-[#BE202E]/90">
              <PlusCircle className="h-4 w-4" />
              <span>{showAddForm ? 'סגור טופס' : 'הוסף עובד'}</span>
            </Button>
          </div>
        </div>

        {/* Form section - also fixed */}
        {showAddForm && (
          <form
            onSubmit={isEditing ? handleUpdateEmployee : handleAddEmployee}
            className="bg-white p-6 rounded-xl shadow-md space-y-4 border animate-in fade-in duration-300 mt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#BE202E]" />
              {isEditing ? 'עריכת עובד' : 'הוספת עובד חדש'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <User className="h-4 w-4 text-gray-500" />
                  שם העובד
                </label>
                <Input
                  id="name"
                  name="name"
                  value={employeeToEdit.name}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="הכנס שם עובד"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Palette className="h-4 w-4 text-gray-500" />
                  צבע עובד
                </label>
                <ColorPickerPopover value={employeeToEdit.color} onChange={handleChange} />
              </div>

              {/* Department selection - only show for non-Moked branches */}
              {employeeToEdit.branch !== 'מוקד' && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <ClipboardList className="h-4 w-4 text-gray-500" />
                    מחלקות
                  </label>
                  <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-gray-50">
                    {DEPARTMENTS.map((deptId) => (
                      <div key={deptId} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`dept-${deptId}`}
                          checked={employeeToEdit.departments?.includes(deptId)}
                          onCheckedChange={() => handleDepartmentChange(deptId)}
                        />
                        <label
                          htmlFor={`dept-${deptId}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                          {DEPARTMENT_NAMES[deptId]}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3 text-gray-400" />
                    יש לבחור לפחות מחלקה אחת
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 space-x-reverse mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setIsEditing(false)
                  setEmployeeToEdit({
                    name: '',
                    color: colorOptions[0],
                    branch: user?.name || '',
                    departments: []
                  })
                }}
                className="flex items-center gap-1">
                <X className="h-4 w-4" />
                ביטול
              </Button>
              <Button type="submit" className="bg-[#BE202E] hover:bg-[#BE202E]/90 flex items-center gap-1">
                <Check className="h-4 w-4" />
                {isEditing ? 'עדכן עובד' : 'הוסף עובד'}
              </Button>
            </div>
          </form>
        )}

        {/* Loading indicator - fixed */}
        {isLoading && (
          <div className="mt-4 flex justify-center">
            <Loader />
          </div>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-grow overflow-hidden min-h-0 p-4 pt-0">
        <div className="h-full overflow-y-auto pr-1 overscroll-contain scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filteredEmployees.length === 0 && searchQuery === '' && !isLoading ? (
            <div className="flex flex-col items-center justify-center bg-gray-50 p-12 rounded-lg text-center space-y-4">
              <div className="text-gray-400 p-6 rounded-full bg-gray-100">
                <UserPlus className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-medium text-gray-700">אין עובדים להצגה</h3>
              <p className="text-gray-500">התחל להוסיף עובדים חדשים או שנה את פילטר החיפוש</p>
              <Button onClick={() => setShowAddForm(true)} className="mt-4 bg-[#BE202E] hover:bg-[#BE202E]/90">
                הוסף עובד ראשון
              </Button>
            </div>
          ) : filteredEmployees.length === 0 && searchQuery !== '' ? (
            <div className="flex flex-col items-center justify-center bg-gray-50 p-12 rounded-lg text-center space-y-4">
              <div className="text-gray-400 p-6 rounded-full bg-gray-100">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-medium text-gray-700">אין תוצאות חיפוש</h3>
              <p className="text-gray-500">לא נמצאו עובדים התואמים את החיפוש שלך</p>
              <Button onClick={() => setSearchQuery('')} variant="outline" className="mt-4">
                נקה חיפוש
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300 pb-4">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all group">
                  <div className="p-4 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: employee.color }}>
                        <span className="text-white font-bold text-lg">{employee.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                        {/* Display departments */}
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {employee.departments?.map((deptId) => (
                            <span key={deptId} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                              {DEPARTMENT_NAMES[deptId]}
                            </span>
                          ))}
                          {employee.departments?.length === 0 && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Building2 className="h-3 w-3" />
                              מוקד
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 opacity-70 group-hover:opacity-100"
                        onClick={() => handleEditEmployee(employee)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 opacity-70 group-hover:opacity-100"
                        onClick={() => confirmDeleteEmployee(employee)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              האם אתה בטוח שברצונך למחוק את העובד?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {employeeToDelete && `עובד "${employeeToDelete.name}" יימחק לצמיתות. פעולה זו אינה ניתנת לביטול.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveEmployee} className="bg-red-500 hover:bg-red-600 flex items-center gap-1">
              <Trash className="h-4 w-4" />
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

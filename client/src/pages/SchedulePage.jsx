import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { Clock } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useSystemStore } from '@/stores/useSystemStore'
import { useScheduleStore } from '@/stores/useScheduleStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { useUserStore } from '@/stores/useUserStore'
import { Loader } from '@/components/Loader'
import { ScheduleTable } from '@/components/ScheduleTable'

export function SchedulePage() {
  const user = useUserStore((state) => state.user)
  const filterBy = useSystemStore((state) => state.filterBy)
  const isLoading = useSystemStore((state) => state.isLoading)
  const setFilterBy = useSystemStore((state) => state.setFilterBy)

  const loadSchedules = useScheduleStore((state) => state.loadSchedules)
  const updateSchedule = useScheduleStore((state) => state.updateSchedule)
  const updateScheduleOptimistic = useScheduleStore((state) => state.updateScheduleOptimistic)
  const schedules = useScheduleStore((state) => state.schedules)

  const employees = useEmployeeStore((state) => state.employees)
  const loadEmployees = useEmployeeStore((state) => state.loadEmployees)

  const [isSharing, setIsSharing] = useState(false)
  const [currentSchedule, setCurrentSchedule] = useState(null)

  // Load initial data
  useEffect(() => {
    loadSchedules(filterBy)
    loadEmployees(filterBy)
  }, [filterBy])

  // Update currentSchedule when schedules change
  useEffect(() => {
    console.log('Schedules updated:', schedules)
    if (schedules?.length > 0) {
      console.log('Setting current schedule:', schedules[0])
      setCurrentSchedule(schedules[0])
    }
  }, [schedules])

  const handleUpdateSchedule = async (schedule, employeeId, day, role, position) => {
    if (!schedule?.id) return

    try {
      const scheduleToUpdate = JSON.parse(JSON.stringify(schedule))
      scheduleToUpdate.week = filterBy.week

      const positionNum = parseInt(position)

      let dayIndex = scheduleToUpdate.days.findIndex((d) => d.name === day)
      if (dayIndex === -1) {
        scheduleToUpdate.days.push({ name: day, shifts: [] })
        dayIndex = scheduleToUpdate.days.length - 1
      }

      if (!scheduleToUpdate.days[dayIndex].shifts) {
        scheduleToUpdate.days[dayIndex].shifts = []
      }

      scheduleToUpdate.days[dayIndex].shifts = scheduleToUpdate.days[dayIndex].shifts.filter(
        (shift) => !(shift.role === role && shift.position === positionNum)
      )

      if (employeeId && employeeId !== 'undefined') {
        scheduleToUpdate.days[dayIndex].shifts.push({
          role,
          position: positionNum,
          employeeId
        })
      }

      console.log('Updating schedule:', scheduleToUpdate)
      await updateScheduleOptimistic(scheduleToUpdate)
      setCurrentSchedule({ ...scheduleToUpdate })
    } catch (err) {
      console.error('Error updating schedule:', err)
      toast.error('שגיאה בעדכון המשמרת')
    }
  }

  const handleClearBoard = async (schedules) => {
    if (!schedules?.length) return
    try {
      const clearedSchedule = {
        ...schedules[0],
        days: schedules[0].days.map((day) => ({ ...day, shifts: [] }))
      }
      await updateSchedule(clearedSchedule)
      toast.success('הסידור נוקה בהצלחה')
    } catch {
      toast.error('שגיאה בניקוי הסידור')
    }
  }

  const getAssignedEmployee = (schedule, day, role, position) => {
    if (!schedule?.days) {
      console.log('No days in schedule:', schedule)
      return null
    }

    const dayData = schedule.days.find((d) => d.name === day)
    if (!dayData?.shifts) {
      console.log('No shifts for day:', day, 'in schedule:', schedule)
      return null
    }

    const shift = dayData.shifts.find((s) => s.role === role && s.position === parseInt(position))
    if (!shift?.employeeId) {
      console.log('No employee for shift:', { day, role, position })
      return null
    }

    const employee = employees.find((e) => e.id === shift.employeeId)
    if (!employee) {
      console.log('Employee not found:', shift.employeeId)
      return null
    }

    return employee
  }

  const handleRemoveEmployee = async (schedule, day, role, position) => {
    if (!schedule?.id) return

    try {
      const scheduleToUpdate = JSON.parse(JSON.stringify(schedule))
      scheduleToUpdate.week = filterBy.week

      const dayObj = scheduleToUpdate.days.find((d) => d.name === day)
      if (!dayObj) return

      dayObj.shifts = dayObj.shifts.filter((shift) => !(shift.role === role && shift.position === position))

      await updateScheduleOptimistic(scheduleToUpdate)
      setCurrentSchedule(scheduleToUpdate)
    } catch (err) {
      console.error('Error removing employee:', err)
      toast.error('שגיאה בהסרת העובד')
    }
  }

  const handleSetSharing = (value) => {
    setIsSharing(value)
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96 animate-in fade-in duration-500">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">אנא התחבר כדי להציג את הסידור</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-300 space-y-3 max-w-[1900px] mx-auto">
      {isLoading && <Loader />}

      {/* New streamlined header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 max-w-[1900px] mx-auto">
          {/* Left side: Brand and title */}
          <div className="flex pr-1 md:mr-3 items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#BE202E]">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-gray-800">סידור עבודה</h1>
          </div>

          {/* Right side: Week toggle and branch selector */}
          <div className="flex pl-3 items-center gap-2">
            {/* Week selector as pill buttons */}
            <div className="flex bg-gray-100 rounded-full p-0.5 border border-gray-200">
              <button
                onClick={() => setFilterBy({ ...filterBy, week: 'current' })}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  filterBy.week === 'current' ? 'bg-[#BE202E] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}>
                שבוע נוכחי
              </button>
              <button
                onClick={() => setFilterBy({ ...filterBy, week: 'next' })}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  filterBy.week === 'next' ? 'bg-[#BE202E] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}>
                שבוע הבא
              </button>
            </div>

            {/* Branch selector as a simple dropdown */}
            {user.isAdmin && (
              <Select onValueChange={(value) => setFilterBy({ ...filterBy, name: value })} value={filterBy.name}>
                <SelectTrigger className="h-8 text-xs border-gray-200 bg-white min-w-[90px] px-2">
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
            )}
          </div>
        </div>
      </div>

      <div
        className="overflow-x-auto scrollbar-hide px-2 pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
        <div className="min-w-[640px]">
          <ScheduleTable
            type={filterBy.name}
            currentSchedule={currentSchedule}
            getAssignedEmployee={getAssignedEmployee}
            handleRemoveEmployee={handleRemoveEmployee}
            handleUpdateSchedule={handleUpdateSchedule}
            employees={employees}
            isSharing={isSharing}
            onClearSchedule={handleClearBoard}
            weekMode={filterBy.week}
            setIsSharing={handleSetSharing}
          />
        </div>
      </div>
    </div>
  )
}

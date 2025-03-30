import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { MokedSchedule } from '@/components/MokedSchedule'
import { BranchSchedule } from '@/components/BranchSchedule'

import domtoimage from 'dom-to-image-more'
import { toast } from 'react-hot-toast'
import { Loader2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { setFilterBy } from '@/store/system.reducer'
import { loadSchedules, updateSchedule } from '@/store/schedule.actions'
import { loadEmployees } from '@/store/employee.actions'

export function SchedulePage() {
  const { user } = useSelector((storeState) => storeState.userModule)
  const { filterBy } = useSelector((storeState) => storeState.systemModule)
  const { schedules } = useSelector((storeState) => storeState.scheduleModule)
  const { employees } = useSelector((storeState) => storeState.employeeModule)

  const [isUpdating, setIsUpdating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    if (!filterBy.username) {
      setFilterBy({ username: user?.username })
    }
  }, [user, filterBy])

  useEffect(() => {
    loadSchedules(filterBy)
    loadEmployees(filterBy)
  }, [filterBy])

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const node = document.getElementById('schedule-table-for-share')
      const dataUrl = await domtoimage.toPng(node)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      if (isMobile) {
        // Mobile: Direct WhatsApp share
        const whatsappUrl = `whatsapp://send?text=סידור עבודה שבועי`
        window.location.href = whatsappUrl
      } else {
        // Desktop: Download image and open WhatsApp Web
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'schedule.png'
        link.click()
        window.open('https://web.whatsapp.com', '_blank')
      }
    } catch (error) {
      console.error('Share error:', error)
      toast.error('שגיאה בשיתוף')
    } finally {
      setIsSharing(false)
    }
  }

  const handleUpdateSchedule = async (schedule, employeeId, day, role, position) => {
    if (!schedule || !schedule.id) {
      console.error('Invalid schedule:', { schedule })
      return
    }

    try {
      setIsUpdating(true)
      const scheduleToUpdate = JSON.parse(JSON.stringify(schedule))
      const positionNum = parseInt(position)

      console.log('Starting update with:', {
        employeeId,
        day,
        role,
        position: positionNum,
        scheduleId: schedule.id
      })

      // Find or create the day
      let dayIndex = scheduleToUpdate.days.findIndex((d) => d.name === day)
      if (dayIndex === -1) {
        console.log('Creating new day:', day)
        dayIndex = scheduleToUpdate.days.push({ name: day, shifts: [] }) - 1
      }

      // Ensure shifts array exists
      if (!scheduleToUpdate.days[dayIndex].shifts) {
        scheduleToUpdate.days[dayIndex].shifts = []
      }

      if (employeeId && typeof employeeId === 'object' && employeeId.type === 'move') {
        const { sourceDay, sourceRole, sourcePosition, employeeId: actualEmployeeId } = employeeId
        console.log('Moving employee:', { sourceDay, sourceRole, sourcePosition, actualEmployeeId })

        // Find source and destination days
        const sourceDayIndex = scheduleToUpdate.days.findIndex((d) => d.name === sourceDay)

        if (sourceDayIndex === -1) return

        // Get employees at both positions
        const sourceEmployee = scheduleToUpdate.days[sourceDayIndex].shifts.find(
          (shift) => shift.role === sourceRole && shift.position === sourcePosition
        )
        const destEmployee = scheduleToUpdate.days[dayIndex].shifts.find((shift) => shift.role === role && shift.position === positionNum)

        // Remove source employee
        scheduleToUpdate.days[sourceDayIndex].shifts = scheduleToUpdate.days[sourceDayIndex].shifts.filter(
          (shift) => !(shift.role === sourceRole && shift.position === sourcePosition)
        )

        // Remove destination employee if exists
        scheduleToUpdate.days[dayIndex].shifts = scheduleToUpdate.days[dayIndex].shifts.filter(
          (shift) => !(shift.role === role && shift.position === positionNum)
        )

        // Add source employee to destination
        scheduleToUpdate.days[dayIndex].shifts.push({
          role,
          position: positionNum,
          employeeId: actualEmployeeId
        })

        // Move destination employee to source if exists
        if (destEmployee) {
          scheduleToUpdate.days[sourceDayIndex].shifts.push({
            role: sourceRole,
            position: sourcePosition,
            employeeId: destEmployee.employeeId
          })
        }
      } else if (employeeId === null || employeeId === 'undefined') {
        // Remove employee
        scheduleToUpdate.days[dayIndex].shifts = scheduleToUpdate.days[dayIndex].shifts.filter(
          (shift) => !(shift.role === role && shift.position === positionNum)
        )
      } else {
        // Add new employee
        console.log('Current shifts before update:', scheduleToUpdate.days[dayIndex].shifts)

        // Remove any existing employee in that position
        scheduleToUpdate.days[dayIndex].shifts = scheduleToUpdate.days[dayIndex].shifts.filter(
          (shift) => !(shift.role === role && shift.position === positionNum)
        )

        // Add the new employee
        const newShift = {
          role,
          position: positionNum,
          employeeId
        }

        scheduleToUpdate.days[dayIndex].shifts.push(newShift)

        console.log('Added new shift:', newShift)
        console.log('Updated shifts:', scheduleToUpdate.days[dayIndex].shifts)
      }

      // Verify the update before saving
      const updatedDay = scheduleToUpdate.days[dayIndex]
      console.log('Day after update:', {
        name: updatedDay.name,
        shiftsCount: updatedDay.shifts.length,
        shifts: updatedDay.shifts
      })

      console.log('Saving schedule:', {
        id: scheduleToUpdate.id,
        branchId: scheduleToUpdate.branchId,
        daysCount: scheduleToUpdate.days.length
      })

      await updateSchedule(scheduleToUpdate)
      console.log('Schedule updated successfully')
    } catch (error) {
      console.error('Error updating schedule:', error)
      toast.error('שגיאה בעדכון המשמרת')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClearBoard = async (schedule) => {
    if (!schedule) return

    try {
      const clearedSchedule = { ...schedule }
      clearedSchedule.days = clearedSchedule.days.map((day) => ({
        ...day,
        shifts: []
      }))

      await updateSchedule(clearedSchedule)
      toast.success('הסידור נוקה בהצלחה')
    } catch (err) {
      console.error('Failed to clear schedule:', err)
      toast.error('שגיאה בניקוי הסידור')
    }
  }

  const getAssignedEmployee = (schedule, day, role, position) => {
    if (!schedule) return null

    const dayObj = schedule.days?.find((d) => d.name === day)
    if (!dayObj) return null

    const shift = dayObj.shifts.find((s) => s.role === role && s.position === position)
    if (!shift) return null

    return employees.find((w) => w.id === shift.employeeId)
  }

  const handleEmployeeClick = async (day, role, position) => {
    try {
      await handleUpdateSchedule(schedules, null, day, role, position)
    } catch (error) {
      console.error('Error removing employee:', error)
      toast.error('שגיאה בהסרת העובד')
    }
  }

  const onSetFilterBy = (value) => {
    setFilterBy({ username: value })
  }

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <span className="text-gray-600 font-medium">מעדכן...</span>
      </div>
    </div>
  )

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
    <div className="flex flex-col h-full relative animate-in fade-in duration-300 px-4">
      {isUpdating && <LoadingOverlay />}

      <h2 className="text-xl text-center font-bold mt-4">סידור עבודה</h2>

      <div className="container mx-auto w-full my-8">
        <div className="flex items-center justify-between gap-2">
          {user.isAdmin && (
            <Select onValueChange={onSetFilterBy} value={filterBy.username}>
              <SelectTrigger>
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

          <div className="flex gap-2 justify-end w-full">
            <Button className="cursor-pointer hover:bg-[#BE202E] hover:text-white" onClick={() => handleClearBoard(schedules)} variant="outline">
              נקה סידור
            </Button>
            <Button onClick={handleShare} className="flex items-center gap-2 bg-green-500 hover:bg-green-600" disabled={isSharing}>
              {isSharing ? <span className="animate-spin">⏳</span> : <Share2 className="w-4 h-4" />}
              {isSharing ? 'מכין לשיתוף...' : 'שתף בווצאפ'}
            </Button>
          </div>
        </div>
      </div>

      {filterBy.username === 'moked' && (
        <MokedSchedule
          getAssignedEmployee={getAssignedEmployee}
          onUpdateSchedule={handleUpdateSchedule}
          isSharing={isSharing}
          handleEmployeeClick={handleEmployeeClick}
        />
      )}
      {filterBy.username !== 'moked' && (
        <BranchSchedule
          getAssignedEmployee={getAssignedEmployee}
          onUpdateSchedule={handleUpdateSchedule}
          isSharing={isSharing}
          handleEmployeeClick={handleEmployeeClick}
        />
      )}
    </div>
  )
}

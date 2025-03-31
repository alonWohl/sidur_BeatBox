import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { MokedSchedule } from '@/components/MokedSchedule'
import { BranchSchedule } from '@/components/BranchSchedule'
import domtoimage from 'dom-to-image-more'
import { toast } from 'react-hot-toast'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { setFilterBy } from '@/store/system.reducer'
import { loadSchedules, updateSchedule, updateScheduleDebounced, updateScheduleOptimistic } from '@/store/schedule.actions'
import { loadEmployees } from '@/store/employee.actions'
import { Loader } from '@/components/Loader'
import { ScheduleDraw } from '@/components/ScheduleDraw'
import { TimeDraw } from '@/components/TimeDraw'

export function SchedulePage() {
  const { user } = useSelector((storeState) => storeState.userModule)
  const { filterBy, isLoading } = useSelector((storeState) => storeState.systemModule)
  const { schedules } = useSelector((storeState) => storeState.scheduleModule)
  const { employees } = useSelector((storeState) => storeState.employeeModule)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    loadSchedules(filterBy)
    loadEmployees(filterBy)
  }, [user, filterBy])

  // Prevent scrolling during drag
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault()
    document.addEventListener('touchmove', preventDefault, { passive: false })
    return () => document.removeEventListener('touchmove', preventDefault)
  }, [])

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const node = document.getElementById('schedule-table-for-share')
      const dataUrl = await domtoimage.toPng(node)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      if (isMobile) {
        const response = await fetch(dataUrl)
        const blob = await response.blob()

        const file = new File([blob], 'schedule.png', { type: 'image/png' })

        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: 'סידור עבודה שבועי',
            text: 'סידור עבודה שבועי'
          })
        } else {
          const whatsappUrl = `whatsapp://send?text=סידור עבודה שבועי`
          window.location.href = whatsappUrl

          const link = document.createElement('a')
          link.href = dataUrl
          link.download = 'schedule.png'
          link.click()
        }
      } else {
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
    if (!schedule?.id) return

    try {
      const scheduleToUpdate = JSON.parse(JSON.stringify(schedule))
      const positionNum = parseInt(position)

      let dayIndex = scheduleToUpdate.days.findIndex((d) => d.name === day)
      if (dayIndex === -1) {
        dayIndex = scheduleToUpdate.days.push({ name: day, shifts: [] }) - 1
      }

      if (!scheduleToUpdate.days[dayIndex].shifts) {
        scheduleToUpdate.days[dayIndex].shifts = []
      }

      if (employeeId?.type === 'move') {
        const { sourceDay, sourceRole, sourcePosition, employeeId: actualEmployeeId } = employeeId
        const sourceDayIndex = scheduleToUpdate.days.findIndex((d) => d.name === sourceDay)
        if (sourceDayIndex === -1) return

        const destEmployee = scheduleToUpdate.days[dayIndex].shifts.find((shift) => shift.role === role && shift.position === positionNum)

        // Remove employees from both positions
        scheduleToUpdate.days[sourceDayIndex].shifts = scheduleToUpdate.days[sourceDayIndex].shifts.filter(
          (shift) => !(shift.role === sourceRole && shift.position === sourcePosition)
        )
        scheduleToUpdate.days[dayIndex].shifts = scheduleToUpdate.days[dayIndex].shifts.filter(
          (shift) => !(shift.role === role && shift.position === positionNum)
        )

        // Add employees to their new positions
        scheduleToUpdate.days[dayIndex].shifts.push({
          role,
          position: positionNum,
          employeeId: actualEmployeeId
        })

        if (destEmployee) {
          scheduleToUpdate.days[sourceDayIndex].shifts.push({
            role: sourceRole,
            position: sourcePosition,
            employeeId: destEmployee.employeeId
          })
        }
      } else {
        // Remove existing employee
        scheduleToUpdate.days[dayIndex].shifts = scheduleToUpdate.days[dayIndex].shifts.filter(
          (shift) => !(shift.role === role && shift.position === positionNum)
        )

        // Add new employee if not removing
        if (employeeId && employeeId !== 'undefined') {
          scheduleToUpdate.days[dayIndex].shifts.push({ role, position: positionNum, employeeId })
        }
      }
      await updateScheduleOptimistic(scheduleToUpdate)
    } catch (error) {
      toast.error('שגיאה בעדכון המשמרת')
    }
  }

  const handleClearBoard = async (schedule) => {
    if (!schedule) return
    try {
      const clearedSchedule = {
        ...schedule,
        days: schedule.days.map((day) => ({ ...day, shifts: [] }))
      }
      await updateSchedule(clearedSchedule)
      toast.success('הסידור נוקה בהצלחה')
    } catch {
      toast.error('שגיאה בניקוי הסידור')
    }
  }

  const getAssignedEmployee = (schedule, day, role, position) => {
    if (!schedule) return null
    const shift = schedule.days?.find((d) => d.name === day)?.shifts?.find((s) => s.role === role && s.position === position)
    return shift ? employees.find((w) => w.id === shift.employeeId) : null
  }

  const handleRemoveEmployee = async (schedule, day, role, position) => {
    if (!schedule?.id) return

    try {
      const scheduleToUpdate = JSON.parse(JSON.stringify(schedule))

      const dayObj = scheduleToUpdate.days.find((d) => d.name === day)

      if (!dayObj) return

      dayObj.shifts = dayObj.shifts.filter((shift) => !(shift.role === role && shift.position === position))

      await updateScheduleDebounced(scheduleToUpdate)
    } catch (error) {
      toast.error('שגיאה בהסרת העובד')
    }
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
    <div className="flex flex-col h-full relative animate-in fade-in duration-300 px-4 space-y-6">
      {isLoading && <Loader />}
      <h1 className="text-3xl text-center font-semibold font-mono text-zinc-800 my-4">סידור עבודה</h1>

      <TimeDraw className="absolute top-10 right-10 opacity-50 hidden max-w-[300px] max-h-[300px] 2xl:block" />
      <ScheduleDraw className="absolute bottom-10 left-10 opacity-50 hidden max-w-[300px] max-h-[300px] md:block md:max-w-[200px] md:max-h-[200px]" />

      <div className="container mx-auto w-full my-4">
        <div className="flex flex-col items-center gap-2 px-2">
          {user.isAdmin && (
            <Select onValueChange={(value) => setFilterBy({ ...filterBy, name: value })} value={filterBy.name} className="w-full sm:w-auto">
              <SelectTrigger className="h-8 sm:h-10 text-sm sm:text-base">
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

          <div className="flex gap-1 sm:gap-2 justify-end w-full">
            <Button
              onClick={() => handleClearBoard(schedules)}
              className="cursor-pointer hover:bg-[#BE202E] hover:text-white h-8 sm:h-10 text-sm sm:text-base px-2 sm:px-4"
              variant="outline">
              נקה סידור
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-1 sm:gap-2 bg-green-500 hover:bg-green-600 h-8 sm:h-10 text-sm sm:text-base px-2 sm:px-4">
              {isSharing ? <span className="animate-spin">⏳</span> : <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="whitespace-nowrap">{isSharing ? 'מכין...' : 'שתף'}</span>
            </Button>
          </div>
        </div>
      </div>

      {filterBy.username === 'moked' ? (
        <MokedSchedule
          getAssignedEmployee={getAssignedEmployee}
          onUpdateSchedule={handleUpdateSchedule}
          isSharing={isSharing}
          handleRemoveEmployee={handleRemoveEmployee}
        />
      ) : (
        <BranchSchedule
          getAssignedEmployee={getAssignedEmployee}
          onUpdateSchedule={handleUpdateSchedule}
          isSharing={isSharing}
          handleRemoveEmployee={handleRemoveEmployee}
        />
      )}
    </div>
  )
}

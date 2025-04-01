import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import domtoimage from 'dom-to-image-more'
import { toast } from 'react-hot-toast'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { setFilterBy } from '@/store/system.reducer'
import { loadSchedules, updateSchedule, updateScheduleOptimistic } from '@/store/schedule.actions'
import { loadEmployees } from '@/store/employee.actions'
import { Loader } from '@/components/Loader'
import { ScheduleDraw } from '@/components/ScheduleDraw'
import { TimeDraw } from '@/components/TimeDraw'
import { ScheduleTable } from '@/components/ScheduleTable'
import { EmployeesList } from '@/components/EmployeesList'
import { DndContext, DragOverlay, useSensor, useSensors, TouchSensor, MouseSensor, pointerWithin } from '@dnd-kit/core'

export function SchedulePage() {
  const { user } = useSelector((storeState) => storeState.userModule)
  const { filterBy, isLoading } = useSelector((storeState) => storeState.systemModule)
  const { schedules } = useSelector((storeState) => storeState.scheduleModule)
  const { employees } = useSelector((storeState) => storeState.employeeModule)
  const [isSharing, setIsSharing] = useState(false)
  const [currentSchedule, setCurrentSchedule] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [activeEmployee, setActiveEmployee] = useState(null)

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5
      }
    })
  )

  useEffect(() => {
    if (schedules && employees?.length > 0) {
      const initialSchedule = {
        ...schedules,
        days: schedules.days || []
      }
      setCurrentSchedule(initialSchedule)
      console.log('Setting current schedule:', initialSchedule)
    }
  }, [schedules, employees])

  useEffect(() => {
    try {
      loadSchedules(filterBy)
      loadEmployees(filterBy)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('שגיאה בטעינת הנתונים')
    }
  }, [filterBy])

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

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)

    if (active.data.current?.type === 'employee') {
      setActiveEmployee(active.data.current.employee)
    } else if (active.data.current?.type === 'tableCell') {
      setActiveEmployee(active.data.current.employee)
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || !currentSchedule) return

    try {
      if (active.data.current?.type === 'employee') {
        // Handle new employee drop
        const [day, role, position] = over.id.split('-')
        handleUpdateSchedule(currentSchedule, active.id, day, role, parseInt(position))
      } else if (active.data.current?.type === 'tableCell') {
        // Handle cell to cell move
        const [sourceDay, sourceRole, sourcePos] = active.data.current.cellId.split('-')
        const [destDay, destRole, destPosition] = over.id.split('-')

        const moveInfo = {
          type: 'move',
          sourceDay,
          sourceRole,
          sourcePosition: parseInt(sourcePos),
          employeeId: active.data.current.employee.id
        }

        handleUpdateSchedule(currentSchedule, moveInfo, destDay, destRole, parseInt(destPosition))
      }
    } catch (error) {
      console.error('Drag end error:', error)
      toast.error('שגיאה בעדכון המשמרת')
    }

    setActiveId(null)
    setActiveEmployee(null)
  }

  const handleUpdateSchedule = async (schedule, employeeId, day, role, position) => {
    if (!schedule?.id) return

    try {
      const scheduleToUpdate = JSON.parse(JSON.stringify(schedule))
      const positionNum = parseInt(position)

      let dayIndex = scheduleToUpdate.days.findIndex((d) => d.name === day)
      if (dayIndex === -1) {
        scheduleToUpdate.days.push({ name: day, shifts: [] })
        dayIndex = scheduleToUpdate.days.length - 1
      }

      if (!scheduleToUpdate.days[dayIndex].shifts) {
        scheduleToUpdate.days[dayIndex].shifts = []
      }

      if (employeeId?.type === 'move') {
        const { sourceDay, sourceRole, sourcePosition, employeeId: actualEmployeeId } = employeeId
        const sourceDayIndex = scheduleToUpdate.days.findIndex((d) => d.name === sourceDay)
        if (sourceDayIndex === -1) return

        const destEmployee = scheduleToUpdate.days[dayIndex].shifts.find((shift) => shift.role === role && shift.position === positionNum)

        scheduleToUpdate.days[sourceDayIndex].shifts = scheduleToUpdate.days[sourceDayIndex].shifts.filter(
          (shift) => !(shift.role === sourceRole && shift.position === sourcePosition)
        )

        scheduleToUpdate.days[dayIndex].shifts = scheduleToUpdate.days[dayIndex].shifts.filter(
          (shift) => !(shift.role === role && shift.position === positionNum)
        )

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
      }

      await updateScheduleOptimistic(scheduleToUpdate)
      setCurrentSchedule({ ...scheduleToUpdate })
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
    if (!schedule?.days) return null

    const dayData = schedule.days.find((d) => d.name === day)
    if (!dayData?.shifts) return null

    const shift = dayData.shifts.find((s) => s.role === role && s.position === parseInt(position))
    if (!shift?.employeeId) return null

    return employees.find((e) => e.id === shift.employeeId)
  }

  const handleRemoveEmployee = async (schedule, day, role, position) => {
    if (!schedule?.id) return

    try {
      const scheduleToUpdate = JSON.parse(JSON.stringify(schedule))

      const dayObj = scheduleToUpdate.days.find((d) => d.name === day)
      if (!dayObj) return

      dayObj.shifts = dayObj.shifts.filter((shift) => !(shift.role === role && shift.position === position))

      await updateScheduleOptimistic(scheduleToUpdate)
      setCurrentSchedule(scheduleToUpdate)
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
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
      <div className="flex flex-col h-full w-full animate-in fade-in duration-300 px-4 space-y-6 max-w-[1600px] mx-auto">
        {isLoading && <Loader />}

        <h1 className="text-3xl text-center font-semibold  text-zinc-800 my-4">סידור עבודה</h1>

        <TimeDraw className="absolute top-10 right-10 opacity-50 hidden max-w-[300px] max-h-[300px] 2xl:block" />
        <ScheduleDraw className="absolute bottom-10 left-10 opacity-50 hidden max-w-[300px] max-h-[300px] md:block md:max-w-[200px] md:max-h-[200px]" />

        <div className="flex gap-2 items-center justify-between w-full">
          {user.isAdmin && (
            <Select onValueChange={(value) => setFilterBy({ ...filterBy, name: value })} value={filterBy.name} className="w-full sm:w-auto">
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

          <div className="flex gap-2">
            <Button
              onClick={() => handleClearBoard(schedules)}
              className="cursor-pointer hover:bg-[#BE202E] hover:text-white h-8 sm:h-10 text-sm sm:text-base px-2 sm:px-4"
              variant="outline">
              נקה סידור
            </Button>
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className=" bg-green-500 hover:bg-green-600 h-8 sm:h-10 text-sm sm:text-base px-2 sm:px-4  ">
              {isSharing ? <span className="animate-spin">⏳</span> : <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="whitespace-nowrap">{isSharing ? 'מכין...' : 'שתף'}</span>
            </Button>
          </div>
        </div>

        <EmployeesList employees={employees} />

        <div className="overflow-auto touch-pan-x touch-pan-y">
          <div className="min-w-[640px]">
            <ScheduleTable
              type={filterBy.name}
              currentSchedule={currentSchedule}
              getAssignedEmployee={getAssignedEmployee}
              handleRemoveEmployee={handleRemoveEmployee}
            />
          </div>
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
          }}>
          {activeEmployee && (
            <div
              className="h-8 w-[80px] flex items-center justify-center text-white rounded-sm shadow-lg"
              style={{
                backgroundColor: activeEmployee.color,
                transform: 'scale(1.05)' // Slightly larger for better visibility
              }}>
              {activeEmployee.name}
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

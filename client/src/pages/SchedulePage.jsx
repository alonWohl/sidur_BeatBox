import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { MokedSchedule } from '@/components/MokedSchedule'
import { BranchSchedule } from '@/components/BranchSchedule'
import { useParams } from 'react-router'
import { loadWorkers } from '@/store/worker.actions'
import { showErrorMsg, showSuccessMsg } from '@/services/event-bus.service'
import { scheduleService } from '@/services/schedule/schedule.service.remote'

export function SchedulePage() {
  const { branchId } = useParams()
  const { workers } = useSelector((storeState) => storeState.workerModule)
  const { user } = useSelector((storeState) => storeState.userModule)

  const [schedule, setSchedule] = useState(null)

  const [activeWorker, setActiveWorker] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSchedule()
    loadWorkers()
  }, [branchId])

  const loadSchedule = async () => {
    try {
      setIsLoading(true)

      const schedules = await scheduleService.getScheduleByBranchId(branchId)

      setSchedule(schedules)

      setIsLoading(false)
    } catch (err) {
      console.error('Failed to load schedule:', err)
      showErrorMsg('אירעה שגיאה בטעינת הסידור')
      setIsLoading(false)
    }
  }

  const handleWorkerSelect = (worker) => {
    setActiveWorker(activeWorker?._id === worker._id ? null : worker)
  }

  const handleCellClick = async (day, role, position) => {
    if (!activeWorker || !schedule) return

    try {
      const updatedSchedule = JSON.parse(JSON.stringify(schedule))

      const dayIndex = updatedSchedule.days.findIndex((d) => d.name === day)
      if (dayIndex === -1) return

      const shiftIndex = updatedSchedule.days[dayIndex].shifts.findIndex((shift) => shift.role === role && shift.position === position)

      if (shiftIndex !== -1) {
        if (updatedSchedule.days[dayIndex].shifts[shiftIndex].workerId === activeWorker._id) {
          updatedSchedule.days[dayIndex].shifts.splice(shiftIndex, 1)
        } else {
          updatedSchedule.days[dayIndex].shifts[shiftIndex].workerId = activeWorker._id
        }
      } else {
        updatedSchedule.days[dayIndex].shifts.push({
          role,
          position,
          workerId: activeWorker._id
        })
      }

      const savedSchedule = await scheduleService.update(updatedSchedule)
      setSchedule(savedSchedule)
      showSuccessMsg('הסידור עודכן בהצלחה')
    } catch (err) {
      console.error('Failed to update schedule:', err)
      showErrorMsg('אירעה שגיאה בעדכון הסידור')
    }
  }

  const handleClearBoard = async () => {
    if (!schedule) return

    try {
      const clearedSchedule = { ...schedule }
      clearedSchedule.days = clearedSchedule.days.map((day) => ({
        ...day,
        shifts: []
      }))

      const savedSchedule = await scheduleService.update(clearedSchedule)
      setSchedule(savedSchedule)
      showSuccessMsg('הסידור נוקה בהצלחה')
    } catch (err) {
      console.error('Failed to clear schedule:', err)
      showErrorMsg('אירעה שגיאה בניקוי הסידור')
    }
  }

  const getAssignedWorker = (day, role, position) => {
    if (!schedule) return null

    const dayObj = schedule.days?.find((d) => d.name === day)
    if (!dayObj) return null

    const shift = dayObj.shifts.find((s) => s.role === role && s.position === position)
    if (!shift) return null

    return workers.find((w) => w._id === shift.workerId)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">טוען נתונים...</div>
  }

  if (!user) return <div className="text-center text-gray-500 mt-10">אנא התחבר כדי להציג את הסידור</div>

  return (
    <div className="flex flex-col h-full">
      {user && user.username === 'moked' ? (
        <MokedSchedule
          handleWorkerSelect={handleWorkerSelect}
          handleCellClick={handleCellClick}
          activeWorker={activeWorker}
          schedule={schedule}
          handleClearBoard={handleClearBoard}
          getAssignedWorker={getAssignedWorker}
        />
      ) : (
        <BranchSchedule
          branchId={branchId}
          workers={workers}
          activeWorker={activeWorker}
          handleWorkerSelect={handleWorkerSelect}
          handleCellClick={handleCellClick}
          getAssignedWorker={getAssignedWorker}
          handleClearBoard={handleClearBoard}
        />
      )}
    </div>
  )
}

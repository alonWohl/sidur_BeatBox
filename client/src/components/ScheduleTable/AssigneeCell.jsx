import { useCallback } from 'react'
import { useScheduleStore } from '@/stores/useScheduleStore'
import { toast } from 'react-hot-toast'

export function AssigneeCell({ schedule, day, role, position, employee }) {
  const { updateScheduleOptimistic } = useScheduleStore()

  const handleRemoveEmployee = useCallback(async () => {
    if (!schedule?.id) return

    try {
      const scheduleToUpdate = JSON.parse(JSON.stringify(schedule))
      const dayObj = scheduleToUpdate.days.find((d) => d.name === day)
      if (!dayObj) return

      dayObj.shifts = dayObj.shifts.filter((shift) => !(shift.role === role && shift.position === parseInt(position)))

      await updateScheduleOptimistic(scheduleToUpdate)
      toast.success('העובד הוסר בהצלחה')
    } catch (err) {
      console.error('Error removing employee:', err)
      toast.error('שגיאה בהסרת העובד')
    }
  }, [schedule, day, role, position, updateScheduleOptimistic])

  if (!employee) return null

  return (
    <div onClick={handleRemoveEmployee} className="flex items-center justify-center h-full w-full cursor-pointer hover:bg-gray-100 transition-colors">
      <span className="text-sm font-medium">{employee.name}</span>
    </div>
  )
}

import React, { useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { toast } from 'react-hot-toast'
import { EmployeesList } from '@/components/EmployeesList'
import { EmployeeCell } from '@/components/EmployeeCell'
import { format, startOfWeek, addDays } from 'date-fns'
import { he } from 'date-fns/locale' // Hebrew locale

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const SHIFTS = ['morning', 'noon', 'evening']
const SHIFT_NAMES = {
  morning: 'בוקר',
  noon: 'אמצע',
  evening: 'ערב'
}
const POSITIONS_PER_SHIFT = 3

export function MokedSchedule({ getAssignedEmployee, onUpdateSchedule, isSharing, handleEmployeeClick }) {
  const { schedules } = useSelector((storeState) => storeState.scheduleModule)
  const { employees } = useSelector((storeState) => storeState.employeeModule)
  const currentSchedule = Array.isArray(schedules) ? schedules[0] : schedules

  const handleDragEnd = useCallback(
    async (result) => {
      if (!result.destination || !currentSchedule) return

      const { destination, draggableId } = result

      try {
        if (draggableId.startsWith('inside_table_')) {
          await handleInternalMove(draggableId, destination)
        } else {
          await handleNewEmployee(draggableId, destination)
        }
      } catch (error) {
        console.error('Error in drag end:', error)
        toast.error('שגיאה בעדכון המשמרת')
      }
    },
    [onUpdateSchedule, currentSchedule]
  )

  const handleInternalMove = async (draggableId, destination) => {
    const [, , sourceDay, sourceRole, sourcePos] = draggableId.split('_')
    const [destDay, destRole, destPosition] = destination.droppableId.split('-')

    const sourceShift = currentSchedule.days
      ?.find((d) => d.name === sourceDay)
      ?.shifts?.find((s) => s.role === sourceRole && s.position === parseInt(sourcePos))

    if (!sourceShift) return

    const moveInfo = {
      type: 'move',
      sourceDay,
      sourceRole,
      sourcePosition: parseInt(sourcePos),
      employeeId: sourceShift.employeeId,
      destDay,
      destRole,
      destPosition: parseInt(destPosition)
    }

    await onUpdateSchedule(currentSchedule, moveInfo, destDay, destRole, parseInt(destPosition))
  }

  const handleNewEmployee = async (employeeId, destination) => {
    const [destDay, destRole, destPosition] = destination.droppableId.split('-')
    await onUpdateSchedule(currentSchedule, employeeId, destDay, destRole, parseInt(destPosition))
  }

  const renderCell = useCallback(
    (day, role, position) => {
      const employee = getAssignedEmployee(currentSchedule, day, role, position)
      const cellId = `${day}-${role}-${position}`

      return (
        <Droppable key={cellId} droppableId={cellId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`text-center h-10 border border-gray-200 ${snapshot.isDraggingOver ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              style={{
                backgroundColor: snapshot.isDraggingOver ? '#EFF6FF' : employee ? employee.color : '',
                minWidth: '80px',
                padding: snapshot.isDraggingOver ? '1px' : '1px',
                boxShadow: snapshot.isDraggingOver ? 'inset 0 0 0 2px #60A5FA' : 'none'
              }}>
              {employee && (
                <Draggable
                  key={`inside_table_${day}_${role}_${position}_${employee.id}`}
                  draggableId={`inside_table_${day}_${role}_${position}_${employee.id}`}
                  index={0}>
                  {(dragProvided, dragSnapshot) => (
                    <EmployeeCell
                      employee={employee}
                      dragProvided={dragProvided}
                      dragSnapshot={dragSnapshot}
                      onClick={() => handleEmployeeClick(day, role, position)}
                    />
                  )}
                </Draggable>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )
    },
    [getAssignedEmployee, currentSchedule, handleEmployeeClick]
  )

  const getWeekDates = () => {
    const today = new Date()
    const startOfTheWeek = startOfWeek(today, { weekStartsOn: 0 }) // 0 = Sunday

    return DAYS.map((day, index) => {
      const date = addDays(startOfTheWeek, index)
      return {
        name: day,
        date: format(date, 'd/M', { locale: he })
      }
    })
  }

  if (!currentSchedule) {
    return <div>Loading schedule...</div>
  }

  const isToday = (dayName) => {
    const today = new Date()
    const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    return hebrewDays[today.getDay()] === dayName
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center justify-center gap-8 p-1 container mx-auto">
        <EmployeesList employees={employees} />

        <div
          className="w-full overflow-x-auto -mx-1"
          id="schedule-table-for-share"
          style={{ backgroundColor: isSharing ? '#ffffff' : 'transparent' }}>
          <Table dir="rtl" className="min-w-[650px] bg-white border border-gray-200 rounded-lg ">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-medium text-sm sticky right-0 z-10 bg-gray-50 p-1">משמרת</TableHead>
                {getWeekDates().map(({ name, date }) => (
                  <TableHead
                    key={name}
                    className={`text-center  font-medium text-sm whitespace-nowrap p-2 ${
                      isToday(name) ? 'bg-[#BE202E]/10 text-[#BE202E] font-bold border-t-4 border-t-[#BE202E]' : 'font-medium'
                    }`}>
                    <div className="text-center">{name}</div>
                    <div className="text-sm text-gray-600 mt-1">{date}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {SHIFTS.flatMap((shift) =>
                Array.from({ length: POSITIONS_PER_SHIFT }, (_, index) => {
                  const position = index + 1
                  return (
                    <TableRow key={`${shift}-${position}`} className="h-10">
                      <TableCell
                        className={`text-center font-medium bg-gray-50 border-l text-sm sticky right-0 z-10 p-1 ${
                          position === 1 ? '' : 'border-t-0'
                        }`}>
                        {position === 1 ? SHIFT_NAMES[shift] : ''}
                      </TableCell>
                      {DAYS.map((day) => (
                        <TableCell key={`${day}-${shift}-${position}`} className={`p-2 ${position === 1 ? '' : 'border-t-0'}`}>
                          {renderCell(day, shift, position)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DragDropContext>
  )
}

import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { toast } from 'react-hot-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { EmployeesList } from '@/components/EmployeesList'
import { EmployeeCell } from '@/components/EmployeeCell'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export function BranchSchedule({ getAssignedEmployee, onUpdateSchedule, isSharing, handleEmployeeClick }) {
  const { schedules } = useSelector((storeState) => storeState.scheduleModule)
  const { employees } = useSelector((storeState) => storeState.employeeModule)
  const currentSchedule = Array.isArray(schedules) ? schedules[0] : schedules

  const handleDragEnd = useCallback(
    async (result) => {
      if (!result.destination || !currentSchedule) return

      const { source, destination, draggableId } = result

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
            <TableCell
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`text-center h-10 sm:h-12 border border-gray-200 p-0 ${snapshot.isDraggingOver ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              style={{
                backgroundColor: snapshot.isDraggingOver ? '#EFF6FF' : employee ? employee.color : '',
                minWidth: '70px',
                maxWidth: '100px',
                padding: snapshot.isDraggingOver ? '1px sm:2px' : '2px sm:4px',
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
            </TableCell>
          )}
        </Droppable>
      )
    },
    [getAssignedEmployee, currentSchedule, handleEmployeeClick]
  )

  if (!currentSchedule) {
    return <div>Loading schedule...</div>
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 p-2 sm:p-4 container mx-auto">
        <EmployeesList employees={employees} />

        <div
          className="w-full overflow-x-auto -mx-2 sm:mx-0"
          id="schedule-table-for-share"
          style={{ backgroundColor: isSharing ? '#ffffff' : 'transparent' }}>
          <Table dir="rtl" className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-medium text-sm sm:text-base sticky right-0 z-10 bg-gray-50">תפקיד</TableHead>
                {DAYS.map((day) => (
                  <TableHead key={day} className="text-center font-medium text-sm sm:text-base whitespace-nowrap">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Shift Manager */}
              <TableRow>
                <TableCell className="text-center font-medium bg-gray-50 border-l text-sm sm:text-base sticky right-0 z-10 whitespace-nowrap">
                  אחמ"ש
                </TableCell>
                {DAYS.map((day) => renderCell(day, 'אחמש', 1))}
              </TableRow>

              {/* Waiters */}
              <TableRow>
                <TableCell
                  rowSpan={5}
                  className="text-center font-medium bg-gray-50 border-l text-sm sm:text-base sticky right-0 z-10 whitespace-nowrap">
                  מלצרים
                </TableCell>
                {DAYS.map((day) => renderCell(day, 'מלצרים', 1))}
              </TableRow>
              {[2, 3, 4, 5].map((position) => (
                <TableRow key={`waiter-${position}`}>{DAYS.map((day) => renderCell(day, 'מלצרים', position))}</TableRow>
              ))}

              {/* Separator */}
              <TableRow>
                <TableCell colSpan={DAYS.length + 1} className="h-1 p-0 bg-gray-300" />
              </TableRow>

              {/* Cooks */}
              <TableRow>
                <TableCell
                  rowSpan={3}
                  className="text-center font-medium bg-gray-50 border-l text-sm sm:text-base sticky right-0 z-10 whitespace-nowrap">
                  טבחים
                </TableCell>
                {DAYS.map((day) => renderCell(day, 'טבחים', 1))}
              </TableRow>
              {[2, 3].map((position) => (
                <TableRow key={`cook-${position}`}>{DAYS.map((day) => renderCell(day, 'טבחים', position))}</TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DragDropContext>
  )
}

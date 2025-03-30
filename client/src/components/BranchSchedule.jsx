import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { toast } from 'react-hot-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmployeesList } from '@/components/EmployeesList'
import { EmployeeCell } from '@/components/EmployeeCell'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const ROLES = {
  manager: { name: 'אחמ"ש', positions: 1 },
  waiters: { name: 'מלצרים', positions: 5 },
  cooks: { name: 'טבחים', positions: 6 }
}

export function BranchSchedule({ getAssignedEmployee, onUpdateSchedule, isSharing, handleEmployeeClick }) {
  const { schedules } = useSelector((storeState) => storeState.scheduleModule)
  const { employees } = useSelector((storeState) => storeState.employeeModule)
  const currentSchedule = Array.isArray(schedules) ? schedules[0] : schedules

  const getDayDates = () => {
    const today = new Date()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - today.getDay()) // Get Sunday of current week

    return DAYS.map((day, index) => {
      const date = new Date(sunday)
      date.setDate(sunday.getDate() + index)
      const isToday = today.toDateString() === date.toDateString()

      return {
        name: day,
        date: date.getDate() + '/' + (date.getMonth() + 1),
        isToday
      }
    })
  }

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
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`text-center border border-gray-200 ${snapshot.isDraggingOver ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              style={{
                backgroundColor: snapshot.isDraggingOver ? '#EFF6FF' : employee ? employee.color : '',
                height: '40px',
                width: '100%',
                padding: 0,
                margin: 0,
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

  const renderRoleRows = (role, roleConfig) => {
    return Array.from({ length: roleConfig.positions }, (_, index) => {
      const position = index + 1
      return (
        <TableRow key={`${role}-${position}`}>
          <TableCell
            className={`text-center font-medium bg-gray-50 border-l text-sm sm:text-base sticky right-0 z-10 ${position === 1 ? '' : 'border-t-0'}`}>
            {position === 1 ? roleConfig.name : ''}
          </TableCell>
          {DAYS.map((day) => (
            <TableCell key={`${day}-${role}-${position}`} className={`${position === 1 ? '' : 'border-t-0'}`}>
              {renderCell(day, role, position)}
            </TableCell>
          ))}
        </TableRow>
      )
    })
  }

  if (!currentSchedule) {
    return <div>Loading schedule...</div>
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-8 p-1 container mx-auto">
        <EmployeesList employees={employees} />

        <div className="w-full overflow-x-auto" id="schedule-table-for-share" style={{ backgroundColor: isSharing ? '#ffffff' : 'transparent' }}>
          <Table className="w-full border-collapse" dir="rtl">
            <TableHeader>
              <TableRow>
                <th className="text-center text-base sticky right-0 z-10 bg-gray-50 w-28 border border-gray-200 p-2">תפקיד</th>
                {getDayDates().map(({ name, date, isToday }) => (
                  <th
                    key={name}
                    className={`
                      text-center text-base whitespace-nowrap border border-gray-200 p-2
                      ${isToday ? 'bg-[#BE202E]/10 border-t-4 border-t-[#BE202E]' : ''}
                    `}
                    style={{ width: '120px' }}>
                    <div className={isToday ? 'text-[#BE202E]' : ''}>{name}</div>
                    <div className={`text-sm mt-1 ${isToday ? 'text-[#BE202E] font-medium' : 'text-gray-600'}`}>{date}</div>
                  </th>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Manager Section */}
              {renderRoleRows('אחמש', ROLES.manager)}

              {/* Separator */}
              <TableRow>
                <TableCell colSpan={DAYS.length + 1} className="h-0.5 p-0 bg-gray-300" />
              </TableRow>

              {/* Waiters Section */}
              {renderRoleRows('מלצרים', ROLES.waiters)}

              {/* Separator */}
              <TableRow>
                <TableCell colSpan={DAYS.length + 1} className="h-0.5 p-0 bg-gray-300" />
              </TableRow>

              {/* Cooks Section */}
              {renderRoleRows('טבחים', ROLES.cooks)}
            </TableBody>
          </Table>
        </div>
      </div>
    </DragDropContext>
  )
}

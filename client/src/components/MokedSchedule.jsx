import React, { useState, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { toast } from 'react-hot-toast'

export function MokedSchedule({ getAssignedEmployee, onUpdateSchedule, isSharing, handleEmployeeClick }) {
  const { schedules } = useSelector((storeState) => storeState.scheduleModule)
  const { employees } = useSelector((storeState) => storeState.employeeModule)

  const [isDragging, setIsDragging] = useState(false)

  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
  const timeSlots = [
    { name: 'בוקר', role: 'morning', positions: 3 },
    { name: 'אמצע', role: 'noon', positions: 3 },
    { name: 'ערב', role: 'evening', positions: 3 }
  ]

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback(
    async (result) => {
      setIsDragging(false)
      if (!result.destination) return

      const { source, destination, draggableId } = result

      const [destDay, destRole, destPosition] = destination.droppableId.split('-')

      try {
        if (draggableId.startsWith('inside_table_')) {
          const [sourceDay, sourceRole, sourcePosition] = source.droppableId.split('-')
          const employeeId = draggableId.split('_').pop()

          await onUpdateSchedule(schedules, null, sourceDay, sourceRole, parseInt(sourcePosition))

          await onUpdateSchedule(schedules, employeeId, destDay, destRole, parseInt(destPosition))
        } else {
          await onUpdateSchedule(schedules, draggableId, destDay, destRole, parseInt(destPosition))
        }
      } catch (error) {
        console.error('Error in drag end:', error)
        toast.error('שגיאה בעדכון המשמרת')
      }
    },
    [onUpdateSchedule, schedules]
  )

  const renderCell = (day, role, position) => {
    const employee = getAssignedEmployee(schedules, day, role, position)
    const cellId = `${day}-${role}-${position}`

    return (
      <Droppable key={cellId} droppableId={cellId}>
        {(provided, snapshot) => (
          <TableCell
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`text-center h-10 border border-gray-200 p-0 ${snapshot.isDraggingOver ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            style={{
              backgroundColor: snapshot.isDraggingOver ? '#EFF6FF' : employee ? employee.color : '',
              minWidth: '70px',
              maxWidth: '100px',
              padding: snapshot.isDraggingOver ? '1px' : '2px',
              boxShadow: snapshot.isDraggingOver ? 'inset 0 0 0 2px #60A5FA' : 'none'
            }}>
            {employee && (
              <Draggable
                key={`${day}-${role}-${position}-${employee.id}`}
                draggableId={`inside_table_${day}_${role}_${position}_${employee._id}`}
                index={0}>
                {(dragProvided, dragSnapshot) => (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={() => handleEmployeeClick(schedules, day, role, position)}
                          className={`text-white text-xs font-medium rounded h-full flex items-center justify-center cursor-pointer hover:brightness-90 transition-all ${
                            dragSnapshot.isDragging ? 'opacity-75 bg-blue-500' : ''
                          }`}
                          style={{
                            ...dragProvided.draggableProps.style,
                            backgroundColor: employee.color
                          }}>
                          {employee.name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent dir="rtl" className="text-xs" sideOffset={5}>
                        <p>לחץ להסרה</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </Draggable>
            )}
            {provided.placeholder}
          </TableCell>
        )}
      </Droppable>
    )
  }

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center justify-center gap-2 p-2 container mx-auto">
        {/* Workers List */}
        <Droppable droppableId="workers-list" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-wrap gap-1.5 text-white w-full">
              {employees.map((employee, index) => (
                <Draggable key={employee.id} draggableId={employee.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-1.5 rounded cursor-pointer text-xs w-16 text-center ${snapshot.isDragging ? 'shadow-xl' : ''}`}
                      style={{
                        backgroundColor: employee.color,
                        ...provided.draggableProps.style
                      }}>
                      {employee.name}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <div
          className="w-full overflow-x-auto -mx-2"
          id="schedules-table-for-share"
          style={{ backgroundColor: isSharing ? '#ffffff' : 'transparent' }}>
          <Table dir="rtl" className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-medium text-xs sticky right-0 z-10 bg-gray-50">משמרת</TableHead>
                {days.map((day) => (
                  <TableHead key={day} className="text-center font-medium text-xs whitespace-nowrap">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {timeSlots.map((timeSlot) => (
                <React.Fragment key={timeSlot.role}>
                  {/* Main row with the shift name */}
                  <TableRow>
                    <TableCell
                      rowSpan={timeSlot.positions}
                      className="text-center font-medium bg-gray-50 border-l text-xs sticky right-0 z-10 whitespace-nowrap">
                      {timeSlot.name}
                    </TableCell>
                    {days.map((day) => renderCell(day, timeSlot.role, 1))}
                  </TableRow>

                  {/* Additional rows for positions 2 and 3 */}
                  {Array.from({ length: timeSlot.positions - 1 }, (_, index) => (
                    <TableRow key={`${timeSlot.role}-${index + 2}`}>{days.map((day) => renderCell(day, timeSlot.role, index + 2))}</TableRow>
                  ))}

                  {/* Add separator after each time slot except the last one */}
                  {timeSlot.role !== timeSlots[timeSlots.length - 1].role && (
                    <TableRow>
                      <TableCell colSpan={days.length + 1} className="h-1 p-0 bg-gray-300"></TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DragDropContext>
  )
}

import React, { useState, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { toast } from 'react-hot-toast'
import { EmployeesList } from '@/components/EmployeesList'
import { EmployeeCell } from '@/components/EmployeeCell'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const SHIFTS = ['morning', 'noon', 'evening']
const SHIFT_NAMES = {
  morning: 'בוקר',
  noon: 'צהריים',
  evening: 'ערב'
}

export function MokedSchedule({ schedules, employees, getAssignedEmployee, onUpdateSchedule, isSharing, handleEmployeeClick }) {
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

  const renderShiftRows = (shift) => (
    <TableRow key={shift}>
      <TableCell className="text-center font-medium bg-gray-50 border-l text-sm sm:text-base sticky right-0 z-10">{SHIFT_NAMES[shift]}</TableCell>
      {DAYS.map((day) => (
        <React.Fragment key={`${day}-${shift}`}>{[1, 2, 3].map((position) => renderCell(day, shift, position))}</React.Fragment>
      ))}
    </TableRow>
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
                <TableHead className="text-center font-medium text-sm sm:text-base sticky right-0 z-10 bg-gray-50">משמרת</TableHead>
                {DAYS.map((day) => (
                  <TableHead key={day} className="text-center font-medium text-sm sm:text-base whitespace-nowrap" colSpan={3}>
                    {day}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead className="text-center font-medium text-sm sm:text-base sticky right-0 z-10 bg-gray-50" />
                {DAYS.map((day) => (
                  <React.Fragment key={`${day}-positions`}>
                    <TableHead className="text-center font-medium text-xs">1</TableHead>
                    <TableHead className="text-center font-medium text-xs">2</TableHead>
                    <TableHead className="text-center font-medium text-xs">3</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>{SHIFTS.map(renderShiftRows)}</TableBody>
          </Table>
        </div>
      </div>
    </DragDropContext>
  )
}

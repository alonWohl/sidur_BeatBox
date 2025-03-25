import React, { useState, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { toast } from 'react-hot-toast'

export function MokedSchedule({ getAssignedWorker, onUpdateSchedule, isSharing, handleWorkerClick }) {
  const { workers } = useSelector((storeState) => storeState.workerModule)
  const [isDragging, setIsDragging] = useState(false)

  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
  const timeSlots = [
    { name: 'בוקר', role: 'morning', rows: 3 },
    { name: 'אמצע', role: 'noon', rows: 3 },
    { name: 'ערב', role: 'evening', rows: 3 }
  ]

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback(
    async (result) => {
      setIsDragging(false)
      if (!result.destination) return

      const { source, destination, draggableId } = result

      // If dropping to trash
      if (destination.droppableId === 'trash') {
        if (draggableId.startsWith('inside_table_')) {
          const [sourceDay, sourceRole, sourcePosition] = source.droppableId.split('-')
          await onUpdateSchedule(null, sourceDay, sourceRole, parseInt(sourcePosition))
        }
        return
      }

      const [destDay, destRole, destPosition] = destination.droppableId.split('-')

      try {
        if (draggableId.startsWith('inside_table_')) {
          const [sourceDay, sourceRole, sourcePosition] = source.droppableId.split('-')
          const workerId = draggableId.split('_').pop() // Get the last part which is the workerId

          console.log('Moving worker:', {
            workerId,
            sourceDay,
            sourceRole,
            sourcePosition,
            destDay,
            destRole,
            destPosition
          })

          await onUpdateSchedule(null, sourceDay, sourceRole, parseInt(sourcePosition))

          await onUpdateSchedule(workerId, destDay, destRole, parseInt(destPosition))
        } else {
          await onUpdateSchedule(draggableId, destDay, destRole, parseInt(destPosition))
        }
      } catch (error) {
        console.error('Error in drag end:', error)
        toast.error('שגיאה בעדכון המשמרת')
      }
    },
    [onUpdateSchedule]
  )

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full items-center gap-4 p-2 sm:p-4 relative container mx-auto">
        {/* Workers List with Droppable */}
        <Droppable droppableId="workers-list" direction="horizontal">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-1.5 sm:gap-2 w-full mb-2 sm:mb-4">
              {workers.map((worker, index) => (
                <Draggable key={worker._id} draggableId={worker._id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-1.5 sm:p-2 rounded w-16 sm:w-20 text-sm sm:text-base text-center ${snapshot.isDragging ? 'shadow-xl' : ''}`}
                      style={{
                        backgroundColor: worker.color,
                        color: 'white',
                        ...provided.draggableProps.style
                      }}>
                      {worker.name}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <div
          className="h-full w-full overflow-x-auto -mx-2 sm:mx-0"
          id="schedule-table-for-share"
          style={{ backgroundColor: isSharing ? '#ffffff' : 'transparent' }}>
          <Table dir="rtl" className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right bg-gray-50 font-bold text-sm sm:text-base sticky right-0 z-10">משמרת</TableHead>
                {days.map((day) => (
                  <TableHead key={day} className="text-center bg-gray-50 font-bold text-sm sm:text-base whitespace-nowrap">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeSlots.flatMap((slot) =>
                Array.from({ length: slot.rows }).map((_, position) => (
                  <TableRow key={`${slot.name}-${position}`}>
                    {position === 0 && (
                      <TableCell
                        className="text-center font-medium bg-gray-50 border border-gray-200 text-sm sm:text-base sticky right-0 z-10"
                        style={{ verticalAlign: 'middle' }}
                        rowSpan={slot.rows}>
                        {slot.name}
                      </TableCell>
                    )}

                    {days.map((day) => {
                      const assignedWorker = getAssignedWorker(day, slot.role, position + 1)
                      const cellId = `${day}-${slot.role}-${position + 1}`

                      return (
                        <Droppable key={cellId} droppableId={cellId}>
                          {(provided, snapshot) => (
                            <td
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`text-center border border-gray-200 p-0 transition-colors duration-200 ${
                                snapshot.isDraggingOver ? 'bg-blue-100 border-blue-400' : ''
                              }`}
                              style={{
                                backgroundColor: snapshot.isDraggingOver ? '#EFF6FF' : assignedWorker ? assignedWorker.color : '',
                                height: '36px sm:h-40px',
                                minWidth: '70px sm:min-w-[80px]',
                                maxWidth: '100px sm:max-w-[120px]',
                                padding: snapshot.isDraggingOver ? '1px sm:2px' : '2px sm:4px',
                                boxShadow: snapshot.isDraggingOver ? 'inset 0 0 0 2px #60A5FA' : 'none'
                              }}>
                              {assignedWorker && (
                                <Draggable
                                  key={`${day}-${slot.role}-${position}-${assignedWorker._id}`}
                                  draggableId={`inside_table_${day}_${slot.role}_${position}_${assignedWorker._id}`}
                                  index={0}>
                                  {(dragProvided, dragSnapshot) => (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div
                                            ref={dragProvided.innerRef}
                                            {...dragProvided.draggableProps}
                                            {...dragProvided.dragHandleProps}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleWorkerClick(day, slot.role, position + 1)
                                            }}
                                            className={`text-white text-xs sm:text-sm font-medium rounded h-full flex items-center justify-center cursor-pointer hover:brightness-90 transition-all ${
                                              dragSnapshot.isDragging ? 'opacity-75 bg-blue-500' : ''
                                            }`}
                                            style={{
                                              ...dragProvided.draggableProps.style,
                                              backgroundColor: assignedWorker.color
                                            }}>
                                            {assignedWorker.name}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-gray-800 text-white text-xs sm:text-sm" sideOffset={5}>
                                          <p>לחץ להסרת העובד</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </Draggable>
                              )}
                              {provided.placeholder}
                            </td>
                          )}
                        </Droppable>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Trash Zone - always visible */}
      {/* <Droppable droppableId="trash">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`fixed bottom-8 right-8 p-6 rounded-lg border-2 border-dashed transition-all flex items-center gap-3 ${
              snapshot.isDraggingOver ? 'bg-red-50 border-red-500 scale-110' : 'bg-white border-gray-300 hover:border-gray-400'
            }`}
            style={{
              minWidth: '200px',
              zIndex: 50,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}>
            <div className="flex items-center gap-3 justify-center">
              <Trash2 className={`w-6 h-6 ${snapshot.isDraggingOver ? 'text-red-500' : 'text-gray-400'}`} />
              <span className={`${snapshot.isDraggingOver ? 'text-red-500' : 'text-gray-400'} font-medium`}>גרור לכאן למחיקה</span>
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable> */}
    </DragDropContext>
  )
}

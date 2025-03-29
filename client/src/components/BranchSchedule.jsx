import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { toast } from 'react-hot-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useSelector } from 'react-redux'

export function BranchSchedule({ getAssignedWorker, onUpdateSchedule, isSharing, handleWorkerClick }) {
  const { workers } = useSelector((storeState) => storeState.workerModule)
  console.log('🚀 ~ BranchSchedule ~ workers:', workers)
  const { schedule } = useSelector((storeState) => storeState.scheduleModule)
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (destination.droppableId === 'trash') {
      if (source.droppableId !== 'workers-list') {
        const [sourceDay, sourceRole, sourcePosition] = source.droppableId.split('-')
        await onUpdateSchedule(schedule, null, sourceDay, sourceRole, parseInt(sourcePosition))
      }
      return
    }

    const [destDay, destRole, destPosition] = destination.droppableId.split('-')

    try {
      if (draggableId.startsWith('inside_table_')) {
        // Moving from within the table
        const [sourceDay, sourceRole, sourcePosition] = source.droppableId.split('-')
        const workerId = draggableId.split('_').pop() // Get the last part which is the workerId

        // First remove from original position
        await onUpdateSchedule(schedule, null, sourceDay, sourceRole, parseInt(sourcePosition))

        await onUpdateSchedule(schedule, workerId, destDay, destRole, parseInt(destPosition))
      } else {
        await onUpdateSchedule(schedule, draggableId, destDay, destRole, parseInt(destPosition))
      }
    } catch (error) {
      console.error('Error in drag end:', error)
      toast.error('שגיאה בעדכון המשמרת')
    }
  }

  const renderCell = (day, role, position) => {
    const worker = getAssignedWorker(schedule, day, role, position)
    const cellId = `${day}-${role}-${position}`

    return (
      <Droppable key={cellId} droppableId={cellId}>
        {(provided, snapshot) => (
          <TableCell
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`text-center h-10 sm:h-12 border border-gray-200 p-0 ${snapshot.isDraggingOver ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            style={{
              backgroundColor: snapshot.isDraggingOver ? '#EFF6FF' : worker ? worker.color : '',
              minWidth: '70px',
              maxWidth: '100px',
              padding: snapshot.isDraggingOver ? '1px sm:2px' : '2px sm:4px',
              boxShadow: snapshot.isDraggingOver ? 'inset 0 0 0 2px #60A5FA' : 'none'
            }}>
            {worker && (
              <Draggable
                key={`${day}-${role}-${position}-${worker._id}`}
                draggableId={`inside_table_${day}_${role}_${position}_${worker._id}`}
                index={0}>
                {(dragProvided, dragSnapshot) => (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={() => handleWorkerClick(schedule, day, role, position)}
                          className={`text-white text-xs sm:text-sm font-medium rounded h-full flex items-center justify-center cursor-pointer hover:brightness-90 transition-all ${
                            dragSnapshot.isDragging ? 'opacity-75 bg-blue-500' : ''
                          }`}
                          style={{
                            ...dragProvided.draggableProps.style,
                            backgroundColor: worker.color
                          }}>
                          {worker.name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent dir="rtl" className="text-xs sm:text-sm" sideOffset={5}>
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center justify-center gap-2 sm:gap-4 p-2 sm:p-4 container mx-auto">
        {/* Workers List */}
        <Droppable droppableId="workers-list" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-wrap gap-1.5 sm:gap-2 text-white w-full">
              {workers.map((worker, index) => (
                <Draggable key={worker._id} draggableId={worker._id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-1.5 sm:p-2 rounded cursor-pointer text-sm sm:text-base w-16 sm:w-20 text-center ${
                        snapshot.isDragging ? 'shadow-xl' : ''
                      }`}
                      style={{
                        backgroundColor: worker.color,
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
          className="w-full overflow-x-auto -mx-2 sm:mx-0"
          id="schedule-table-for-share"
          style={{ backgroundColor: isSharing ? '#ffffff' : 'transparent' }}>
          <Table dir="rtl" className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-medium text-sm sm:text-base sticky right-0 z-10 bg-gray-50">תפקיד</TableHead>
                {days.map((day) => (
                  <TableHead key={day} className="text-center font-medium text-sm sm:text-base whitespace-nowrap">
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Shift Manager section */}
              <TableRow>
                <TableCell className="text-center font-medium bg-gray-50 border-l text-sm sm:text-base sticky right-0 z-10 whitespace-nowrap">
                  אחמ"ש
                </TableCell>
                {days.map((day) => renderCell(day, 'אחמש', 1))}
              </TableRow>

              {/* Waiters section */}
              <TableRow>
                <TableCell
                  rowSpan={5}
                  className="text-center font-medium bg-gray-50 border-l text-sm sm:text-base sticky right-0 z-10 whitespace-nowrap">
                  מלצרים
                </TableCell>
                {days.map((day) => renderCell(day, 'מלצרים', 1))}
              </TableRow>

              {[2, 3, 4, 5].map((position) => (
                <TableRow key={`waiter-row-${position}`}>{days.map((day) => renderCell(day, 'מלצרים', position))}</TableRow>
              ))}

              {/* Separator row */}
              <TableRow>
                <TableCell colSpan={days.length + 1} className="h-1 p-0 bg-gray-300"></TableCell>
              </TableRow>

              {/* Cooks section */}
              <TableRow>
                <TableCell
                  rowSpan={3}
                  className="text-center font-medium bg-gray-50 border-l text-sm sm:text-base sticky right-0 z-10 whitespace-nowrap">
                  טבחים
                </TableCell>
                {days.map((day) => renderCell(day, 'טבחים', 1))}
              </TableRow>

              {[2, 3].map((position) => (
                <TableRow key={`cook-row-${position}`}>{days.map((day) => renderCell(day, 'טבחים', position))}</TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-2 sm:mt-4 text-right text-xs sm:text-sm text-gray-500">
            <p>גרור עובד לתא הרצוי</p>
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}

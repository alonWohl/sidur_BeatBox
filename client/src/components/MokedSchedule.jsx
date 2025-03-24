import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmployesList } from './EmployesList'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'

export function MokedSchedule({ handleWorkerSelect, handleCellClick, activeWorker, schedule, handleClearBoard, getAssignedWorker }) {
  const { workers } = useSelector((storeState) => storeState.workerModule)

  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
  const timeSlots = [
    { name: 'בוקר', role: 'morning', rows: 3 },
    { name: 'אמצע', role: 'noon', rows: 3 },
    { name: 'ערב', role: 'evening', rows: 3 }
  ]

  if (!schedule) return <div>Loading...</div>

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 container mx-auto">
      <EmployesList workers={workers} activeWorker={activeWorker} handleWorkerSelect={handleWorkerSelect} />

      <Button onClick={handleClearBoard}>נקה משמרת</Button>

      <div className="w-full overflow-x-auto mt-4">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right bg-gray-50 font-bold">משמרת</TableHead>
              {days.map((day) => (
                <TableHead key={day} className="text-center bg-gray-50 font-bold">
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeSlots.flatMap((slot) =>
              Array.from({ length: slot.rows }).map((_, position) => (
                <TableRow key={`${slot.name}-${position}`}>
                  {/* Time period label - only show in first row of period */}
                  {position === 0 && (
                    <TableCell
                      className="text-center font-medium bg-gray-50 border border-gray-200"
                      style={{ verticalAlign: 'middle' }}
                      rowSpan={slot.rows}>
                      {slot.name}
                    </TableCell>
                  )}

                  {/* Day cells */}
                  {days.map((day) => {
                    const assignedWorker = getAssignedWorker(day, slot.role, position + 1)

                    return (
                      <TableCell
                        key={`cell-${day}-${slot.role}-${position}`}
                        className="text-center h-12 cursor-pointer hover:bg-gray-100 border border-gray-200"
                        style={assignedWorker ? { backgroundColor: assignedWorker.color } : {}}
                        onClick={() => handleCellClick(day, slot.role, position + 1)}>
                        {assignedWorker && <span className="text-white text-sm font-medium px-2 py-1 rounded">{assignedWorker.name}</span>}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

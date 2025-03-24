import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

import { EmployesList } from './EmployesList'

export function BranchSchedule({ workers, activeWorker, handleWorkerSelect, handleCellClick, getAssignedWorker, handleClearBoard }) {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 container mx-auto">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-xl font-bold">סידור עבודה</h2>
        <Button onClick={handleClearBoard} variant="outline">
          נקה סידור
        </Button>
      </div>

      <EmployesList workers={workers} activeWorker={activeWorker} handleWorkerSelect={handleWorkerSelect} />

      <div className="w-full overflow-x-auto">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="w-24 text-center font-medium">תפקיד</TableHead>
              {days.map((day) => (
                <TableHead key={day} className="text-center font-medium">
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Shift Manager (אחמ"ש) section - 1 row */}
            <TableRow>
              <TableCell className="text-center font-medium bg-gray-50 border-l">אחמ"ש</TableCell>
              {days.map((day) => {
                const worker = getAssignedWorker(day, 'אחמש', 1)
                return (
                  <TableCell
                    key={`manager-${day}`}
                    className="text-center h-12 cursor-pointer hover:bg-gray-100"
                    style={worker ? { backgroundColor: worker.color } : {}}
                    onClick={() => handleCellClick(day, 'אחמש', 1)}>
                    {worker && <span className="text-white text-sm">{worker.name}</span>}
                  </TableCell>
                )
              })}
            </TableRow>

            {/* Waiters section - 5 rows (role is switched in your original code) */}
            <TableRow>
              <TableCell rowSpan={5} className="text-center font-medium bg-gray-50 border-l">
                מלצרים
              </TableCell>
              {days.map((day) => {
                const worker = getAssignedWorker(day, 'מלצרים', 1)
                return (
                  <TableCell
                    key={`waiter1-${day}`}
                    className="text-center h-12 cursor-pointer hover:bg-gray-100"
                    style={worker ? { backgroundColor: worker.color } : {}}
                    onClick={() => handleCellClick(day, 'מלצרים', 1)}>
                    {worker && <span className="text-white text-sm">{worker.name}</span>}
                  </TableCell>
                )
              })}
            </TableRow>

            {[2, 3, 4, 5].map((position) => (
              <TableRow key={`waiter-row-${position}`}>
                {days.map((day) => {
                  const worker = getAssignedWorker(day, 'מלצרים', position)
                  return (
                    <TableCell
                      key={`waiter${position}-${day}`}
                      className="text-center h-12 cursor-pointer hover:bg-gray-100"
                      style={worker ? { backgroundColor: worker.color } : {}}
                      onClick={() => handleCellClick(day, 'מלצרים', position)}>
                      {worker && <span className="text-white text-sm">{worker.name}</span>}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}

            {/* Separator row */}
            <TableRow>
              <TableCell colSpan={days.length + 1} className="h-1 p-0 bg-gray-300"></TableCell>
            </TableRow>

            {/* Cooks section - 3 rows (role is switched in your original code) */}
            <TableRow>
              <TableCell rowSpan={3} className="text-center font-medium bg-gray-50 border-l">
                טבחים
              </TableCell>
              {days.map((day) => {
                const worker = getAssignedWorker(day, 'טבחים', 1)
                return (
                  <TableCell
                    key={`cook1-${day}`}
                    className="text-center h-12 cursor-pointer hover:bg-gray-100"
                    style={worker ? { backgroundColor: worker.color } : {}}
                    onClick={() => handleCellClick(day, 'טבחים', 1)}>
                    {worker && <span className="text-white text-sm">{worker.name}</span>}
                  </TableCell>
                )
              })}
            </TableRow>

            {[2, 3].map((position) => (
              <TableRow key={`cook-row-${position}`}>
                {days.map((day) => {
                  const worker = getAssignedWorker(day, 'טבחים', position)
                  return (
                    <TableCell
                      key={`cook${position}-${day}`}
                      className="text-center h-12 cursor-pointer hover:bg-gray-100"
                      style={worker ? { backgroundColor: worker.color } : {}}
                      onClick={() => handleCellClick(day, 'טבחים', position)}>
                      {worker && <span className="text-white text-sm">{worker.name}</span>}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 text-right text-sm text-gray-500">
          <p>לחיצה על תא - הצבת/הסרת עובד</p>
        </div>
      </div>
    </div>
  )
}

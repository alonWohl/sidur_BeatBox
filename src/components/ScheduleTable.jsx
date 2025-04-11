import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { format, startOfWeek, addDays } from 'date-fns'
import { he } from 'date-fns/locale'
import React, { useState, useCallback, useEffect } from 'react'
import { AssigneeCell } from './AssigneeCell'
import { toast } from 'react-hot-toast'
import { Check, X, Share2, Trash2, LayoutGrid, Users } from 'lucide-react'
import { Button } from './ui/button'

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const SHIFTS = ['morning', 'noon', 'evening']
const SHIFT_NAMES = {
	morning: 'בוקר',
	noon: 'אמצע',
	evening: 'ערב'
}

// Table Layout Components
const MokedLayout = React.memo(({ SHIFTS, DAYS, renderCell, isToday, highlightedDay, setHighlightedDay }) => (
	<TableBody>
		{SHIFTS.flatMap(shift => {
			const positions = shift === 'morning' ? 3 : shift === 'noon' ? 2 : 3
			return Array.from({ length: positions }, (_, index) => {
				const position = index + 1
				return (
					<TableRow key={`${shift}-${position}`} className="transition-colors">
						<TableCell
							className={`text-center font-medium text-sm transition-all h-[32px] md:h-[40px]
								${position === 1 ? 'bg-[#BE202E]/10 text-[#BE202E] font-bold drop-shadow-sm' : 'border-t-0 bg-gray-100/50'}`}
						>
							{position === 1 ? <div className="py-0.5 sm:py-1 text-xs sm:text-sm">{SHIFT_NAMES[shift]}</div> : ''}
						</TableCell>
						{DAYS.map(day => (
							<TableCell
								key={`${day}-${shift}-${position}`}
								className={`p-0 w-[120px] md:w-[140px] border h-[32px] md:h-[40px] ${isToday(day) ? 'bg-blue-50/40' : ''} ${highlightedDay === day ? 'bg-yellow-50' : ''} 
								${position === 1 ? '' : 'border-t-0'} transition-colors`}
								onMouseEnter={() => setHighlightedDay(day)}
								onMouseLeave={() => setHighlightedDay(null)}
							>
								{renderCell(day, shift, position)}
							</TableCell>
						))}
					</TableRow>
				)
			})
		})}
	</TableBody>
))

// Remove BranchLayout component entirely
// Update main component to remove isMoked checks
export const ScheduleTable = React.memo(
	({ type, currentSchedule, getAssignedEmployee, handleRemoveEmployee, handleUpdateSchedule, employees, isSharing, onClearSchedule, weekMode = 'current', setIsSharing }) => {
		const [selectedForSwap, setSelectedForSwap] = useState(null)
		const [allCells, setAllCells] = useState([])
		const [highlightedDay, setHighlightedDay] = useState(null)
		const [selectedEmployee, setSelectedEmployee] = useState(null)

		useEffect(() => {
			const cells = []
			DAYS.forEach(day => {
				SHIFTS.forEach(shift => {
					const positions = shift === 'morning' ? 3 : shift === 'noon' ? 2 : 3
					for (let i = 1; i <= positions; i++) {
						cells.push(`${day}-${shift}-${i}`)
					}
				})
			})
			setAllCells(cells)
		}, [])

		// ... rest of the component code ...

		return (
			<div className="h-full flex flex-col overflow-hidden">
				{/* Employee selection */}
				<div className="sm:px-4 xl:px-6 2xl:px-0 bg-gray-50 rounded-lg px-4 border border-gray-200 mb-2 sm:mb-4 w-full flex-shrink-0">
					<div className="flex items-center gap-2 py-2 sm:py-3">
						<Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
						<div className="text-xs sm:text-sm font-medium text-gray-700">עובדים:</div>
					</div>
					<EmployeeSelection employees={employees} selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} />
				</div>

				{/* Table header */}
				<div className="px-2 sm:px-4 xl:px-6 2xl:px-0 bg-white py-2.5 sm:py-3 border-b border-gray-200 flex flex-wrap md:flex-nowrap justify-between items-center gap-2 sm:gap-3 flex-shrink-0">
					<div className="flex items-center gap-2.5 sm:gap-3">
						<div className="h-8 w-8 sm:h-8 sm:w-8 rounded-md bg-[#BE202E]/10 flex items-center justify-center">
							<LayoutGrid className="h-4 w-4 sm:h-4 sm:w-4 text-[#BE202E]" />
						</div>
						<h3 className="text-base sm:text-base font-semibold text-gray-800">לוח {type}</h3>
					</div>

					<TableActions
						selectedEmployee={selectedEmployee}
						setSelectedEmployee={setSelectedEmployee}
						handleShareToWhatsApp={handleShareToWhatsApp}
						isSharing={isSharing}
						onClearSchedule={onClearSchedule}
						currentSchedule={currentSchedule}
					/>
				</div>

				{/* Table */}
				<div className="px-2 sm:px-4 xl:px-6 2xl:px-0 flex-grow overflow-hidden min-h-0">
					<div className="h-full overflow-auto scrollbar-thin max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-260px)] md:max-h-none" style={{ WebkitOverflowScrolling: 'touch' }}>
						<div className="min-w-fit">
							<Table className="w-full table-fixed">
								<ScheduleTableHeader weekDates={getWeekDates()} highlightedDay={highlightedDay} setHighlightedDay={setHighlightedDay} isToday={isToday} />
								<MokedLayout SHIFTS={SHIFTS} DAYS={DAYS} renderCell={renderCell} isToday={isToday} highlightedDay={highlightedDay} setHighlightedDay={setHighlightedDay} />
							</Table>
						</div>
					</div>
				</div>
			</div>
		)
	}
)

// Helper Components
const EmployeeSelection = React.memo(({ employees, selectedEmployee, setSelectedEmployee }) => (
	<div className="pb-2 sm:pb-3 grid grid-cols-6 sm:grid-cols-7 gap-0.5 max-w-76 md:max-w-full w-full -mt-1 overflow-x-auto whitespace-nowrap">
		{employees?.map(emp => (
			<EmployeeButton key={emp.id} employee={emp} selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} />
		))}
	</div>
))

const EmployeeButton = React.memo(({ employee, selectedEmployee, setSelectedEmployee }) => (
	<button
		className={`inline-flex px-1 sm:px-2 py-0.5 sm:py-1 rounded-sm text-[10px] sm:text-xs w-full transition-all justify-center items-center gap-0.5 sm:gap-1 text-white truncate
			${selectedEmployee?.id === employee.id ? 'ring-2 ring-white shadow-sm' : 'hover:shadow-sm'}`}
		style={{ backgroundColor: employee.color }}
		onClick={() => setSelectedEmployee(selectedEmployee?.id === employee.id ? null : employee)}
	>
		{selectedEmployee?.id === employee.id && <Check className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0 text-white" />}
		<span className="truncate">{employee.name}</span>
	</button>
))

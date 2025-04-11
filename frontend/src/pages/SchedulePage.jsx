import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Clock, Calendar, Building2, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useSystemStore } from '@/stores/useSystemStore'
import { useScheduleStore } from '@/stores/useScheduleStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { useUserStore } from '@/stores/useUserStore'
import { Loader } from '@/components/Loader'
import { ScheduleTable } from '@/components/ScheduleTable'
import { Button } from '@/components/ui/button'

export function SchedulePage() {
	const user = useUserStore(state => state.user)
	const filterBy = useSystemStore(state => state.filterBy)
	const isLoading = useSystemStore(state => state.isLoading)
	const setFilterBy = useSystemStore(state => state.setFilterBy)

	const loadSchedules = useScheduleStore(state => state.loadSchedules)
	const updateSchedule = useScheduleStore(state => state.updateSchedule)
	const updateScheduleOptimistic = useScheduleStore(state => state.updateScheduleOptimistic)
	const schedules = useScheduleStore(state => state.schedules)

	const employees = useEmployeeStore(state => state.employees)
	const loadEmployees = useEmployeeStore(state => state.loadEmployees)

	const [isSharing, setIsSharing] = useState(false)
	const [currentSchedule, setCurrentSchedule] = useState(null)

	// Load initial data
	useEffect(() => {
		const loadInitialData = async () => {
			try {
				await Promise.all([loadSchedules(filterBy), loadEmployees(filterBy)])
			} catch (error) {
				console.error('Error loading initial data:', error)
				toast.error('שגיאה בטעינת הנתונים')
			}
		}
		loadInitialData()
	}, [filterBy, loadSchedules, loadEmployees])

	// Update current schedule when schedules change
	useEffect(() => {
		if (schedules?.length > 0) {
			setCurrentSchedule(schedules[0])
		}
	}, [schedules])

	const handleUpdateSchedule = async (schedule, employeeId, day, role, position) => {
		if (!schedule?.id) return

		try {
			const scheduleToUpdate = JSON.parse(JSON.stringify(schedule))
			scheduleToUpdate.week = filterBy.week

			const positionNum = parseInt(position)

			let dayIndex = scheduleToUpdate.days.findIndex(d => d.name === day)
			if (dayIndex === -1) {
				scheduleToUpdate.days.push({ name: day, shifts: [] })
				dayIndex = scheduleToUpdate.days.length - 1
			}

			if (!scheduleToUpdate.days[dayIndex].shifts) {
				scheduleToUpdate.days[dayIndex].shifts = []
			}

			scheduleToUpdate.days[dayIndex].shifts = scheduleToUpdate.days[dayIndex].shifts.filter(shift => !(shift.role === role && shift.position === positionNum))

			if (employeeId && employeeId !== 'undefined') {
				scheduleToUpdate.days[dayIndex].shifts.push({
					role,
					position: positionNum,
					employeeId
				})
			}

			console.log('Updating schedule:', scheduleToUpdate)
			await updateScheduleOptimistic(scheduleToUpdate)
			setCurrentSchedule({ ...scheduleToUpdate })
		} catch (err) {
			console.error('Error updating schedule:', err)
			toast.error('שגיאה בעדכון המשמרת', {
				icon: <AlertTriangle className="h-5 w-5 text-red-500" />
			})
		}
	}

	const handleClearBoard = async schedule => {
		if (!schedule?.id) return
		try {
			const clearedSchedule = {
				...schedule,
				days: schedule.days.map(day => ({ ...day, shifts: [] }))
			}
			await updateSchedule(clearedSchedule)
			setCurrentSchedule(clearedSchedule)
			toast.success('הסידור נוקה בהצלחה', {
				icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
			})
		} catch {
			toast.error('שגיאה בניקוי הסידור', {
				icon: <XCircle className="h-5 w-5 text-red-500" />
			})
		}
	}

	const getAssignedEmployee = (schedule, day, role, position) => {
		if (!schedule?.days) {
			return null
		}

		const dayData = schedule.days.find(d => d.name === day)
		if (!dayData?.shifts) {
			console.log('No shifts for day:', day, 'in schedule:', schedule)
			return null
		}

		const shift = dayData.shifts.find(s => s.role === role && s.position === parseInt(position))
		if (!shift?.employeeId) {
			return null
		}

		const employee = employees.find(e => e.id === shift.employeeId)
		if (!employee) {
			return null
		}

		return employee
	}

	const handleRemoveEmployee = async (schedule, day, role, position) => {
		if (!schedule?.id) return

		try {
			const scheduleToUpdate = structuredClone(schedule)
			scheduleToUpdate.week = filterBy.week

			const dayObj = scheduleToUpdate.days.find(d => d.name === day)
			if (!dayObj) return

			dayObj.shifts = dayObj.shifts.filter(shift => !(shift.role === role && shift.position === position))

			await updateScheduleOptimistic(scheduleToUpdate)
			setCurrentSchedule(scheduleToUpdate)
			toast.success('העובד הוסר מהמשמרת', {
				icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
			})
		} catch (err) {
			console.error('Error removing employee:', err)
			toast.error('שגיאה בהסרת העובד', {
				icon: <AlertTriangle className="h-5 w-5 text-red-500" />
			})
		}
	}

	const handleSetSharing = value => {
		setIsSharing(value)
	}

	if (!user) {
		return (
			<div className="flex justify-center items-center h-96 animate-in fade-in duration-500">
				<div className="text-center text-gray-500 space-y-4 bg-gray-50 p-8 rounded-lg shadow-sm">
					<div className="flex justify-center">
						<Clock className="h-12 w-12 text-gray-400" />
					</div>
					<p className="text-lg font-medium">אנא התחבר כדי להציג את הסידור</p>
				</div>
			</div>
		)
	}

	return (
		<div className="h-full w-full animate-in fade-in duration-300 max-w-[1900px] mx-auto flex flex-col">
			{isLoading && <Loader />}

			{/* Enhanced header with subtle gradient background */}
			<div className="sticky top-0 z-10 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm flex-shrink-0">
				<div className="flex flex-col px-3 xl:px-6 2xl:px-0 sm:flex-row items-start sm:items-center justify-between py-2 sm:py-3 max-w-[1900px] mx-auto gap-2 sm:gap-3">
					{/* Left side: Brand and title */}
					<div className="flex pr-1 items-center gap-2 sm:gap-3">
						<div className="h-7 w-7 sm:h-9 sm:w-9 flex items-center justify-center rounded-full bg-[#BE202E] shadow-sm">
							<Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
						</div>
						<div>
							<h1 className="font-bold text-gray-800 text-base sm:text-lg">סידור עבודה</h1>
							<p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
								<Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
								{filterBy.week === 'current' ? 'שבוע נוכחי' : 'שבוע הבא'}
								{user.isAdmin && (
									<>
										<span className="mx-1 hidden sm:inline">•</span>
										<Building2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 hidden sm:inline" />
										<span className="hidden sm:inline">{filterBy.name || 'כל הסניפים'}</span>
									</>
								)}
							</p>
						</div>
					</div>

					{/* Right side: Week toggle and branch selector */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
						{/* Week selector as pill buttons */}
						<div className="flex bg-gray-100 rounded-full p-0.5 border border-gray-200 shadow-sm w-full sm:w-auto">
							<Button
								onClick={() => setFilterBy({ ...filterBy, week: 'current' })}
								className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full transition-all flex items-center justify-center gap-1 flex-1 sm:flex-auto ${
									filterBy.week === 'current' ? 'bg-[#BE202E] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
								}`}
							>
								<ArrowRight className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${filterBy.week === 'current' ? 'text-white' : 'text-gray-500'}`} />
								שבוע נוכחי
							</Button>
							<Button
								onClick={() => setFilterBy({ ...filterBy, week: 'next' })}
								className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full transition-all flex items-center justify-center gap-1 flex-1 sm:flex-auto ${
									filterBy.week === 'next' ? 'bg-[#BE202E] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
								}`}
							>
								שבוע הבא
								<ArrowLeft className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${filterBy.week === 'next' ? 'text-white' : 'text-gray-500'}`} />
							</Button>
						</div>

						{/* Branch selector as a dropdown with icon */}
						{user.isAdmin && (
							<div className="relative w-full sm:w-auto">
								<Select onValueChange={value => setFilterBy({ ...filterBy, name: value })} value={filterBy.name} dir="rtl">
									<SelectTrigger className="h-8 sm:h-9 text-[10px] sm:text-xs border-gray-200 bg-white w-full px-2 sm:px-3 shadow-sm hover:bg-gray-50 transition-colors">
										<div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5">
											<Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
											<SelectValue placeholder="בחר סניף" />
										</div>
									</SelectTrigger>
									<SelectContent>
										{['מוקד', 'תל אביב', 'פתח תקווה', 'ראשון לציון', 'ראש העין'].map(branch => (
											<SelectItem key={branch} value={branch} className="text-[10px] sm:text-xs">
												{branch}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* The ScheduleTable will now take the rest of the available height */}
			<div className="flex flex-1 flex-col px-4 xl:px-6 2xl:px-0 sm:flex-row items-start sm:items-center justify-between py-3 max-w-[1900px] mx-auto gap-3 overflow-y-auto scrollbar-thin bg-white">
				<ScheduleTable
					type={filterBy.name}
					currentSchedule={currentSchedule}
					getAssignedEmployee={getAssignedEmployee}
					handleRemoveEmployee={handleRemoveEmployee}
					handleUpdateSchedule={handleUpdateSchedule}
					employees={employees}
					isSharing={isSharing}
					onClearSchedule={handleClearBoard}
					weekMode={filterBy.week}
					setIsSharing={handleSetSharing}
				/>
			</div>
		</div>
	)
}

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Clock, Calendar, Building2, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, AlertCircle } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useSystemStore } from '@/stores/useSystemStore'
import { useScheduleStore } from '@/stores/useScheduleStore'
import { useEmployeeStore } from '@/stores/useEmployeeStore'
import { useUserStore } from '@/stores/useUserStore'
import { scheduleService } from '@/services/schedule/schedule.service.remote'
import { Loader } from '@/components/Loader'
import { ScheduleTable } from '@/components/ScheduleTable'
import { Button } from '@/components/ui/button'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'

// Department mapping for roles in schedule
const DEPARTMENT_ROLE_MAP = {
	'אחמ"ש': 'manager',
	מלצרים: 'waiters',
	טבחים: 'cooks',
	// For Moked, allow any role
	morning: null,
	noon: null,
	evening: null
}

export function SchedulePage() {
	const [filterBy, setFilterBy] = useState({ week: 'current', name: '' })
	const [isSharing, setIsSharing] = useState(false)
	const [currentSchedule, setCurrentSchedule] = useState(null)
	const [pendingAssignment, setPendingAssignment] = useState(null)
	const [showDepartmentAlert, setShowDepartmentAlert] = useState(false)
	const { isLoading } = useSystemStore()
	const { user } = useUserStore()
	const { employees, loadEmployees } = useEmployeeStore()
	const { schedules, loadSchedules, updateSchedule, updateScheduleOptimistic } = useScheduleStore()

	// Load data when component mounts or filter changes
	useEffect(() => {
		if (user) {
			const fetchData = async () => {
				try {
					const systemStore = useSystemStore.getState()
					systemStore.startLoading()

					await Promise.all([loadEmployees({}), loadSchedules({ week: filterBy.week, branch: filterBy.name })])

					systemStore.stopLoading()
				} catch (err) {
					console.error('Error loading data:', err)
					useSystemStore.getState().stopLoading()
				}
			}

			fetchData()
		}
	}, [loadEmployees, loadSchedules, filterBy, user])

	// Set current schedule based on filter
	useEffect(() => {
		if (schedules && schedules.length > 0) {
			let filteredSchedule = schedules.find(schedule => schedule.week === filterBy.week && (filterBy.name ? (schedule.branch === filterBy.name || schedule.branchName === filterBy.name) : true))

			// If no schedule is found matching the criteria, use the first schedule
			if (!filteredSchedule && schedules.length > 0) {
				filteredSchedule = schedules[0]
			}

			setCurrentSchedule(filteredSchedule || null)
		} else {
			// Create an empty schedule structure as fallback
			const emptySchedule = createEmptySchedule(filterBy.week, filterBy.name)
			setCurrentSchedule(emptySchedule)
		}
	}, [schedules, filterBy])

	// Reset filter whenever user changes
	useEffect(() => {
		if (user) {
			setFilterBy({ week: 'current', name: '' })
		}
	}, [user])

	// Helper to create an empty schedule template
	const createEmptySchedule = (week, branch) => {
		const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

		return {
			id: 'temp-' + Date.now(),
			week: week || 'current',
			branch: branch || '',
			days: days.map(name => ({
				name,
				shifts: []
			}))
		}
	}

	// Check if employee is eligible for given role
	const isEligibleForRole = (employee, role) => {
		// For Moked branch, all employees can be assigned anywhere
		if (filterBy.name === 'מוקד') return true

		// Get the department that corresponds to this role
		const requiredDepartment = DEPARTMENT_ROLE_MAP[role]

		// If no department mapping exists, allow assignment
		if (!requiredDepartment) return true

		// Check if employee belongs to the required department
		return employee.departments && employee.departments.includes(requiredDepartment)
	}

	const handleUpdateSchedule = async (schedule, employeeId, day, role, position) => {
		// Handle case where schedule is an array (select the filtered one)
		if (Array.isArray(schedule)) {
			// Try to find a schedule matching the current filter
			const filteredSchedule = schedule.find(s => s.week === filterBy.week && (filterBy.name ? (s.branch === filterBy.name || s.branchName === filterBy.name) : true))
			schedule = filteredSchedule || (schedule.length > 0 ? schedule[0] : null)
		}

		if (!schedule?.id) return

		try {
			// Find the employee
			const employee = employees.find(e => e.id === employeeId)
			if (!employee) return

			// Check if employee is eligible for this role
			if (!isEligibleForRole(employee, role)) {
				// Store the pending assignment for confirmation dialog
				setPendingAssignment({
					schedule,
					employeeId,
					day,
					role,
					position,
					employeeName: employee.name
				})
				setShowDepartmentAlert(true)
				return
			}

			// If eligible, proceed with assignment
			executeScheduleUpdate(schedule, employeeId, day, role, position)
		} catch (err) {
			console.error('Error checking eligibility:', err)
			toast.error('שגיאה בבדיקת התאמה למחלקה', {
				icon: <AlertTriangle className="h-5 w-5 text-red-500" />
			})
		}
	}

	// Execute the actual schedule update
	const executeScheduleUpdate = async (schedule, employeeId, day, role, position) => {
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
			setCurrentSchedule(scheduleToUpdate)
		} catch (err) {
			console.error('Error updating schedule:', err)
			toast.error('שגיאה בעדכון המשמרת', {
				icon: <AlertTriangle className="h-5 w-5 text-red-500" />
			})
		}
	}

	const handleClearBoard = async schedule => {
		// Handle case where schedule is an array (select the filtered one)
		if (Array.isArray(schedule)) {
			// Try to find a schedule matching the current filter
			const filteredSchedule = schedule.find(s => s.week === filterBy.week && (filterBy.name ? (s.branch === filterBy.name || s.branchName === filterBy.name) : true))
			schedule = filteredSchedule || (schedule.length > 0 ? schedule[0] : null)
		}

		// If no valid schedule found, create a new empty one
		if (!schedule?.id) {
			schedule = createEmptySchedule(filterBy.week, filterBy.name)

			try {
				// Save the new empty schedule to database
				const savedSchedule = await scheduleService.save(schedule)

				// Update both the currentSchedule and schedules array
				setCurrentSchedule(savedSchedule)

				// Reload schedules to ensure state is in sync
				await loadSchedules({ week: filterBy.week, branch: filterBy.name })

				toast.success('נוצר סידור חדש', {
					icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
				})
				return
			} catch (error) {
				console.error('Error creating new schedule:', error)
				toast.error('שגיאה ביצירת סידור חדש', {
					icon: <XCircle className="h-5 w-5 text-red-500" />
				})
				return
			}
		}

		try {
			const clearedSchedule = {
				...schedule,
				days: schedule.days.map(day => ({ ...day, shifts: [] }))
			}

			// Update the schedule in the backend
			await updateSchedule(clearedSchedule)

			// Update the local state
			setCurrentSchedule(clearedSchedule)

			// Update the schedules array with the cleared schedule
			// This is important to ensure the state is properly updated
			const updatedSchedules = schedules.map(s => (s.id === clearedSchedule.id ? clearedSchedule : s))

			// Manually update the schedules state
			useScheduleStore.setState({ schedules: updatedSchedules })

			// Reload schedules to ensure complete sync
			setTimeout(() => {
				loadSchedules({ week: filterBy.week, branch: filterBy.name })
			}, 500)

			toast.success('הסידור נוקה בהצלחה', {
				icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
			})
		} catch (error) {
			console.error('Error clearing schedule:', error)
			toast.error('שגיאה בניקוי הסידור', {
				icon: <XCircle className="h-5 w-5 text-red-500" />
			})
		}
	}

	const getAssignedEmployee = (schedule, day, role, position) => {
		// Handle case where schedule is an array (select the filtered one)
		if (Array.isArray(schedule)) {
			// Try to find a schedule matching the current filter
			const filteredSchedule = schedule.find(s => s.week === filterBy.week && (filterBy.name ? (s.branch === filterBy.name || s.branchName === filterBy.name) : true))
			schedule = filteredSchedule || (schedule.length > 0 ? schedule[0] : null)
		}

		// Handle null schedule gracefully
		if (!schedule) {
			return null
		}

		if (!schedule.days || !Array.isArray(schedule.days)) {
			return null
		}

		const dayData = schedule.days.find(d => d.name === day)
		if (!dayData) {
			return null
		}

		if (!dayData.shifts || !Array.isArray(dayData.shifts)) {
			return null
		}

		const shift = dayData.shifts.find(s => s.role === role && s.position === parseInt(position))

		if (!shift) {
			// This is expected for empty cells - no need to log
			return null
		}

		if (!shift.employeeId) {
			return null
		}

		const employee = employees.find(e => e.id === shift.employeeId)
		if (!employee) {
			return null
		}

		// Add default color if none is present
		if (!employee.color) {
			employee.color = '#6b7280' // Default gray color
		}

		return employee
	}

	const handleRemoveEmployee = async (schedule, day, role, position) => {
		// Handle case where schedule is an array (select the filtered one)
		if (Array.isArray(schedule)) {
			// Try to find a schedule matching the current filter
			const filteredSchedule = schedule.find(s => s.week === filterBy.week && (filterBy.name ? (s.branch === filterBy.name || s.branchName === filterBy.name) : true))
			schedule = filteredSchedule || (schedule.length > 0 ? schedule[0] : null)
		}

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

	// Handle confirmation of department mismatch assignment
	const handleConfirmAssignment = () => {
		if (pendingAssignment) {
			const { schedule, employeeId, day, role, position } = pendingAssignment
			executeScheduleUpdate(schedule, employeeId, day, role, position)
			setPendingAssignment(null)
			setShowDepartmentAlert(false)
		}
	}

	// Handle cancellation of department mismatch assignment
	const handleCancelAssignment = () => {
		setPendingAssignment(null)
		setShowDepartmentAlert(false)
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

			{/* Department mismatch alert dialog */}
			<AlertDialog open={showDepartmentAlert} onOpenChange={setShowDepartmentAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5 text-amber-500" />
							התראת שיבוץ מחלקה
						</AlertDialogTitle>
						<AlertDialogDescription>
							{pendingAssignment && (
								<div>
									<div className="mb-2">
										<strong>{pendingAssignment.employeeName}</strong> אינו שייך למחלקת <strong>{pendingAssignment.role}</strong>.
									</div>
									<div>האם ברצונך לשבץ את העובד למרות זאת כחריג?</div>
								</div>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="gap-2">
						<AlertDialogCancel onClick={handleCancelAssignment}>ביטול</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmAssignment} className="bg-amber-500 hover:bg-amber-600">
							אשר כחריג
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

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
				type={filterBy.name || currentSchedule?.branchName || currentSchedule?.branch}
				currentSchedule={schedules}
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

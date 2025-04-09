import {useEffect, useState, useCallback} from 'react';
import {toast} from 'react-hot-toast';
import {
	Share2,
	ChevronRight,
	ChevronLeft,
	Calendar,
	CalendarDays,
	LayoutGrid,
	Users,
	Building2,
	Menu,
	Clock,
	X,
	ChevronDown,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select';
import {useSystemStore} from '@/stores/useSystemStore';
import {useScheduleStore} from '@/stores/useScheduleStore';
import {useEmployeeStore} from '@/stores/useEmployeeStore';
import {useUserStore} from '@/stores/useUserStore';
import {Loader} from '@/components/Loader';
import {ScheduleDraw} from '@/components/ScheduleDraw';
import {TimeDraw} from '@/components/TimeDraw';
import {ScheduleTable} from '@/components/ScheduleTable';
import {EmployeesList} from '@/components/EmployeesList';
import {DndContext, DragOverlay, useSensor, useSensors, TouchSensor, MouseSensor, pointerWithin} from '@dnd-kit/core';

export function SchedulePage() {
	const user = useUserStore((state) => state.user);
	const filterBy = useSystemStore((state) => state.filterBy);
	const isLoading = useSystemStore((state) => state.isLoading);
	const setFilterBy = useSystemStore((state) => state.setFilterBy);

	const schedules = useScheduleStore((state) => state.schedules);
	const loadSchedules = useScheduleStore((state) => state.loadSchedules);
	const updateSchedule = useScheduleStore((state) => state.updateSchedule);
	const updateScheduleOptimistic = useScheduleStore((state) => state.updateScheduleOptimistic);

	const employees = useEmployeeStore((state) => state.employees);
	const loadEmployees = useEmployeeStore((state) => state.loadEmployees);

	const [isSharing, setIsSharing] = useState(false);
	const [currentSchedule, setCurrentSchedule] = useState(null);
	const [activeEmployee, setActiveEmployee] = useState(null);
	const [weekMode, setWeekMode] = useState('current'); // 'current' or 'next'

	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 200,
				tolerance: 5,
			},
		})
	);

	const initializeSchedule = useCallback(() => {
		if (schedules?.length > 0 && employees?.length > 0) {
			// Reset the current schedule when switching weeks to ensure a clean slate
			const matchingSchedule = schedules.find((s) => s.week === weekMode);

			if (matchingSchedule) {
				// We have a schedule for this specific week
				setCurrentSchedule({
					...matchingSchedule,
					week: weekMode,
				});
			} else {
				// Use the first available schedule but make sure to set the correct week
				setCurrentSchedule({
					...schedules[0],
					days: schedules[0].days || [],
					week: weekMode,
				});
			}
		}
	}, [schedules, employees, weekMode]);

	const loadData = useCallback(async () => {
		try {
			await Promise.all([loadSchedules({...filterBy, week: weekMode}), loadEmployees(filterBy)]);
		} catch (error) {
			console.error('Error loading data:', error);
			toast.error('שגיאה בטעינת הנתונים');
		}
	}, [filterBy, loadSchedules, loadEmployees, weekMode]);

	const updateUserFilter = useCallback(() => {
		if (user?.name && (!filterBy?.name || filterBy.name !== user.name)) {
			setFilterBy({name: user.name});
		}
	}, [user, filterBy?.name, setFilterBy]);

	useEffect(() => {
		initializeSchedule();
	}, [initializeSchedule]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// When week mode changes, reload data and reset current schedule
	useEffect(() => {
		console.log('Week mode changed to:', weekMode);
		loadData();
		// Reset the currentSchedule to force reinitialization after data loads
		setCurrentSchedule(null);
	}, [weekMode]);

	useEffect(() => {
		updateUserFilter();
	}, [updateUserFilter]);

	const handleDragStart = (event) => {
		const {active} = event;

		if (active.data.current?.type === 'employee') {
			setActiveEmployee(active.data.current.employee);
		} else if (active.data.current?.type === 'tableCell') {
			setActiveEmployee(active.data.current.employee);
		}
	};

	const handleDragEnd = (event) => {
		const {active, over} = event;
		if (!over || !currentSchedule) return;

		try {
			if (active.data.current?.type === 'employee') {
				// Handle new employee drop
				const [day, role, position] = over.id.split('-');
				handleUpdateSchedule(currentSchedule, active.id, day, role, parseInt(position));
			} else if (active.data.current?.type === 'tableCell') {
				// Handle cell to cell move
				const [sourceDay, sourceRole, sourcePos] = active.data.current.cellId.split('-');
				const [destDay, destRole, destPosition] = over.id.split('-');

				const moveInfo = {
					type: 'move',
					sourceDay,
					sourceRole,
					sourcePosition: parseInt(sourcePos),
					employeeId: active.data.current.employee.id,
				};

				handleUpdateSchedule(currentSchedule, moveInfo, destDay, destRole, parseInt(destPosition));
			}
		} catch (error) {
			console.error('Drag end error:', error);
			toast.error('שגיאה בעדכון המשמרת');
		}

		setActiveEmployee(null);
	};

	const handleUpdateSchedule = async (schedule, employeeId, day, role, position) => {
		if (!schedule?.id) return;

		try {
			const scheduleToUpdate = JSON.parse(JSON.stringify(schedule));
			scheduleToUpdate.week = weekMode;

			const positionNum = parseInt(position);

			let dayIndex = scheduleToUpdate.days.findIndex((d) => d.name === day);
			if (dayIndex === -1) {
				scheduleToUpdate.days.push({name: day, shifts: []});
				dayIndex = scheduleToUpdate.days.length - 1;
			}

			if (!scheduleToUpdate.days[dayIndex].shifts) {
				scheduleToUpdate.days[dayIndex].shifts = [];
			}

			if (employeeId?.type === 'move') {
				const {sourceDay, sourceRole, sourcePosition, employeeId: actualEmployeeId} = employeeId;
				const sourceDayIndex = scheduleToUpdate.days.findIndex((d) => d.name === sourceDay);
				if (sourceDayIndex === -1) return;

				const destEmployee = scheduleToUpdate.days[dayIndex].shifts.find(
					(shift) => shift.role === role && shift.position === positionNum
				);

				scheduleToUpdate.days[sourceDayIndex].shifts = scheduleToUpdate.days[sourceDayIndex].shifts.filter(
					(shift) => !(shift.role === sourceRole && shift.position === sourcePosition)
				);

				scheduleToUpdate.days[dayIndex].shifts = scheduleToUpdate.days[dayIndex].shifts.filter(
					(shift) => !(shift.role === role && shift.position === positionNum)
				);

				scheduleToUpdate.days[dayIndex].shifts.push({
					role,
					position: positionNum,
					employeeId: actualEmployeeId,
				});

				if (destEmployee) {
					scheduleToUpdate.days[sourceDayIndex].shifts.push({
						role: sourceRole,
						position: sourcePosition,
						employeeId: destEmployee.employeeId,
					});
				}
			} else {
				scheduleToUpdate.days[dayIndex].shifts = scheduleToUpdate.days[dayIndex].shifts.filter(
					(shift) => !(shift.role === role && shift.position === positionNum)
				);

				if (employeeId && employeeId !== 'undefined') {
					scheduleToUpdate.days[dayIndex].shifts.push({
						role,
						position: positionNum,
						employeeId,
					});
				}
			}

			await updateScheduleOptimistic(scheduleToUpdate);
			setCurrentSchedule({...scheduleToUpdate});
		} catch (err) {
			console.error('Error updating schedule:', err);
			toast.error('שגיאה בעדכון המשמרת');
		}
	};

	const handleClearBoard = async (schedule) => {
		// Handle both single schedule and array of schedules
		if (Array.isArray(schedule)) {
			if (!schedule.length) return;
			try {
				const clearedSchedule = {
					...schedule[0],
					days: schedule[0].days.map((day) => ({...day, shifts: []})),
					week: weekMode,
				};
				await updateSchedule(clearedSchedule);
				setCurrentSchedule(clearedSchedule);
				toast.success('הסידור נוקה בהצלחה');
			} catch {
				toast.error('שגיאה בניקוי הסידור');
			}
		} else {
			// Handle single schedule object
			if (!schedule?.id) return;
			try {
				const clearedSchedule = {
					...schedule,
					days: schedule.days.map((day) => ({...day, shifts: []})),
					week: weekMode,
				};
				await updateSchedule(clearedSchedule);
				setCurrentSchedule(clearedSchedule);
				toast.success('הסידור נוקה בהצלחה');
			} catch {
				toast.error('שגיאה בניקוי הסידור');
			}
		}
	};

	const getAssignedEmployee = (schedule, day, role, position) => {
		if (!schedule?.days) return null;

		const dayData = schedule.days.find((d) => d.name === day);
		if (!dayData?.shifts) return null;

		const shift = dayData.shifts.find((s) => s.role === role && s.position === parseInt(position));
		if (!shift?.employeeId) return null;

		return employees.find((e) => e.id === shift.employeeId);
	};

	const handleRemoveEmployee = async (schedule, day, role, position) => {
		if (!schedule?.id) return;

		try {
			const scheduleToUpdate = JSON.parse(JSON.stringify(schedule));
			scheduleToUpdate.week = weekMode;

			const dayObj = scheduleToUpdate.days.find((d) => d.name === day);
			if (!dayObj) return;

			dayObj.shifts = dayObj.shifts.filter((shift) => !(shift.role === role && shift.position === position));

			await updateScheduleOptimistic(scheduleToUpdate);
			setCurrentSchedule(scheduleToUpdate);
		} catch (err) {
			console.error('Error removing employee:', err);
			toast.error('שגיאה בהסרת העובד');
		}
	};

	const handleSetSharing = (value) => {
		setIsSharing(value);
	};

	if (!user) {
		return (
			<div className='flex justify-center items-center h-96 animate-in fade-in duration-500'>
				<div className='text-center text-gray-500'>
					<p className='text-lg font-medium'>אנא התחבר כדי להציג את הסידור</p>
				</div>
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			collisionDetection={pointerWithin}>
			<div className='flex flex-col h-full w-full animate-in fade-in duration-300 space-y-3 max-w-[1900px] mx-auto'>
				{isLoading && <Loader />}

				{/* New streamlined header */}
				<div className='sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm'>
					<div className='flex items-center justify-between px-3 py-2 max-w-[1900px] mx-auto'>
						{/* Left side: Brand and title */}
						<div className='flex pr-1 md:mr-3 items-center gap-3'>
							<div className='h-8 w-8 flex items-center justify-center rounded-full bg-[#BE202E]'>
								<Clock className='h-4 w-4 text-white' />
							</div>
							<h1 className='font-bold text-gray-800'>סידור עבודה</h1>
						</div>

						{/* Right side: Week toggle and branch selector */}
						<div className='flex pl-3 items-center gap-2'>
							{/* Week selector as pill buttons */}
							<div className='flex bg-gray-100 rounded-full p-0.5 border border-gray-200'>
								<button
									onClick={() => setWeekMode('current')}
									className={`px-3 py-1 text-xs rounded-full transition-all ${
										weekMode === 'current'
											? 'bg-[#BE202E] text-white shadow-sm'
											: 'text-gray-600 hover:bg-gray-200'
									}`}>
									שבוע נוכחי
								</button>
								<button
									onClick={() => setWeekMode('next')}
									className={`px-3 py-1 text-xs rounded-full transition-all ${
										weekMode === 'next'
											? 'bg-[#BE202E] text-white shadow-sm'
											: 'text-gray-600 hover:bg-gray-200'
									}`}>
									שבוע הבא
								</button>
							</div>

							{/* Branch selector as a simple dropdown */}
							{user.isAdmin && (
								<Select
									onValueChange={(value) => setFilterBy({...filterBy, name: value})}
									value={filterBy.name}>
									<SelectTrigger className='h-8 text-xs border-gray-200 bg-white min-w-[90px] px-2'>
										<SelectValue placeholder='בחר סניף' />
									</SelectTrigger>
									<SelectContent>
										{['מוקד', 'תל אביב', 'פתח תקווה', 'רשאון לציון', 'ראש העין'].map((branch) => (
											<SelectItem
												key={branch}
												value={branch}>
												{branch}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
					</div>
				</div>

				<div
					className='overflow-x-auto scrollbar-hide px-2 pb-4'
					style={{
						scrollbarWidth: 'none',
						msOverflowStyle: 'none',
					}}>
					<div className='min-w-[640px]'>
						<ScheduleTable
							type={filterBy.name}
							currentSchedule={currentSchedule}
							getAssignedEmployee={getAssignedEmployee}
							handleRemoveEmployee={handleRemoveEmployee}
							handleUpdateSchedule={handleUpdateSchedule}
							employees={employees}
							isSharing={isSharing}
							onClearSchedule={handleClearBoard}
							weekMode={weekMode}
							setIsSharing={handleSetSharing}
						/>
					</div>
				</div>

				<DragOverlay
					dropAnimation={{
						duration: 200,
						easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
					}}>
					{activeEmployee && (
						<div
							className='h-10 flex items-center justify-center text-white rounded-sm shadow-lg'
							style={{
								backgroundColor: activeEmployee.color,
								transform: 'scale(1.05)',
							}}>
							{activeEmployee.name}
						</div>
					)}
				</DragOverlay>
			</div>
		</DndContext>
	);
}

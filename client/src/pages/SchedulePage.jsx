import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {MokedSchedule} from '@/components/MokedSchedule';
import {BranchSchedule} from '@/components/BranchSchedule';
import {useParams} from 'react-router';
import {loadWorkers} from '@/store/worker.actions';
import {showErrorMsg, showSuccessMsg} from '@/services/event-bus.service';
import {scheduleService} from '@/services/schedule/schedule.service.remote';
import {toast} from 'react-hot-toast';
export function SchedulePage() {
	const {branchId} = useParams();
	const {workers} = useSelector((storeState) => storeState.workerModule);
	const {user} = useSelector((storeState) => storeState.userModule);

	const [schedule, setSchedule] = useState(null);

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		loadSchedule();
		loadWorkers();
	}, [branchId]);

	const loadSchedule = async () => {
		try {
			setIsLoading(true);

			const schedules = await scheduleService.getScheduleByBranchId(branchId);

			setSchedule(schedules);

			setIsLoading(false);
		} catch (err) {
			console.error('Failed to load schedule:', err);
			showErrorMsg('אירעה שגיאה בטעינת הסידור');
			setIsLoading(false);
		}
	};

	const handleUpdateSchedule = async (workerId, day, role, position) => {
		if (!schedule) return;

		try {
			console.log('Updating schedule with:', {workerId, day, role, position}); // Debug log

			const updatedSchedule = JSON.parse(JSON.stringify(schedule));
			const dayIndex = updatedSchedule.days.findIndex((d) => d.name === day);

			if (dayIndex === -1) {
				console.log('Day not found:', day); // Debug log
				return;
			}

			const shiftIndex = updatedSchedule.days[dayIndex].shifts.findIndex(
				(shift) => shift.role === role && shift.position === position
			);

			console.log('Current shifts:', updatedSchedule.days[dayIndex].shifts); // Debug log

			if (shiftIndex !== -1) {
				if (updatedSchedule.days[dayIndex].shifts[shiftIndex].workerId === workerId) {
					updatedSchedule.days[dayIndex].shifts.splice(shiftIndex, 1);
				} else {
					updatedSchedule.days[dayIndex].shifts[shiftIndex].workerId = workerId;
				}
			} else {
				updatedSchedule.days[dayIndex].shifts.push({
					role,
					position,
					workerId,
				});
			}

			console.log('Updated schedule:', updatedSchedule); // Debug log
			await scheduleService.update(updatedSchedule);
			await loadSchedule();
		} catch (error) {
			console.error('Error updating schedule:', error); // Debug log
			toast.error('שגיאה בעדכון המשמרת');
		}
	};

	const handleClearBoard = async () => {
		if (!schedule) return;

		try {
			const clearedSchedule = {...schedule};
			clearedSchedule.days = clearedSchedule.days.map((day) => ({
				...day,
				shifts: [],
			}));

			const savedSchedule = await scheduleService.update(clearedSchedule);
			setSchedule(savedSchedule);
			showSuccessMsg('הסידור נוקה בהצלחה');
		} catch (err) {
			console.error('Failed to clear schedule:', err);
			showErrorMsg('אירעה שגיאה בניקוי הסידור');
		}
	};

	const getAssignedWorker = (day, role, position) => {
		if (!schedule) return null;

		const dayObj = schedule.days?.find((d) => d.name === day);
		if (!dayObj) return null;

		const shift = dayObj.shifts.find((s) => s.role === role && s.position === position);
		if (!shift) return null;

		return workers.find((w) => w._id === shift.workerId);
	};

	if (isLoading) {
		return <div className='flex justify-center items-center h-96'>טוען נתונים...</div>;
	}

	if (!user) return <div className='text-center text-gray-500 mt-10'>אנא התחבר כדי להציג את הסידור</div>;

	return (
		<div className='flex flex-col h-full'>
			{user && user.username === 'moked' ? (
				<MokedSchedule
					schedule={schedule}
					handleClearBoard={handleClearBoard}
					getAssignedWorker={getAssignedWorker}
					onUpdateSchedule={handleUpdateSchedule}
				/>
			) : (
				<BranchSchedule
					branchId={branchId}
					workers={workers}
					getAssignedWorker={getAssignedWorker}
					handleClearBoard={handleClearBoard}
					onUpdateSchedule={handleUpdateSchedule}
				/>
			)}
		</div>
	);
}

import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {MokedSchedule} from '@/components/MokedSchedule';
import {BranchSchedule} from '@/components/BranchSchedule';
import {useParams} from 'react-router';
import {loadWorkers} from '@/store/worker.actions';
import {showErrorMsg, showSuccessMsg} from '@/services/event-bus.service';
import {scheduleService} from '@/services/schedule/schedule.service.remote';
import {toast} from 'react-hot-toast';
import {Loader2} from 'lucide-react';

export function SchedulePage({filterBy}) {
	const {branchId} = useParams();
	const {workers} = useSelector((storeState) => storeState.workerModule);
	const {user} = useSelector((storeState) => storeState.userModule);

	const [schedule, setSchedule] = useState(null);

	// eslint-disable-next-line no-unused-vars
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		loadSchedule();
		loadWorkers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [branchId, filterBy]);

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
			setIsUpdating(true);
			console.log('Updating schedule with:', {workerId, day, role, position});

			const updatedSchedule = JSON.parse(JSON.stringify(schedule));
			const dayIndex = updatedSchedule.days.findIndex((d) => d.name === day);

			if (dayIndex === -1) {
				console.log('Day not found:', day);
				return;
			}

			const shiftIndex = updatedSchedule.days[dayIndex].shifts.findIndex(
				(shift) => shift.role === role && shift.position === position
			);

			console.log('Current shifts:', updatedSchedule.days[dayIndex].shifts);

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

			console.log('Updated schedule:', updatedSchedule);
			await scheduleService.update(updatedSchedule);
			await loadSchedule();
		} catch (error) {
			console.error('Error updating schedule:', error);
			toast.error('שגיאה בעדכון המשמרת');
		} finally {
			setIsUpdating(false);
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

	const LoadingOverlay = () => (
		<div className='absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50'>
			<div className='flex flex-col items-center gap-2'>
				<Loader2 className='w-8 h-8 animate-spin text-red-600' />
				<span className='text-gray-600 font-medium'>מעדכן...</span>
			</div>
		</div>
	);

	// if (isLoading) {
	// 	return (
	// 		<div className='flex justify-center items-center h-96 animate-in fade-in duration-500'>
	// 			<div className='flex flex-col items-center gap-2'>
	// 				<Loader2 className='w-10 h-10 animate-spin text-red-600' />
	// 				<span className='text-gray-600 font-medium'>טוען נתונים...</span>
	// 			</div>
	// 		</div>
	// 	);
	// }

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
		<div className='flex flex-col h-full relative animate-in fade-in duration-300'>
			{isUpdating && <LoadingOverlay />}

			{filterBy?.branch === 'moked' ? (
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

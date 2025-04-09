import {create} from 'zustand';
import {scheduleService} from '../services/schedule/schedule.service.remote';
import {useSystemStore} from './useSystemStore';
import {toast} from 'react-hot-toast';
import {debounce} from '@/services/util.service';

// Create the schedule store
export const useScheduleStore = create((set, get) => ({
	// Initial state
	schedule: null,
	schedules: [],
	error: null,
	lastRemovedSchedule: null,

	// Actions
	setSchedules: (schedules) => set({schedules: Array.isArray(schedules) ? schedules : [schedules].filter(Boolean)}),
	setSchedule: (schedule) => set({schedule}),
	setError: (error) => set({error}),

	// Async actions
	loadSchedules: async (filterBy) => {
		const {startLoading, stopLoading} = useSystemStore.getState();
		try {
			startLoading();
			const schedules = await scheduleService.query({...filterBy});
			// Ensure schedules is always an array
			set({schedules: Array.isArray(schedules) ? schedules : [schedules].filter(Boolean)});
		} catch (err) {
			console.log('Cannot load schedules', err);
			throw err;
		} finally {
			stopLoading();
		}
	},

	removeSchedule: async (scheduleId) => {
		try {
			await scheduleService.remove(scheduleId);
			const lastRemovedSchedule = get().schedules.find((schedule) => schedule.id === scheduleId);
			set((state) => ({
				schedules: state.schedules.filter((schedule) => schedule.id !== scheduleId),
				lastRemovedSchedule,
			}));
		} catch (err) {
			console.log('Cannot remove schedule', err);
			throw err;
		}
	},

	addSchedule: async (schedule) => {
		try {
			if (schedule.name.length < 2) {
				throw new Error('שם העובד חייב להכיל לפחות 2 תווים');
			}

			const savedSchedule = await scheduleService.save(schedule);
			set((state) => ({
				schedules: [...state.schedules, savedSchedule],
			}));
			return savedSchedule;
		} catch (err) {
			console.log('Cannot add schedule', err);
			throw err;
		}
	},

	updateScheduleOptimistic: async (schedule) => {
		// Remove unused variable
		const schedules = get().schedules;

		try {
			// Ensure schedules is an array
			const schedulesArray = Array.isArray(schedules) ? schedules : [schedules].filter(Boolean);

			// Make sure the week parameter is preserved
			const week = schedule.week || 'current';
			console.log('Updating schedule with week mode:', week);

			// Optimistically update UI
			set({
				schedules: schedulesArray.map((s) => (s.id === schedule.id ? {...schedule, week} : s)),
			});

			// Make API call
			const savedSchedule = await scheduleService.save(schedule);
			return savedSchedule;
		} catch (err) {
			// Rollback on error
			set({
				schedules: Array.isArray(schedules) ? schedules : [schedules].filter(Boolean),
			});
			toast.error('שגיאה בעדכון המשמרת');
			throw err;
		}
	},

	updateScheduleDebounced: (schedule) => {
		debounce(get().updateSchedule(schedule), 300);
	},

	updateSchedule: async (schedule) => {
		const {startLoading, stopLoading} = useSystemStore.getState();
		try {
			startLoading();

			// Make sure the week parameter is preserved
			const week = schedule.week || 'current';

			const savedSchedule = await scheduleService.save(schedule);
			set((state) => ({
				schedules: Array.isArray(state.schedules)
					? state.schedules.map((s) => (s.id === savedSchedule.id ? {...savedSchedule, week} : s))
					: [savedSchedule],
			}));
			return savedSchedule;
		} catch (err) {
			console.log('Cannot save schedule', err);
			throw err;
		} finally {
			stopLoading();
		}
	},
}));

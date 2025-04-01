import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './ui/table';
import {useDroppable, useDraggable} from '@dnd-kit/core';
import {format, startOfWeek, addDays} from 'date-fns';
import {he} from 'date-fns/locale'; // Hebrew locale

import {memo} from 'react';

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const SHIFTS = ['morning', 'noon', 'evening'];
const SHIFT_NAMES = {
	morning: 'בוקר',
	noon: 'אמצע',
	evening: 'ערב',
};

const BRANCH_ROLES = {
	manager: {name: 'אחמ"ש', positions: 1},
	waiters: {name: 'מלצרים', positions: 5},
	cooks: {name: 'טבחים', positions: 6},
};

function DroppableCell({id, employee, onRemove}) {
	const {setNodeRef: setDroppableRef, isOver} = useDroppable({
		id,
		data: {
			type: 'cell',
			cellId: id,
		},
	});

	const {
		attributes,
		listeners: dndListeners,
		setNodeRef: setDraggableRef,
		isDragging,
	} = useDraggable({
		id: `draggable-${id}`,
		data: {
			type: 'tableCell',
			cellId: id,
			employee,
		},
		disabled: !employee,
	});

	const listeners = {
		...dndListeners,
		onMouseDown: (e) => {
			let dragStarted = false;
			const timeout = setTimeout(() => {
				dragStarted = true;
				dndListeners.onMouseDown(e);
			}, 150); // 200ms delay before drag starts

			const handleMouseUp = () => {
				if (!dragStarted) {
					// If we release before the delay, treat it as a click
					onRemove(id);
				}
				clearTimeout(timeout);
				window.removeEventListener('mouseup', handleMouseUp);
			};

			window.addEventListener('mouseup', handleMouseUp);
		},
	};

	const ref = (node) => {
		setDroppableRef(node);
		if (employee) {
			setDraggableRef(node);
		}
	};

	return (
		<div
			ref={ref}
			{...attributes}
			{...listeners}
			className={`h-8 w-full border border-gray-200 relative
        flex items-center justify-center text-white truncate px-1
        ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
        ${employee ? 'cursor-pointer group' : ''}`}
			style={{
				backgroundColor: employee?.color || 'transparent',
				opacity: isDragging ? 0 : 1,
			}}>
			<div className='absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity' />
			{!isDragging && <span className='relative z-10 group-hover:hidden'>{employee?.name}</span>}
			{!isDragging && employee && (
				<span className='relative z-10 hidden group-hover:block text-sm  '>לחץ להסרה</span>
			)}
		</div>
	);
}

export const ScheduleTable = memo(
	function ScheduleTable({type, currentSchedule, getAssignedEmployee, handleRemoveEmployee, isSharing}) {
		const getWeekDates = () => {
			const today = new Date();
			const startOfTheWeek = startOfWeek(today, {weekStartsOn: 0}); // 0 = Sunday

			return DAYS.map((day, index) => {
				const date = addDays(startOfTheWeek, index);
				return {
					name: day,
					date: format(date, 'd/M', {locale: he}),
				};
			});
		};

		const isToday = (dayName) => {
			const today = new Date();
			const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
			return hebrewDays[today.getDay()] === dayName;
		};

		const isMoked = type === 'מוקד';
		const POSITIONS_PER_SHIFT = isMoked ? 3 : null;

		const renderCell = (day, role, position) => {
			const cellId = `${day}-${role}-${position}`;
			const employee = getAssignedEmployee(currentSchedule, day, role, position);

			return (
				<DroppableCell
					key={cellId}
					id={cellId}
					employee={employee}
					onRemove={() => handleRemoveEmployee(currentSchedule, day, role, position)}
				/>
			);
		};

		const renderMokedLayout = () => (
			<TableBody>
				{SHIFTS.flatMap((shift) =>
					Array.from({length: POSITIONS_PER_SHIFT}, (_, index) => {
						const position = index + 1;
						return (
							<TableRow
								key={`${shift}-${position}`}
								className='h-10'>
								<TableCell
									className={`text-center font-medium text-sm p-1 w-[80p]
                    ${
						position === 1
							? 'bg-[#BE202E]/10 text-[#BE202E] font-bold border-t-4 border-t-[#BE202E]'
							: '  border-t-0  bg-gray-100/50'
					}`}>
									{position === 1 ? SHIFT_NAMES[shift] : ''}
								</TableCell>
								{DAYS.map((day) => (
									<TableCell
										key={`${day}-${shift}-${position}`}
										className={`p-2 w-[80px] border-x ${position === 1 ? '' : ''}`}>
										{renderCell(day, shift, position)}
									</TableCell>
								))}
							</TableRow>
						);
					})
				)}
			</TableBody>
		);

		const renderBranchLayout = () => (
			<TableBody>
				{Object.entries(BRANCH_ROLES).flatMap(([role, config]) =>
					Array.from({length: config.positions}, (_, index) => {
						const position = index + 1;
						return (
							<TableRow
								key={`${role}-${position}`}
								className='h-10'>
								<TableCell
									className={`text-center font-medium border-l border text-sm p-1 w-[80px] max-w-[80px]
                      ${
							position === 1
								? 'bg-[#BE202E]/10 text-[#BE202E] font-bold border-t-4 border-t-[#BE202E]'
								: 'border-t-0 bg-gray-100/50'
						}`}>
									{position === 1 ? config.name : ''}
								</TableCell>
								{DAYS.map((day) => (
									<TableCell
										key={`${day}-${role}-${position}`}
										className={`p-2 w-[80px] border-x ${position === 1 ? '' : 'border-t-0'}`}>
										{renderCell(day, role, position)}
									</TableCell>
								))}
							</TableRow>
						);
					})
				)}
			</TableBody>
		);

		return (
			<div className='overflow-auto touch-pan-x touch-pan-y -mx-4 px-4 scrollbar-hide'>
				<div
					id='schedule-table-for-share'
					className={``}>
					<Table className='w-full table-fixed min-w-[640px] scrollbar-hide'>
						<TableHeader>
							<TableRow>
								<TableHead className='text-center font-medium bg-gray-100/50 text-zinc-900'>
									משמרת
								</TableHead>
								{getWeekDates().map(({name, date}) => (
									<TableHead
										key={name}
										className={`text-center font-medium text-sm whitespace-nowrap p-2 border-x ${
											isToday(name)
												? 'bg-[#BE202E]/10 text-[#BE202E] font-bold border-t-4 border-t-[#BE202E]'
												: 'font-medium bg-gray-100/50'
										}`}>
										<div className='text-center'>{name}</div>
										<div className={`text-sm text-zinc-900 mt-1`}>{date}</div>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>

						{isMoked ? renderMokedLayout() : renderBranchLayout()}
					</Table>
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => {
		const shouldUpdate =
			prevProps.type !== nextProps.type ||
			prevProps.currentSchedule !== nextProps.currentSchedule ||
			JSON.stringify(prevProps.currentSchedule?.days) !== JSON.stringify(nextProps.currentSchedule?.days);

		return !shouldUpdate;
	}
);

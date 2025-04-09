import {useDroppable} from '@dnd-kit/core';
import {Button} from './ui/button';
import {Plus, X, Trash2} from 'lucide-react';
import {useState, useEffect} from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from './ui/alert-dialog';

export function DroppableCell({
	id,
	employee,
	onRemove,
	onSwap,
	isSelected,
	isSwappable,
	highlightedDay,
	selectedEmployee,
	onCellClick,
}) {
	const {setNodeRef, isOver} = useDroppable({
		id,
		data: {
			type: 'cell',
			cellId: id,
		},
	});

	// State for swap mode
	const [isSwapMode, setIsSwapMode] = useState(false);

	// State for mobile detection
	const [isMobile, setIsMobile] = useState(
		typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
	);

	// Setup mobile check on window resize
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const checkMobile = () => {
			setIsMobile(window.matchMedia('(max-width: 768px)').matches);
		};

		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Handle delete directly without confirmation
	const handleDelete = (e) => {
		e.stopPropagation();
		onRemove(id);
	};

	// Handle cell click
	const handleClick = () => {
		// If we have a selected employee, place them in this cell
		if (selectedEmployee) {
			onCellClick?.();
		} else if (isSwapMode && employee) {
			// Handle swap mode
			onSwap(id);
			setIsSwapMode(false);
		}
	};

	return (
		<div
			ref={setNodeRef}
			className={`h-8 w-full relative 
        flex items-center justify-center text-white truncate px-1
        ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
        ${isSwapMode ? 'ring-2 ring-green-500' : ''}
        ${isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''}
        ${isSwappable ? 'ring-1 ring-green-300 bg-green-50/30' : ''}
        ${highlightedDay ? 'bg-yellow-50/20' : ''}
        ${selectedEmployee ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:bg-blue-50/50' : ''}
        ${employee ? '' : 'bg-gray-50 hover:bg-gray-100'}`}
			style={{
				backgroundColor: employee?.color || 'transparent',
			}}
			onClick={handleClick}>
			{employee ? (
				// Employee is assigned - show the employee
				<>
					<span className='text-center truncate px-1 w-full'>{employee.name}</span>

					{/* Don't show controls if we're in select employee mode */}
					{!selectedEmployee && (
						<>
							{/* Mobile buttons - always visible but faint */}
							{isMobile ? (
								<div className='absolute inset-0 bg-black/10 flex items-center justify-end pr-1'>
									<button
										className='h-7 w-7 rounded-full bg-white/40 hover:bg-white/80 flex items-center justify-center text-red-500'
										onClick={handleDelete}>
										<Trash2 className='h-3.5 w-3.5' />
									</button>
								</div>
							) : (
								/* Desktop overlay with buttons - shown on hover */
								<div className='absolute inset-0 opacity-0 hover:opacity-100 bg-black/10 flex items-center justify-center transition-opacity'>
									{/* Remove button */}
									<Button
										variant='ghost'
										size='icon'
										className='h-6 w-6 bg-white/90 hover:bg-white'
										onClick={handleDelete}>
										<X className='h-3 w-3 text-red-500' />
									</Button>
								</div>
							)}
						</>
					)}
				</>
			) : // No employee - show visual indicator if we have a selected employee
			selectedEmployee ? (
				<div className='w-full h-full flex items-center justify-center'>
					<div className='w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center'>
						<Plus className='h-3 w-3 text-blue-500' />
					</div>
				</div>
			) : (
				// Empty cell - no content when no employee is selected
				<div className='w-full h-full'></div>
			)}

			{/* Show placement indicator when employee is selected */}
			{selectedEmployee && (
				<div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
					<div className='absolute inset-0 bg-blue-50/20'></div>
					{employee && (
						<div className='bg-white/80 px-2 py-0.5 rounded shadow-sm text-xs text-blue-700'>החלף</div>
					)}
				</div>
			)}
		</div>
	);
}

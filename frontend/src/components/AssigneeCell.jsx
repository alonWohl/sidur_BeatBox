import { Button } from './ui/button'
import { Plus, X, Trash2, RefreshCcw, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'

export function AssigneeCell({
	id,
	employee,
	onRemove,
	// eslint-disable-next-line no-unused-vars
	onSwap,
	// eslint-disable-next-line no-unused-vars
	isSelected,
	// eslint-disable-next-line no-unused-vars
	isSwappable,
	highlightedDay,
	selectedEmployee,
	onCellClick
}) {
	// Parse the department from the cell ID
	const [, role] = id ? id.split('-') : []
	const isValidDepartment =
		!selectedEmployee || role === 'morning' || role === 'noon' || role === 'evening' || (selectedEmployee.departments && selectedEmployee.departments.includes(role))

	// State for mobile detection
	const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	useEffect(() => {
		if (typeof window === 'undefined') return

		const checkMobile = () => {
			setIsMobile(window.matchMedia('(max-width: 768px)').matches)
		}

		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	// Reset delete confirmation when employee changes
	useEffect(() => {
		setShowDeleteConfirm(false)
	}, [employee])

	const handleDelete = e => {
		e.stopPropagation()
		if (isMobile) {
			if (!showDeleteConfirm) {
				setShowDeleteConfirm(true)
				// Auto-hide the confirmation after 3 seconds
				setTimeout(() => setShowDeleteConfirm(false), 3000)
			} else {
				onRemove(id)
				setShowDeleteConfirm(false)
			}
		} else {
			onRemove(id)
		}
	}

	const handleClick = () => {
		if (selectedEmployee) {
			onCellClick?.()
		} else if (employee) {
			// onSwap(id);
		}
	}

	return (
		<div
			className={`h-full w-full relative 
        flex items-center justify-center text-white truncate px-0.5
        ${highlightedDay ? 'bg-yellow-50/20' : ''}
        ${selectedEmployee ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:bg-blue-50/50' : ''}
        ${employee ? '' : 'bg-gray-50 hover:bg-gray-100'}`}
			style={{
				backgroundColor: employee?.color || 'transparent',
				minHeight: isMobile ? '28px' : '36px'
			}}
			onClick={handleClick}
		>
			{employee ? (
				// Employee is assigned - show the employee
				<>
					<span className="text-center truncate w-full text-[10px] sm:text-xs font-medium leading-tight">{employee.name}</span>

					{/* Don't show controls if we're in select employee mode */}
					{!selectedEmployee && (
						<>
							{/* Mobile view - show delete confirmation */}
							{isMobile ? (
								<div
									className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${showDeleteConfirm ? 'bg-black/40' : 'bg-black/5'}`}
									onClick={handleDelete}
								>
									{showDeleteConfirm && <span className="text-[10px] font-medium text-white bg-black/50 px-2 py-1 rounded-full">לחץ להסרה</span>}
								</div>
							) : (
								/* Desktop overlay with buttons - shown on hover */
								<div className="absolute inset-0 opacity-0 hover:opacity-100 bg-black/10 flex items-center justify-center transition-opacity">
									{/* Remove button */}
									<Button variant="ghost" size="icon" className="h-6 w-6 bg-white/90 hover:bg-white" onClick={handleDelete}>
										<X className="h-3 w-3 text-zinc-900" />
									</Button>
								</div>
							)}
						</>
					)}
				</>
			) : // No employee - show visual indicator if we have a selected employee
			selectedEmployee ? (
				<div className="w-full h-full flex items-center justify-center">
					{isValidDepartment ? (
						<div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-zinc-100 flex items-center justify-center">
							<Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-zinc-800" />
						</div>
					) : (
						<div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-100 flex items-center justify-center">
							<AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
						</div>
					)}
				</div>
			) : (
				// Empty cell - no content when no employee is selected
				<div className="w-full h-full"></div>
			)}

			{/* Show placement indicator when employee is selected */}
			{selectedEmployee && (
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="absolute inset-0 bg-blue-50/20"></div>
					{employee && (
						<div className="bg-white/80 px-1 py-0.5 rounded shadow-sm text-[8px] sm:text-xs text-blue-700">
							<RefreshCcw className="h-2 w-2 sm:h-3 sm:w-3" />
						</div>
					)}
				</div>
			)}
		</div>
	)
}

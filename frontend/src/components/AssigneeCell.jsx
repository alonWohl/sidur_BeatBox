import { Button } from './ui/button'
import { Plus, X, Trash2, RefreshCcw, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useScheduleStore } from '../stores/useScheduleStore'
import { useEmployeeStore } from '../stores/useEmployeeStore'
import { toast } from 'react-hot-toast'

// Helper function to determine text color based on background
const getContrastColor = bgColor => {
	// Default to black if no color is provided
	if (!bgColor) return '#000000'

	// Convert hex to RGB
	let color = bgColor
	if (color.startsWith('#')) {
		const r = parseInt(color.slice(1, 3), 16)
		const g = parseInt(color.slice(3, 5), 16)
		const b = parseInt(color.slice(5, 7), 16)

		// Calculate luminance
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

		// Return white for dark colors, black for light colors
		return luminance > 0.5 ? '#000000' : '#ffffff'
	}

	// Default to black for unknown formats
	return '#000000'
}

// Role to department mapping
const DEPARTMENT_ROLE_MAP = {
	// Branch roles from the codebase
	'אחמ"ש': ['manager'],
	מלצרים: ['waiters'],
	מתלמדים: ['waiters', 'cooks'], // Apprentices can be both waiters and cooks
	טבחים: ['cooks'],

	// Moked shift roles
	morning: ['moked'],
	noon: ['moked'],
	evening: ['moked'],

	// Other possible roles
	position: null, // For positions that don't have specific departments

	// Legacy roles (keeping for backward compatibility)
	manager: ['moked'],
	shift_manager: ['moked'],
	team_leader: ['moked'],
	call_center: ['moked'],
	branch_manager: ['branch', 'digital'],
	banker: ['branch', 'digital'],
	teller: ['branch', 'operations'],
	greeter: ['branch', 'operations']
}

// Check if employee is eligible for role
const isEligibleForRole = (employee, role) => {
	// Check if any of the required values are missing
	if (!employee) return true
	if (!role) return true
	if (!DEPARTMENT_ROLE_MAP[role]) return true // If we don't have a mapping, don't restrict

	// If employee doesn't have departments assigned, consider them eligible
	if (!employee.departments || employee.departments.length === 0) return true

	const allowedDepartments = DEPARTMENT_ROLE_MAP[role]

	// Check if any of employee's departments match allowed departments
	const isEligible = employee.departments.some(dept => allowedDepartments.includes(dept))
	return isEligible
}

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
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const { employees } = useEmployeeStore()

	// Get department from id (format: "day-role-branch")
	// Example: "sunday-banker-tlv" or "שבת-טבחים-3"
	const parseRoleFromId = id => {
		if (!id) return null

		// Expected format: 'day-role-index' or similar pattern
		const parts = id.split('-')

		// We want the role part which should be the second element (index 1)
		if (parts.length >= 2) {
			const role = parts[1] // Get the role part (e.g., "טבחים")
			return role
		}

		return null
	}

	const role = parseRoleFromId(id)

	// Determine if the selected employee is eligible for this role
	const isValidDepartment = !selectedEmployee || isEligibleForRole(selectedEmployee, role)

	// Check if assigned employee is in the wrong department
	const isDepartmentMismatch = employee && !isEligibleForRole(employee, role)

	// Check if we're trying to place an employee in a mismatched department
	const isAttemptingMismatch = selectedEmployee && !isValidDepartment

	// State for mobile detection
	const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches)
	const [showPopup, setShowPopup] = useState(false)

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

	useEffect(() => {
		if (showPopup) {
			const timeout = setTimeout(() => {
				setShowPopup(false)
			}, 3000)
			return () => clearTimeout(timeout)
		}
	}, [showPopup])

	const handleDelete = e => {
		e.stopPropagation()
		if (isMobile) {
			if (!showDeleteConfirm) {
				setShowDeleteConfirm(true)

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
			// Only allow assignment if the employee's department matches the role requirements
			if (isValidDepartment) {
				onCellClick?.()
			} else {
				// Show warning for department mismatch
				toast.error('העובד לא שייך למחלקה המתאימה', {
					icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
				})
			}
		} else if (employee) {
			// onSwap(id);
		}
	}

	return (
		<div
			className={`h-full w-full relative group overflow-visible
        ${highlightedDay ? 'bg-yellow-50/20' : ''}
        ${selectedEmployee ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:bg-blue-50/50' : ''}
        ${employee ? '' : 'bg-gray-50 hover:bg-gray-100'}`}
			style={{
				backgroundColor: employee ? employee.color || '#6b7280' : 'transparent',
				minHeight: isMobile ? '28px' : '36px'
			}}
			onClick={handleClick}
		>
			{employee ? (
				// Employee is assigned - show the employee
				<div className="flex items-center justify-center w-full h-full">
					<span
						className="text-center truncate w-full text-[10px] sm:text-xs font-medium leading-tight"
						style={{
							color: getContrastColor(employee?.color || '#ffffff'),
							textShadow: '0px 0px 1px rgba(0,0,0,0.2)'
						}}
					>
						{employee.name}
					</span>

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
								<div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/10 flex items-center justify-center transition-opacity">
									{/* Remove button */}
									<Button variant="ghost" size="icon" className="h-6 w-6 bg-white/90 hover:bg-white" onClick={handleDelete}>
										<X className="h-3 w-3 text-zinc-900" />
									</Button>
								</div>
							)}
						</>
					)}

					{/* Department mismatch indicator */}
					{isDepartmentMismatch && (
						<div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
							<div className="flex items-center justify-center w-4 h-4 bg-amber-400 text-amber-900 rounded-full shadow-md animate-pulse">
								<AlertTriangle className="h-2.5 w-2.5" />
							</div>
						</div>
					)}
				</div>
			) : // No employee - show visual indicator if we have a selected employee
			selectedEmployee ? (
				<div className="w-full h-full flex items-center justify-center">
					{isValidDepartment ? (
						<div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-zinc-100 flex items-center justify-center">
							<Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-zinc-800" />
						</div>
					) : (
						<div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 flex items-center justify-center">
							<AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
						</div>
					)}
				</div>
			) : (
				// Empty cell - no content when no employee is selected
				<div className="w-full h-full"></div>
			)}

			{showPopup && (
				<div className="absolute inset-0 flex items-center justify-center z-50 bg-white rounded-md shadow-lg border border-gray-200">
					<button onClick={onRemove} className="px-1 py-0.5 sm:px-2 sm:py-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 transition-colors">
						הסר
					</button>
				</div>
			)}
		</div>
	)
}

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './ui/table';
import {format, startOfWeek, addDays} from 'date-fns';
import {he} from 'date-fns/locale'; // Hebrew locale
import React, {useState, useCallback, useEffect} from 'react';
import {DroppableCell} from './DroppableCell';
import {toast} from 'react-hot-toast';
import {Check, X, Share2, Trash2, LayoutGrid, Users} from 'lucide-react';
import {Button} from './ui/button';
import {ChevronDown, ChevronUp} from 'lucide-react';

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

export const ScheduleTable = React.memo(
	({
		type,
		currentSchedule,
		getAssignedEmployee,
		handleRemoveEmployee,
		handleUpdateSchedule,
		employees,
		isSharing,
		onClearSchedule,
		weekMode = 'current',
		setIsSharing,
	}) => {
		const [selectedForSwap, setSelectedForSwap] = useState(null);
		const [allCells, setAllCells] = useState([]);
		const [highlightedDay, setHighlightedDay] = useState(null);
		const [selectedEmployee, setSelectedEmployee] = useState(null);

		// Set up allCells for proper tracking
		useEffect(() => {
			const cells = [];
			DAYS.forEach((day) => {
				if (type === 'מוקד') {
					SHIFTS.forEach((shift) => {
						const positions = shift === 'morning' ? 3 : shift === 'noon' ? 1 : 3;
						for (let i = 1; i <= positions; i++) {
							cells.push(`${day}-${shift}-${i}`);
						}
					});
				} else {
					Object.entries(BRANCH_ROLES).forEach(([role, config]) => {
						for (let i = 1; i <= config.positions; i++) {
							cells.push(`${day}-${role}-${i}`);
						}
					});
				}
			});
			setAllCells(cells);
		}, [type]);

		const getWeekDates = () => {
			const today = new Date();
			let startOfTheWeek = startOfWeek(today, {weekStartsOn: 0});

			// Add 7 days for next week's schedule
			if (weekMode === 'next') {
				startOfTheWeek = addDays(startOfTheWeek, 7);
			}

			return DAYS.map((day, index) => {
				const date = addDays(startOfTheWeek, index);
				return {
					name: day,
					date: format(date, 'd/M', {locale: he}),
				};
			});
		};

		const isToday = (dayName) => {
			// Only consider days as "today" in current week mode
			if (weekMode === 'next') return false;

			const today = new Date();
			const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
			return hebrewDays[today.getDay()] === dayName;
		};

		const isMoked = type === 'מוקד';
		const POSITIONS_PER_SHIFT = isMoked ? 3 : null;

		// Helper function to add an employee to a cell
		const addEmployee = useCallback(
			(day, role, position, employeeId) => {
				handleUpdateSchedule(currentSchedule, employeeId, day, role, parseInt(position));
				// Clear selected employee after adding
				setSelectedEmployee(null);
			},
			[currentSchedule, handleUpdateSchedule]
		);

		// Handle swapping between cells
		const handleSwap = useCallback(
			(cellId) => {
				if (!selectedForSwap) {
					setSelectedForSwap(cellId);
					toast.success('בחר תא נוסף להחלפה');
					return;
				}

				if (selectedForSwap === cellId) {
					setSelectedForSwap(null);
					return;
				}

				// Now we have both cells, perform the swap
				const [srcDay, srcRole, srcPos] = selectedForSwap.split('-');
				const [destDay, destRole, destPos] = cellId.split('-');

				// Get the employees in both cells
				const srcEmployee = getAssignedEmployee(currentSchedule, srcDay, srcRole, srcPos);
				const destEmployee = getAssignedEmployee(currentSchedule, destDay, destRole, destPos);

				if (!srcEmployee || !destEmployee) {
					toast.error('לא ניתן להחליף עם תא ריק');
					setSelectedForSwap(null);
					return;
				}

				// First remove the employees from both cells
				handleRemoveEmployee(currentSchedule, srcDay, srcRole, srcPos);
				handleRemoveEmployee(currentSchedule, destDay, destRole, destPos);

				// Then add them in swapped positions
				addEmployee(srcDay, srcRole, srcPos, destEmployee.id);
				addEmployee(destDay, destRole, destPos, srcEmployee.id);

				toast.success('העובדים הוחלפו בהצלחה');
				setSelectedForSwap(null);
			},
			[selectedForSwap, currentSchedule, getAssignedEmployee, handleRemoveEmployee, addEmployee]
		);

		// Handle cell click - either place the selected employee or show controls
		const handleCellClick = useCallback(
			(day, role, position, currentEmployee) => {
				if (selectedEmployee) {
					// If cell is occupied, remove current employee first
					if (currentEmployee) {
						handleRemoveEmployee(currentSchedule, day, role, position);
					}

					// Add the selected employee
					addEmployee(day, role, position, selectedEmployee.id);
					toast.success(`נוסף ${selectedEmployee.name} למשמרת`);
				}
			},
			[selectedEmployee, handleRemoveEmployee, currentSchedule, addEmployee]
		);

		const renderCell = useCallback(
			(day, role, position) => {
				const cellId = `${day}-${role}-${position}`;
				const employee = getAssignedEmployee(currentSchedule, day, role, position);
				const isSelected = selectedForSwap === cellId;
				const isSwappable =
					selectedForSwap &&
					selectedForSwap !== cellId &&
					getAssignedEmployee(currentSchedule, ...selectedForSwap.split('-'));

				return (
					<DroppableCell
						key={cellId}
						id={cellId}
						employee={employee}
						employees={employees || []}
						onRemove={() => handleRemoveEmployee(currentSchedule, day, role, position)}
						addEmployee={addEmployee}
						allCells={allCells}
						onSwap={handleSwap}
						isSelected={isSelected}
						isSwappable={isSwappable}
						highlightedDay={highlightedDay === day}
						selectedEmployee={selectedEmployee}
						onCellClick={() => handleCellClick(day, role, position, employee)}
					/>
				);
			},
			[
				currentSchedule,
				getAssignedEmployee,
				handleRemoveEmployee,
				addEmployee,
				allCells,
				handleSwap,
				employees,
				selectedForSwap,
				highlightedDay,
				selectedEmployee,
				handleCellClick,
			]
		);

		const renderMokedLayout = () => (
			<TableBody>
				{SHIFTS.flatMap((shift) => {
					let shiftPositions = 0;
					if (shift === 'morning') shiftPositions = 3;
					else if (shift === 'noon') shiftPositions = 1;
					else if (shift === 'evening') shiftPositions = 3;

					return Array.from({length: shiftPositions}, (_, index) => {
						const position = index + 1;
						return (
							<TableRow
								key={`${shift}-${position}`}
								className='transition-colors'>
								<TableCell
									className={`text-center font-medium text-sm transition-all
                                ${
									position === 1
										? 'bg-[#BE202E]/10 text-[#BE202E] font-bold drop-shadow-sm'
										: 'border-t-0 bg-gray-100/50'
								}`}>
									{position === 1 ? <div className='py-1'>{SHIFT_NAMES[shift]}</div> : ''}
								</TableCell>
								{DAYS.map((day) => (
									<TableCell
										key={`${day}-${shift}-${position}`}
										className={`p-0 w-[80px] border ${isToday(day) ? 'bg-blue-50/40' : ''} ${
											highlightedDay === day ? 'bg-yellow-50' : ''
										} 
										${position === 1 ? '' : ''} transition-colors`}
										onMouseEnter={() => setHighlightedDay(day)}
										onMouseLeave={() => setHighlightedDay(null)}>
										{renderCell(day, shift, position)}
									</TableCell>
								))}
							</TableRow>
						);
					});
				})}
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
								className='h-10 transition-colors hover:bg-gray-50/30'>
								<TableCell
									className={`text-center font-medium border-l border text-sm transition-all
                      ${
							position === 1
								? 'bg-[#BE202E]/10 text-[#BE202E] font-bold border-t-2 border-t-[#BE202E]'
								: 'border-t-0 bg-gray-100/50'
						}`}>
									{position === 1 ? <div className='py-1 font-bold'>{config.name}</div> : ''}
								</TableCell>
								{DAYS.map((day) => (
									<TableCell
										key={`${day}-${role}-${position}`}
										className={`border p-0 transition-colors ${
											isToday(day) ? 'bg-blue-50/40' : ''
										} ${highlightedDay === day ? 'bg-yellow-50' : ''} 
										${position === 1 ? '' : 'border-t-0'}`}
										onMouseEnter={() => setHighlightedDay(day)}
										onMouseLeave={() => setHighlightedDay(null)}>
										{renderCell(day, role, position)}
									</TableCell>
								))}
							</TableRow>
						);
					})
				)}
			</TableBody>
		);

		// Handle WhatsApp sharing
		const handleShareToWhatsApp = async () => {
			try {
				if (!currentSchedule) {
					toast.error('אין נתונים לשיתוף');
					return;
				}

				setIsSharing(true);
				toast.loading('מכין תמונה לשיתוף...');

				// Create a completely new element for sharing
				// This avoids any inherited styles that might contain problematic color formats
				const container = document.createElement('div');
				container.style.position = 'absolute';
				container.style.left = '-9999px';
				container.style.top = '-9999px';
				container.style.width = '2000px';
				container.style.background = '#ffffff';
				container.style.padding = '20px';
				container.style.fontFamily = 'Arial, sans-serif';
				container.style.direction = 'rtl';
				container.style.border = '2px solid #cccccc';
				container.style.borderRadius = '8px';

				// Add title
				const title = document.createElement('h1');
				title.textContent = `סידור עבודה שבועי - ${type}`;
				title.style.textAlign = 'center';
				title.style.fontSize = '32px'; // LARGER title font
				title.style.fontWeight = 'bold';
				title.style.padding = '15px';
				title.style.margin = '0 0 25px 0';
				title.style.backgroundColor = '#BE202E'; // Keep the original red
				title.style.color = '#ffffff';
				title.style.borderRadius = '4px';
				title.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
				container.appendChild(title);

				// Create table
				const table = document.createElement('table');
				table.style.width = '100%';
				table.style.borderCollapse = 'collapse';
				table.style.border = '2px solid #dddddd';
				table.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';

				// Get the week dates
				const weekDates = getWeekDates();

				// Create header row
				const thead = document.createElement('thead');
				const headerRow = document.createElement('tr');

				// First cell - shifts column
				const shiftHeader = document.createElement('th');
				shiftHeader.textContent = 'משמרת';
				shiftHeader.style.padding = '15px'; // More padding
				shiftHeader.style.backgroundColor = '#f0f0f0'; // Light gray for header
				shiftHeader.style.color = '#333333'; // Dark text
				shiftHeader.style.border = '1px solid #dddddd';
				shiftHeader.style.fontWeight = 'bold';
				shiftHeader.style.fontSize = '20px'; // LARGER header font
				shiftHeader.style.width = '80px'; // Control width of first column
				shiftHeader.style.maxWidth = '80px'; // Enforce maximum width
				headerRow.appendChild(shiftHeader);

				// Day headers
				weekDates.forEach(({name, date}) => {
					const dayHeader = document.createElement('th');

					const dayName = document.createElement('div');
					dayName.textContent = name;
					dayName.style.fontSize = '24px'; // LARGER day names font
					dayName.style.fontWeight = 'bold';

					const dayDate = document.createElement('div');
					dayDate.textContent = date;
					dayDate.style.fontSize = '18px'; // LARGER date font
					dayDate.style.color = 'rgba(0,0,0,0.7)';
					dayDate.style.marginTop = '5px';

					dayHeader.appendChild(dayName);
					dayHeader.appendChild(dayDate);

					dayHeader.style.padding = '15px'; // More padding
					dayHeader.style.border = '1px solid #dddddd';
					dayHeader.style.textAlign = 'center';
					dayHeader.style.width = '100px'; // Fixed width for day columns

					// Highlight today
					if (isToday(name)) {
						dayHeader.style.backgroundColor = '#fff0f0'; // Lighter, more refined red
						dayHeader.style.color = '#BE202E'; // Original red color for text
						dayHeader.style.borderTop = '3px solid #BE202E';
					} else {
						dayHeader.style.backgroundColor = '#f0f0f0'; // Light gray for header
						dayHeader.style.color = '#333333'; // Dark text
					}

					headerRow.appendChild(dayHeader);
				});

				thead.appendChild(headerRow);
				table.appendChild(thead);

				// Create table body
				const tbody = document.createElement('tbody');

				// Define a more refined color palette for employee backgrounds
				const colorPalette = [
					'#4285f4', // Google blue
					'#34a853', // Google green
					'#fbbc05', // Google yellow
					'#ea4335', // Google red
					'#5f6368', // Google grey
					'#4fc3f7', // Light blue
					'#9575cd', // Purple
					'#f06292', // Pink
					'#4db6ac', // Teal
					'#ff7043', // Deep orange
				];

				// Helper to get a vibrant color for employees
				const getVibrantColor = (originalColor, index) => {
					// If the original color is a simple hex and not too light, use it
					if (
						originalColor &&
						!originalColor.includes('oklch') &&
						!originalColor.includes('oklab') &&
						!originalColor.includes('var(') &&
						!originalColor.includes('hsl')
					) {
						return originalColor;
					}

					// Otherwise use from our vibrant palette
					return colorPalette[index % colorPalette.length];
				};

				// Create rows based on type (מוקד or branch)
				if (type === 'מוקד') {
					// Moked layout
					SHIFTS.forEach((shift) => {
						let positions = 0;
						if (shift === 'morning') positions = 3;
						else if (shift === 'noon') positions = 1;
						else if (shift === 'evening') positions = 3;

						for (let position = 1; position <= positions; position++) {
							const row = document.createElement('tr');

							// Shift cell
							const shiftCell = document.createElement('td');
							if (position === 1) {
								// Only show shift name on first position
								shiftCell.textContent = SHIFT_NAMES[shift];
								shiftCell.style.fontWeight = 'bold';
								shiftCell.style.backgroundColor = '#fff0f0'; // Light refined red background
								shiftCell.style.color = '#BE202E'; // Original red color for text
								shiftCell.style.fontSize = '18px'; // LARGER shift font
							} else {
								shiftCell.style.backgroundColor = '#f9f9f9'; // Very light gray
							}
							shiftCell.style.padding = '5px 8px'; // Less padding
							shiftCell.style.border = '1px solid #dddddd';
							shiftCell.style.textAlign = 'center';
							shiftCell.style.width = '80px'; // Fixed narrow width
							shiftCell.style.maxWidth = '80px'; // Enforce maximum width
							row.appendChild(shiftCell);

							// Day cells
							DAYS.forEach((day) => {
								const cell = document.createElement('td');
								cell.style.padding = '10px';
								cell.style.border = '1px solid #dddddd';
								cell.style.textAlign = 'center';
								cell.style.height = '75px'; // TALLER cells to fit larger text
								cell.style.width = '120px'; // WIDER cells to fit larger text
								cell.style.backgroundColor = '#ffffff'; // White background

								// Highlight today's column
								if (isToday(day)) {
									cell.style.backgroundColor = '#fafafa'; // Very light gray for today
								}

								// Add employee if exists
								const employee = getAssignedEmployee(currentSchedule, day, shift, position);
								if (employee) {
									// Make the cell more vibrant and text larger
									const employeeIndex = employees.findIndex((e) => e.id === employee.id);
									const vibrantColor = getVibrantColor(employee.color, employeeIndex);

									// Create a styled container for employee name
									const nameSpan = document.createElement('div');
									nameSpan.textContent = employee.name;
									nameSpan.style.fontSize = '32px'; // MUCH LARGER employee name font
									nameSpan.style.fontWeight = 'bold';
									nameSpan.style.padding = '8px';
									nameSpan.style.color = '#ffffff';
									nameSpan.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)'; // Subtle text shadow
									nameSpan.style.width = '100%';
									nameSpan.style.height = '100%';
									nameSpan.style.display = 'flex';
									nameSpan.style.justifyContent = 'center';
									nameSpan.style.alignItems = 'center';

									cell.style.backgroundColor = vibrantColor;
									cell.style.boxShadow = 'inset 0 0 0 2px rgba(255,255,255,0.3)'; // Subtle inner highlight
									cell.appendChild(nameSpan);
								}

								row.appendChild(cell);
							});

							tbody.appendChild(row);
						}
					});
				} else {
					// Branch layout
					Object.entries(BRANCH_ROLES).forEach(([role, config]) => {
						for (let position = 1; position <= config.positions; position++) {
							const row = document.createElement('tr');

							// Role cell
							const roleCell = document.createElement('td');
							if (position === 1) {
								// Only show role name on first position
								roleCell.textContent = config.name;
								roleCell.style.fontWeight = 'bold';
								roleCell.style.backgroundColor = '#fff0f0'; // Light refined red background
								roleCell.style.color = '#BE202E'; // Original red color for text
								roleCell.style.fontSize = '18px'; // LARGER role font
							} else {
								roleCell.style.backgroundColor = '#f9f9f9'; // Very light gray
							}
							roleCell.style.padding = '5px 8px'; // Less padding
							roleCell.style.border = '1px solid #dddddd';
							roleCell.style.textAlign = 'center';
							roleCell.style.width = '80px'; // Fixed narrow width
							roleCell.style.maxWidth = '80px'; // Enforce maximum width
							row.appendChild(roleCell);

							// Day cells
							DAYS.forEach((day) => {
								const cell = document.createElement('td');
								cell.style.padding = '10px';
								cell.style.border = '1px solid #dddddd';
								cell.style.textAlign = 'center';
								cell.style.height = '75px'; // TALLER cells to fit larger text
								cell.style.width = '120px'; // WIDER cells to fit larger text
								cell.style.backgroundColor = '#ffffff'; // White background

								// Highlight today's column
								if (isToday(day)) {
									cell.style.backgroundColor = '#fafafa'; // Very light gray for today
								}

								// Add employee if exists
								const employee = getAssignedEmployee(currentSchedule, day, role, position);
								if (employee) {
									// Make the cell more vibrant and text larger
									const employeeIndex = employees.findIndex((e) => e.id === employee.id);
									const vibrantColor = getVibrantColor(employee.color, employeeIndex);

									// Create a styled container for employee name
									const nameSpan = document.createElement('div');
									nameSpan.textContent = employee.name;
									nameSpan.style.fontSize = '32px'; // MUCH LARGER employee name font
									nameSpan.style.fontWeight = 'bold';
									nameSpan.style.padding = '8px';
									nameSpan.style.color = '#ffffff';
									nameSpan.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)'; // Subtle text shadow
									nameSpan.style.width = '100%';
									nameSpan.style.height = '100%';
									nameSpan.style.display = 'flex';
									nameSpan.style.justifyContent = 'center';
									nameSpan.style.alignItems = 'center';

									cell.style.backgroundColor = vibrantColor;
									cell.style.boxShadow = 'inset 0 0 0 2px rgba(255,255,255,0.3)'; // Subtle inner highlight
									cell.appendChild(nameSpan);
								}

								row.appendChild(cell);
							});

							tbody.appendChild(row);
						}
					});
				}

				table.appendChild(tbody);
				container.appendChild(table);

				// Add to document body temporarily
				document.body.appendChild(container);

				// Capture with html2canvas
				const html2canvasModule = await import('html2canvas');
				const html2canvas = html2canvasModule.default;

				const canvas = await html2canvas(container, {
					backgroundColor: '#ffffff',
					scale: 2,
					useCORS: true,
					logging: false,
					width: container.scrollWidth,
					height: container.scrollHeight,
				});

				// Remove the temporary container
				document.body.removeChild(container);

				// Convert to image
				const dataUrl = canvas.toDataURL('image/png', 1.0);

				// Create sharing data
				const message = `סידור עבודה שבועי - ${type}`;
				const blob = await (await fetch(dataUrl)).blob();
				const file = new File([blob], `schedule-${type}.png`, {type: 'image/png'});

				// Share or download
				if (navigator.share) {
					await navigator.share({
						files: [file],
						title: message,
						text: message,
					});
				} else {
					const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

					if (isMobile) {
						// Create a temporary download link
						const link = document.createElement('a');
						link.href = dataUrl;
						link.download = `schedule-${type}.png`;
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);

						// Open WhatsApp with text prompt
						setTimeout(() => {
							window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
						}, 500);
					} else {
						// Desktop fallback - just download the image
						const link = document.createElement('a');
						link.href = dataUrl;
						link.download = `schedule-${type}.png`;
						link.click();
					}
				}

				toast.dismiss();
				toast.success('התמונה נוצרה בהצלחה');
			} catch (error) {
				console.error('Share error:', error);
				toast.error('שגיאה בשיתוף');
			} finally {
				setIsSharing(false);
			}
		};

		return (
			<div className='-mx-4 px-4 pb-4'>
				{/* Compact employee selection row */}
				<div className='flex flex-col md:flex-row items-start md:items-center gap-3 mb-4 overflow-x-auto py-3 bg-gray-50 rounded-lg px-4 border border-gray-200'>
					<div className='flex items-center gap-2'>
						<Users className='h-4 w-4 text-gray-500' />
						<div className='text-sm font-medium text-gray-700'>עובדים:</div>
					</div>

					<div className='flex gap-1.5 overflow-x-auto py-1 flex-1 flex-wrap'>
						{employees?.map((emp) => (
							<button
								key={emp.id}
								className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1 whitespace-nowrap
									${
										selectedEmployee?.id === emp.id
											? 'ring-2 ring-blue-500 bg-white shadow-sm'
											: 'hover:bg-white hover:shadow-sm bg-gray-100'
									}`}
								style={{color: emp.color}}
								onClick={() => {
									if (selectedEmployee?.id === emp.id) {
										setSelectedEmployee(null);
									} else {
										setSelectedEmployee(emp);
									}
								}}>
								{selectedEmployee?.id === emp.id && <Check className='h-3 w-3 text-blue-500' />}
								{emp.name}
							</button>
						))}
					</div>

					{selectedForSwap && (
						<div className='ml-auto bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-2 border border-green-200'>
							<span className='text-green-800 text-sm whitespace-nowrap'>בחר תא שני להחלפה</span>
							<button
								className='h-5 w-5 rounded-full bg-white/80 flex items-center justify-center hover:bg-white'
								onClick={() => setSelectedForSwap(null)}>
								<X className='h-3 w-3' />
							</button>
						</div>
					)}
				</div>

				<div
					className='w-full overflow-auto touch-pan-x'
					style={{
						WebkitOverflowScrolling: 'touch',
						scrollSnapType: 'x mandatory',
						scrollPadding: '0 12px',
						msOverflowStyle: 'none',
						scrollbarWidth: 'none',
					}}>
					<div
						id='schedule-table-for-share'
						className='bg-white rounded-lg shadow-md border border-gray-200 min-w-[640px]'>
						<div className='bg-white py-3 px-4 border-b border-gray-200 flex flex-wrap md:flex-nowrap justify-between items-center gap-3'>
							<div className='flex items-center'>
								<div className='h-8 w-8 rounded-md bg-[#BE202E]/10 flex items-center justify-center mr-3'>
									<LayoutGrid className='h-4 w-4 text-[#BE202E]' />
								</div>
								<h3 className='text-base font-semibold text-gray-800'>לוח {type}</h3>
							</div>

							<div className='flex items-center gap-3 flex-wrap md:flex-nowrap'>
								{selectedEmployee && (
									<div className='flex items-center bg-blue-50 px-2 py-1 rounded-full border border-blue-100'>
										<span className='text-xs text-gray-600 ml-1'>בחירת תא עבור</span>
										<span
											className='text-xs font-medium mx-1'
											style={{color: selectedEmployee.color}}>
											{selectedEmployee.name}
										</span>
										<button
											className='h-5 w-5 rounded-full bg-white flex items-center justify-center hover:bg-gray-100'
											onClick={() => setSelectedEmployee(null)}>
											<X className='h-3 w-3' />
										</button>
									</div>
								)}

								<div className='flex gap-2 ml-auto'>
									<Button
										onClick={handleShareToWhatsApp}
										disabled={isSharing}
										className='bg-green-600 hover:bg-green-700 h-8 px-3 rounded-md'
										size='sm'>
										{isSharing ? (
											<span className='animate-spin text-white'>⏳</span>
										) : (
											<>
												<Share2 className='w-3.5 h-3.5 text-white' />
												<span className='whitespace-nowrap text-white text-xs mr-1.5'>שתף</span>
											</>
										)}
									</Button>
									<Button
										onClick={() => onClearSchedule && onClearSchedule(currentSchedule)}
										className='bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 h-8 px-3 rounded-md'
										variant='outline'
										size='sm'>
										<Trash2 className='w-3.5 h-3.5 text-red-500' />
										<span className='whitespace-nowrap text-red-600 text-xs mr-1.5'>נקה</span>
									</Button>
								</div>
							</div>
						</div>

						<Table className='w-full table-fixed'>
							<TableHeader>
								<TableRow>
									<TableHead className='text-center font-medium bg-gray-100 text-zinc-900 border-b-2 border-b-gray-200 py-3'>
										משמרת
									</TableHead>
									{getWeekDates().map(({name, date}) => (
										<TableHead
											key={name}
											className={`text-center font-medium text-sm whitespace-nowrap p-2 border-x transition-colors
											${highlightedDay === name ? 'bg-yellow-50' : ''}
											${
												isToday(name)
													? 'bg-[#BE202E]/5 text-[#BE202E] font-bold border-t-2 border-t-[#BE202E] border-b-0'
													: 'font-medium bg-gray-50 border-b-2 border-b-gray-200'
											}`}
											onMouseEnter={() => setHighlightedDay(name)}
											onMouseLeave={() => setHighlightedDay(null)}>
											<div className='text-center font-bold text-base mb-1'>{name}</div>
											<div
												className={`text-sm ${
													isToday(name) ? 'text-[#BE202E]/80 font-medium' : 'text-gray-500'
												}`}>
												{date}
											</div>
										</TableHead>
									))}
								</TableRow>
							</TableHeader>

							{isMoked ? renderMokedLayout() : renderBranchLayout()}
						</Table>
					</div>
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => {
		const shouldUpdate =
			prevProps.type !== nextProps.type ||
			prevProps.currentSchedule !== nextProps.currentSchedule ||
			JSON.stringify(prevProps.currentSchedule?.days) !== JSON.stringify(nextProps.currentSchedule?.days) ||
			prevProps.employees !== nextProps.employees;

		return !shouldUpdate;
	}
);

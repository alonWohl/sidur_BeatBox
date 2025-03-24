import React, {useState, useCallback} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {EmployesList} from './EmployesList';
import {Button} from './ui/button';
import {useSelector} from 'react-redux';
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';
import {toast} from 'react-hot-toast';
import {Trash2, Share2} from 'lucide-react';
import {worker} from 'globals';
import domtoimage from 'dom-to-image-more';
export function MokedSchedule({schedule, handleClearBoard, getAssignedWorker, onUpdateSchedule}) {
	const {workers} = useSelector((storeState) => storeState.workerModule);
	const [isDragging, setIsDragging] = useState(false);
	const [isSharing, setIsSharing] = useState(false);

	const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
	const timeSlots = [
		{name: 'בוקר', role: 'morning', rows: 3},
		{name: 'אמצע', role: 'noon', rows: 3},
		{name: 'ערב', role: 'evening', rows: 3},
	];

	const handleDragStart = useCallback(() => {
		setIsDragging(true);
	}, []);

	const handleDragEnd = useCallback(
		async (result) => {
			setIsDragging(false);
			if (!result.destination) return;

			const {source, destination, draggableId} = result;

			// If dropping to trash
			if (destination.droppableId === 'trash') {
				if (draggableId.startsWith('inside_table_')) {
					const [sourceDay, sourceRole, sourcePosition] = source.droppableId.split('-');
					await onUpdateSchedule(null, sourceDay, sourceRole, parseInt(sourcePosition));
				}
				return;
			}

			const [destDay, destRole, destPosition] = destination.droppableId.split('-');

			try {
				if (draggableId.startsWith('inside_table_')) {
					// Moving from within the table
					const [sourceDay, sourceRole, sourcePosition] = source.droppableId.split('-');
					const workerId = draggableId.split('_').pop(); // Get the last part which is the workerId

					console.log('Moving worker:', {
						workerId,
						sourceDay,
						sourceRole,
						sourcePosition,
						destDay,
						destRole,
						destPosition,
					});

					// First remove from original position
					await onUpdateSchedule(null, sourceDay, sourceRole, parseInt(sourcePosition));

					// Then add to new position
					await onUpdateSchedule(workerId, destDay, destRole, parseInt(destPosition));
				} else {
					// Moving from workers list - just add to new position
					await onUpdateSchedule(draggableId, destDay, destRole, parseInt(destPosition));
				}
			} catch (error) {
				console.error('Error in drag end:', error);
				toast.error('שגיאה בעדכון המשמרת');
			}
		},
		[onUpdateSchedule]
	);

	const handleShare = async () => {
		setIsSharing(true);
		try {
			const node = document.getElementById('schedule-table-for-share');
			const dataUrl = await domtoimage.toPng(node);
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = 'schedule.png';
			link.click();
			window.open('https://web.whatsapp.com', '_blank');
		} catch (error) {
			console.error('Share error:', error);
			alert('שגיאה בשיתוף: ' + error.message);
		} finally {
			setIsSharing(false);
		}
	};

	if (!schedule) return <div>Loading...</div>;

	return (
		<DragDropContext
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}>
			<div className='flex flex-col items-center gap-4 p-4 min-h-screen relative'>
				{/* Workers List with Droppable */}
				<Droppable
					droppableId='workers-list'
					direction='horizontal'>
					{(provided) => (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
							className='flex flex-wrap gap-2 w-full mb-4'>
							{workers.map((worker, index) => (
								<Draggable
									key={worker._id}
									draggableId={worker._id.toString()}
									index={index}>
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
											className={`p-2 rounded w-20 text-center ${
												snapshot.isDragging ? 'shadow-xl' : ''
											}`}
											style={{
												backgroundColor: worker.color,
												color: 'white',
												...provided.draggableProps.style,
											}}>
											{worker.name}
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>

				<div className='w-full overflow-x-auto mt-4'>
					<div className='flex cursor-pointer items-center justify-between mb-4'>
						<Button onClick={handleClearBoard}>נקה משמרת</Button>
						<Button
							onClick={handleShare}
							className='flex items-center gap-2 bg-green-500 hover:bg-green-600'
							disabled={isSharing}>
							{isSharing ? <span className='animate-spin'>⏳</span> : <Share2 className='w-4 h-4' />}
							{isSharing ? 'מכין לשיתוף...' : 'שתף בווצאפ'}
						</Button>
					</div>

					<div
						id='schedule-table-for-share'
						className='w-full bg-white p-4 rounded-lg shadow'
						style={{backgroundColor: '#ffffff'}}>
						<Table dir='rtl'>
							<TableHeader>
								<TableRow>
									<TableHead className='text-right bg-gray-50 font-bold'>משמרת</TableHead>
									{days.map((day) => (
										<TableHead
											key={day}
											className='text-center bg-gray-50 font-bold'>
											{day}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{timeSlots.flatMap((slot) =>
									Array.from({length: slot.rows}).map((_, position) => (
										<TableRow key={`${slot.name}-${position}`}>
											{/* Time period label - only show in first row of period */}
											{position === 0 && (
												<TableCell
													className='text-center font-medium bg-gray-50 border border-gray-200'
													style={{verticalAlign: 'middle'}}
													rowSpan={slot.rows}>
													{slot.name}
												</TableCell>
											)}

											{/* Day cells */}
											{days.map((day) => {
												const assignedWorker = getAssignedWorker(day, slot.role, position + 1);
												const cellId = `${day}-${slot.role}-${position + 1}`;

												return (
													<Droppable
														key={cellId}
														droppableId={cellId}>
														{(provided, snapshot) => (
															<td
																ref={provided.innerRef}
																{...provided.droppableProps}
																className={`text-center border border-gray-200 p-0 transition-colors duration-200 ${
																	snapshot.isDraggingOver
																		? 'bg-blue-100 border-blue-400 py-10'
																		: ''
																}`}
																style={{
																	backgroundColor: snapshot.isDraggingOver
																		? '#EFF6FF'
																		: assignedWorker
																		? assignedWorker.color
																		: '',
																	height: '40px',
																	minWidth: '80px',
																	maxWidth: '120px',
																	padding: snapshot.isDraggingOver ? '2px' : '4px',
																	boxShadow: snapshot.isDraggingOver
																		? 'inset 0 0 0 2px #60A5FA'
																		: 'none',
																}}>
																{assignedWorker && (
																	<Draggable
																		key={`${day}-${slot.role}-${position}-${assignedWorker._id}`}
																		draggableId={`inside_table_${day}_${slot.role}_${position}_${assignedWorker._id}`}
																		index={0}>
																		{(dragProvided, dragSnapshot) => (
																			<div
																				ref={dragProvided.innerRef}
																				{...dragProvided.draggableProps}
																				{...dragProvided.dragHandleProps}
																				className={`text-white text-sm font-medium rounded h-full flex items-center justify-center ${
																					dragSnapshot.isDragging
																						? 'opacity-75 bg-blue-500'
																						: ''
																				}`}
																				style={{
																					...dragProvided.draggableProps
																						.style,
																					backgroundColor: worker.color,
																				}}>
																				{assignedWorker.name}
																			</div>
																		)}
																	</Draggable>
																)}
																{provided.placeholder}
															</td>
														)}
													</Droppable>
												);
											})}
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>

				{/* Trash Zone - always visible */}
				<Droppable droppableId='trash'>
					{(provided, snapshot) => (
						<div
							ref={provided.innerRef}
							{...provided.droppableProps}
							className={`fixed bottom-8 right-8 p-6 rounded-lg border-2 border-dashed transition-all flex items-center gap-3 ${
								snapshot.isDraggingOver
									? 'bg-red-50 border-red-500 scale-110'
									: 'bg-white border-gray-300 hover:border-gray-400'
							}`}
							style={{
								minWidth: '200px',
								zIndex: 50,
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
								transition: 'all 0.2s ease',
							}}>
							<div className='flex items-center gap-3 justify-center'>
								<Trash2
									className={`w-6 h-6 ${snapshot.isDraggingOver ? 'text-red-500' : 'text-gray-400'}`}
								/>
								<span
									className={`${
										snapshot.isDraggingOver ? 'text-red-500' : 'text-gray-400'
									} font-medium`}>
									גרור לכאן למחיקה
								</span>
							</div>
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</div>
		</DragDropContext>
	);
}

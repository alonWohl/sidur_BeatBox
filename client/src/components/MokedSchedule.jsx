import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {EmployesList} from './EmployesList';
import {Button} from './ui/button';
import {useSelector} from 'react-redux';
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';

export function MokedSchedule({schedule, handleClearBoard, getAssignedWorker, onUpdateSchedule}) {
	const {workers} = useSelector((storeState) => storeState.workerModule);

	const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
	const timeSlots = [
		{name: 'בוקר', role: 'morning', rows: 3},
		{name: 'אמצע', role: 'noon', rows: 3},
		{name: 'ערב', role: 'evening', rows: 3},
	];

	const handleDragEnd = async (result) => {
		if (!result.destination) return;

		const {source, destination, draggableId} = result;

		// If dropping to trash

		// If dropping from workers list
		if (source.droppableId === 'workers-list') {
			const [destDay, destRole, destPosition] = destination.droppableId.split('-');
			await onUpdateSchedule(draggableId, destDay, destRole, parseInt(destPosition));
		}
	};

	if (!schedule) return <div>Loading...</div>;

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<div className='flex flex-col items-center justify-center gap-4 p-4 container mx-auto'>
				{/* Workers List with Droppable */}
				<Droppable
					droppableId='workers-list'
					direction='horizontal'>
					{(provided) => (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
							className='grid grid-cols-4 gap-2 w-full max-w-2xl mb-4'>
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
											className={`p-2 rounded text-center ${
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
					<div className='flex items-center justify-between mb-4'>
						<Button onClick={handleClearBoard}>נקה משמרת</Button>
					</div>

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
																	? '#EFF6FF' // Light blue when dragging over
																	: assignedWorker
																	? assignedWorker.color
																	: '',
																height: '40px',
																minWidth: '80px',
																maxWidth: '120px',
																padding: snapshot.isDraggingOver ? '2px' : '4px',
																// Add a subtle transition shadow when dragging over
																boxShadow: snapshot.isDraggingOver
																	? 'inset 0 0 0 2px #60A5FA'
																	: 'none',
															}}>
															{assignedWorker && !snapshot.isDraggingOver && (
																<div className='text-white text-sm font-medium rounded h-full flex items-center justify-center'>
																	{assignedWorker.name}
																</div>
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
		</DragDropContext>
	);
}

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';
import {EmployesList} from './EmployesList';

export function BranchSchedule({workers, getAssignedWorker, handleClearBoard, onUpdateSchedule}) {
	const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

	const handleDragEnd = async (result) => {
		if (!result.destination) return;
		console.log('result', result);

		const {source, destination, draggableId} = result;

		// If dropping from workers list
		if (source.droppableId === 'workers-list') {
			const [destDay, destRole, destPosition] = destination.droppableId.split('-');
			await onUpdateSchedule(
				draggableId, // This is the worker._id
				destDay,
				destRole,
				parseInt(destPosition)
			);
		}
	};

	const renderCell = (day, role, position) => {
		const worker = getAssignedWorker(day, role, position);
		const cellId = `${day}-${role}-${position}`;

		return (
			<Droppable
				key={cellId}
				droppableId={cellId}>
				{(provided, snapshot) => (
					<TableCell
						ref={provided.innerRef}
						{...provided.droppableProps}
						className={`text-center h-12 border border-gray-200 p-0 ${
							snapshot.isDraggingOver ? 'bg-blue-100' : 'hover:bg-gray-100'
						}`}
						style={{
							backgroundColor: snapshot.isDraggingOver ? '#EFF6FF' : worker ? worker.color : '',
							minWidth: '80px',
							maxWidth: '120px',
							padding: snapshot.isDraggingOver ? '2px' : '4px',
							boxShadow: snapshot.isDraggingOver ? 'inset 0 0 0 2px #60A5FA' : 'none',
						}}>
						{worker && !snapshot.isDraggingOver && (
							<span className='text-white text-sm'>{worker.name}</span>
						)}
						{provided.placeholder}
					</TableCell>
				)}
			</Droppable>
		);
	};

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<div className='flex flex-col items-center justify-center gap-4 p-4 container mx-auto'>
				<div className='flex justify-between items-center w-full mb-4'>
					<h2 className='text-xl font-bold'>סידור עבודה</h2>
					<Button
						onClick={handleClearBoard}
						variant='outline'>
						נקה סידור
					</Button>
				</div>

				{/* Workers List */}
				<Droppable
					droppableId='workers-list'
					direction='horizontal'>
					{(provided) => (
						<div
							ref={provided.innerRef}
							{...provided.droppableProps}
							className='flex flex-wrap gap-2 justify-center w-full'>
							{workers.map((worker, index) => (
								<Draggable
									key={worker._id}
									draggableId={worker._id}
									index={index}>
									{(provided, snapshot) => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
											className={`p-2 rounded cursor-pointer ${
												snapshot.isDragging ? 'shadow-xl' : ''
											}`}
											style={{
												backgroundColor: worker.color,
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

				<div className='w-full overflow-x-auto'>
					<Table dir='rtl'>
						<TableHeader>
							<TableRow>
								<TableHead className='w-24 text-center font-medium'>תפקיד</TableHead>
								{days.map((day) => (
									<TableHead
										key={day}
										className='text-center font-medium'>
										{day}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>

						<TableBody>
							{/* Shift Manager section */}
							<TableRow>
								<TableCell className='text-center font-medium bg-gray-50 border-l'>אחמ"ש</TableCell>
								{days.map((day) => renderCell(day, 'אחמש', 1))}
							</TableRow>

							{/* Waiters section */}
							<TableRow>
								<TableCell
									rowSpan={5}
									className='text-center font-medium bg-gray-50 border-l'>
									מלצרים
								</TableCell>
								{days.map((day) => renderCell(day, 'מלצרים', 1))}
							</TableRow>

							{[2, 3, 4, 5].map((position) => (
								<TableRow key={`waiter-row-${position}`}>
									{days.map((day) => renderCell(day, 'מלצרים', position))}
								</TableRow>
							))}

							{/* Separator row */}
							<TableRow>
								<TableCell
									colSpan={days.length + 1}
									className='h-1 p-0 bg-gray-300'></TableCell>
							</TableRow>

							{/* Cooks section */}
							<TableRow>
								<TableCell
									rowSpan={3}
									className='text-center font-medium bg-gray-50 border-l'>
									טבחים
								</TableCell>
								{days.map((day) => renderCell(day, 'טבחים', 1))}
							</TableRow>

							{[2, 3].map((position) => (
								<TableRow key={`cook-row-${position}`}>
									{days.map((day) => renderCell(day, 'טבחים', position))}
								</TableRow>
							))}
						</TableBody>
					</Table>

					<div className='mt-4 text-right text-sm text-gray-500'>
						<p>גרור עובד לתא הרצוי</p>
					</div>
				</div>
			</div>
		</DragDropContext>
	);
}

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';
import {EmployesList} from './EmployesList';
import {Trash2} from 'lucide-react';
import {toast} from 'react-hot-toast';

export function BranchSchedule({workers, getAssignedWorker, handleClearBoard, onUpdateSchedule}) {
	const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

	const handleDragEnd = async (result) => {
		if (!result.destination) return;
		console.log('result', result);

		const {source, destination, draggableId} = result;

		// If dropping to trash
		if (destination.droppableId === 'trash') {
			if (source.droppableId !== 'workers-list') {
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

				// First remove from original position
				await onUpdateSchedule(null, sourceDay, sourceRole, parseInt(sourcePosition));

				// Then add to new position
				await onUpdateSchedule(workerId, destDay, destRole, parseInt(destPosition));
			} else {
				// Moving from workers list
				await onUpdateSchedule(draggableId, destDay, destRole, parseInt(destPosition));
			}
		} catch (error) {
			console.error('Error in drag end:', error);
			toast.error('שגיאה בעדכון המשמרת');
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
						{worker && (
							<Draggable
								key={`${day}-${role}-${position}-${worker._id}`}
								draggableId={`inside_table_${day}_${role}_${position}_${worker._id}`}
								index={0}>
								{(dragProvided, dragSnapshot) => (
									<div
										ref={dragProvided.innerRef}
										{...dragProvided.draggableProps}
										{...dragProvided.dragHandleProps}
										className={`text-white text-sm font-medium rounded h-full flex items-center justify-center ${
											dragSnapshot.isDragging ? 'opacity-75 bg-blue-500' : ''
										}`}
										style={{
											...dragProvided.draggableProps.style,
											backgroundColor: worker.color,
										}}>
										{worker.name}
									</div>
								)}
							</Draggable>
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
						className='cursor-pointer hover:bg-[#BE202E] hover:text-white'
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
							className='flex flex-wrap gap-2 text-white w-full'>
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

				{/* Add Trash Zone */}
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

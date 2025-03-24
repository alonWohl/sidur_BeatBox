import {useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
import {loadWorkers, removeWorker, updateWorker, addWorker} from '../store/worker.actions';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select';
import toast from 'react-hot-toast';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import React from 'react';

const colorOptions = [
	'#FF6B6B', // red
	'#4ECDC4', // teal
	'#45B7D1', // blue
	'#96CEB4', // green
	'#FFEEAD', // yellow
	'#D4A5A5', // pink
	'#9B59B6', // purple
	'#3498DB', // bright blue
	'#E67E22', // orange
	'#2ECC71', // emerald
	'#F1C40F', // sun yellow
	'#E74C3C', // crimson
	'#000000', // black
	'#FF0000', // red
	'#00FF00', // green
	'#0000FF', // blue
	'#FFFF00', // yellow
	'#FFA500', // orange
	'#800080', // purple
	'#FFC0CB', // pink
	'#808080', // gray
	'#008000', // green
	'#000080', // blue
	'#800000', // maroon
];

const ColorPickerPopover = ({value, onChange}) => {
	const [open, setOpen] = useState(false);

	return (
		<div className='flex flex-col gap-2'>
			<Popover
				open={open}
				onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type='button'
						className='flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50 w-full'>
						<div
							className='w-6 h-6 rounded-full border'
							style={{backgroundColor: value}}
						/>
					</button>
				</PopoverTrigger>
				<PopoverContent className='w-[232px] p-3'>
					<div className='grid grid-cols-4 gap-2'>
						{colorOptions.map((color) => (
							<button
								key={color}
								onClick={() => {
									onChange({target: {name: 'color', value: color}});
									setOpen(false);
								}}
								className={`w-12 h-12 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
									value === color
								}`}
								style={{backgroundColor: color}}
								type='button'
								aria-label={`Select color ${color}`}
							/>
						))}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export function WorkersPage() {
	const {workers} = useSelector((storeState) => storeState.workerModule);
	const [workerToEdit, setWorkerToEdit] = useState({name: '', color: '#000000', branch: ''});
	const {user} = useSelector((storeState) => storeState.userModule);

	useEffect(() => {
		loadWorkers();
	}, []);

	// if (!workers.length) return <div>Loading...</div>

	const handleAddWorker = async (e) => {
		e.preventDefault();

		console.log('Current workers:', workers); // Debug existing workers
		console.log('New color:', workerToEdit.color); // Debug new color

		const isDuplicate = workers.some((worker) => {
			console.log('Comparing:', worker.color, 'with:', workerToEdit.color); // Debug comparison
			return worker.color.toLowerCase() === workerToEdit.color.toLowerCase();
		});

		if (isDuplicate) {
			toast.error('צבע זה כבר קיים');
			return;
		}

		if (workerToEdit.name.length < 2) {
			toast.error('שם העובד חייב להכיל לפחות 2 תווים');
			return;
		}

		if (workers.some((worker) => worker.name === workerToEdit.name)) {
			toast.error('שם העובד כבר קיים');
			return;
		}
		try {
			await addWorker({
				name: workerToEdit.name,
				color: workerToEdit.color,
				branch: user.branch,
			});
			setWorkerToEdit({name: '', color: '', branch: ''});
			toast.success('עובד נוסף בהצלחה');
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}
	};

	const handleChange = (e) => {
		const {name, value} = e.target;
		setWorkerToEdit({...workerToEdit, [name]: value});
	};

	const handleUpdateWorker = (e, worker) => {
		console.log('Updating worker:', worker);
		console.log('New color:', e.target.value);
		const updatedWorker = {...worker, color: e.target.value};
		updateWorker(updatedWorker);
	};

	const handleRemoveWorker = (workerId) => {
		removeWorker(workerId);
	};

	const handleBranchChange = (value) => {
		setWorkerToEdit({...workerToEdit, branch: value});
	};

	return (
		<div className='flex flex-col h-full items-center '>
			<form
				className='flex flex-col items-center gap-2 mt-16'
				onSubmit={handleAddWorker}>
				<h2>הוסף עובד</h2>
				<div className='flex items-center gap-2 mt-4'>
					<Input
						type='text'
						placeholder='שם'
						name='name'
						value={workerToEdit.name}
						onChange={handleChange}
					/>
					<ColorPickerPopover
						value={workerToEdit.color}
						onChange={handleChange}
					/>
					{user?.isAdmin && (
						<Select
							name='branch'
							value={workerToEdit.branch}
							onValueChange={handleBranchChange}>
							<SelectTrigger>
								<SelectValue placeholder='בחר סניף' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='moked'>מוקד</SelectItem>
								<SelectItem value='tlv'>תל אביב</SelectItem>
								<SelectItem value='pt'>פתח תקווה</SelectItem>
								<SelectItem value='rishon'>רשאון לציון</SelectItem>
								<SelectItem value='rosh'>ראש העין</SelectItem>
							</SelectContent>
						</Select>
					)}
					<Button>הוסף</Button>
				</div>
			</form>

			<ul className='flex items-center container mt-32 flex-wrap gap-2 w-full'>
				{workers.length === 0 && <li className='text-center text-gray-500'>אין עובדים</li>}
				{workers.map((worker) => (
					<li
						key={worker._id}
						className='flex flex-col w-32  gap-4'>
						<h2
							className='text-md font-bold'
							style={{color: worker.color}}>
							{worker.name}
						</h2>
						<p className='text-sm text-gray-500'>סניף: {worker.branch}</p>

						<div className='flex items-center gap-2'>
							<p className='text-sm text-gray-500'>צבע</p>
							<ColorPickerPopover
								value={worker.color}
								onChange={(e) => handleUpdateWorker(e, worker)}
							/>
						</div>

						<Button onClick={() => handleRemoveWorker(worker._id)}>הסר</Button>
					</li>
				))}
			</ul>
		</div>
	);
}

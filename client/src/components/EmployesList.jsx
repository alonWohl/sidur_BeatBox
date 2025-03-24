export function EmployesList({workers, activeWorker, handleWorkerSelect}) {
	console.log('🚀 ~ EmployesList ~ workers:', workers);
	return (
		<div className='w-full'>
			<p className='mb-2 text-right'>בחר עובד להצבה במשמרת:</p>
			<ul className='flex flex-wrap gap-2 mb-6 justify-end'>
				{workers.map((worker) => (
					<li
						key={worker._id}
						style={{
							backgroundColor: worker.color,
							boxShadow: activeWorker?._id === worker._id ? '0 0 0 2px #000' : 'none',
						}}
						className='p-2 rounded-md text-white cursor-pointer transition-all'
						onClick={() => handleWorkerSelect(worker)}>
						{worker.name}
					</li>
				))}
			</ul>
		</div>
	);
}

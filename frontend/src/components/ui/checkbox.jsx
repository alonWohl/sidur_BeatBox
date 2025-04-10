import * as React from 'react';
import {cn} from '@/lib/utils';
import {Check} from 'lucide-react';

const Checkbox = React.forwardRef(({className, checked, onCheckedChange, ...props}, ref) => {
	const [isChecked, setIsChecked] = React.useState(checked || false);

	React.useEffect(() => {
		setIsChecked(checked || false);
	}, [checked]);

	const handleChange = (e) => {
		const newCheckedState = e.target.checked;
		setIsChecked(newCheckedState);
		if (onCheckedChange) {
			onCheckedChange(newCheckedState);
		}
	};

	// Add click handler for the checkbox div
	const handleClick = () => {
		const newCheckedState = !isChecked;
		setIsChecked(newCheckedState);
		if (onCheckedChange) {
			onCheckedChange(newCheckedState);
		}
	};

	return (
		<div className='relative flex items-center'>
			<input
				type='checkbox'
				ref={ref}
				checked={isChecked}
				onChange={handleChange}
				className='peer sr-only'
				{...props}
			/>
			<div
				onClick={handleClick}
				className={cn(
					'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-gray-300 mr-2 ml-0 transition-colors cursor-pointer',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
					'disabled:cursor-not-allowed disabled:opacity-50',
					'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20',
					'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
					'data-[state=checked]:border-primary',
					isChecked ? 'bg-primary border-primary' : 'bg-white',
					className
				)}
				data-state={isChecked ? 'checked' : 'unchecked'}>
				{isChecked && <Check className='h-3 w-3 text-white' />}
			</div>
		</div>
	);
});

Checkbox.displayName = 'Checkbox';

export {Checkbox};

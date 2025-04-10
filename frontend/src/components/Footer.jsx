import {forwardRef} from 'react';
import {Heart, Copyright, ExternalLink} from 'lucide-react';

export const Footer = forwardRef((props, ref) => {
	return (
		<footer
			ref={ref}
			className='bg-gradient-to-r from-white to-gray-50 shadow-md border-t border-gray-100'>
			<div className='px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2'>
				<p className='text-gray-500 text-xs flex items-center gap-1'>
					<Copyright className='h-3 w-3 text-gray-400' />
					<span>2025 כל הזכויות שמורות</span>
					<span className='font-medium ml-1'>ביטבוקס חדרי קריוקי בע״מ</span>
				</p>
				<div className='flex items-center gap-2'>
					<p className='text-gray-500 text-xs flex items-center'>
						נבנה באהבה
						<Heart className='h-3 w-3 text-red-400 mx-1 animate-pulse' />
						על ידי צוות הפיתוח
					</p>
					<a
						href='https://www.beat-box.co.il'
						target='_blank'
						rel='noopener noreferrer'
						className='text-xs text-gray-600 hover:text-[#BE202E] transition-colors flex items-center gap-1'>
						<span>לאתר ביטבוקס</span>
						<ExternalLink className='h-3 w-3' />
					</a>
				</div>
			</div>
		</footer>
	);
});

Footer.displayName = 'Footer';

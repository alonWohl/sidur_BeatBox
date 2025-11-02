import React from 'react'
import { Users, Share2, Trash2 } from 'lucide-react'

export const FloatingActionButton = ({ onSelectEmployee, onShare, onClear, isSharing }) => {
	const [isExpanded, setIsExpanded] = React.useState(false)

	return (
		<div className="fixed bottom-6 left-6 z-30 md:hidden">
			{/* Expanded menu */}
			{isExpanded && (
				<div className="absolute bottom-16 left-0 flex flex-col gap-3 mb-2">
					{/* Share button */}
					<button
						onClick={() => {
							onShare?.()
							setIsExpanded(false)
						}}
						disabled={isSharing}
						className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-lg transition-all"
					>
						<Share2 className="h-5 w-5" />
						<span className="font-medium">שתף</span>
					</button>

					{/* Clear button */}
					<button
						onClick={() => {
							onClear?.()
							setIsExpanded(false)
						}}
						className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-full shadow-lg transition-all"
					>
						<Trash2 className="h-5 w-5" />
						<span className="font-medium">נקה</span>
					</button>

					{/* Select employee button */}
					<button
						onClick={() => {
							onSelectEmployee?.()
							setIsExpanded(false)
						}}
						className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg transition-all"
					>
						<Users className="h-5 w-5" />
						<span className="font-medium">בחר עובד</span>
					</button>
				</div>
			)}

			{/* Main FAB */}
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className={`flex items-center justify-center w-14 h-14 bg-[#BE202E] hover:bg-[#9e1825] text-white rounded-full shadow-lg transition-all ${
					isExpanded ? 'rotate-45' : ''
				}`}
			>
				{isExpanded ? <span className="text-3xl">+</span> : <Users className="h-6 w-6" />}
			</button>
		</div>
	)
}



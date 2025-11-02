import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export const BottomSheet = ({ isOpen, onClose, title, children }) => {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isOpen])

	if (!isOpen) return null

	return (
		<>
			{/* Overlay */}
			<div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />

			{/* Bottom Sheet */}
			<div
				className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${
					isOpen ? 'translate-y-0' : 'translate-y-full'
				}`}
				style={{ maxHeight: '85vh' }}
			>
				{/* Handle bar */}
				<div className="flex justify-center pt-3 pb-2">
					<div className="w-12 h-1 bg-gray-300 rounded-full" />
				</div>

				{/* Header */}
				<div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-800">{title}</h3>
					<button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
						<X className="h-5 w-5 text-gray-600" />
					</button>
				</div>

				{/* Content */}
				<div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 80px)' }}>
					{children}
				</div>
			</div>
		</>
	)
}



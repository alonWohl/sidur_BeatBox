import React, { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export const OfflineIndicator = () => {
	const [isOnline, setIsOnline] = useState(navigator.onLine)
	const [showBanner, setShowBanner] = useState(false)

	useEffect(() => {
		const handleOnline = () => {
			setIsOnline(true)
			setShowBanner(true)
			setTimeout(() => setShowBanner(false), 3000)
		}

		const handleOffline = () => {
			setIsOnline(false)
			setShowBanner(true)
		}

		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)

		return () => {
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
		}
	}, [])

	if (!showBanner) return null

	return (
		<div
			className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center text-white font-medium transition-all duration-300 ${
				isOnline ? 'bg-green-600' : 'bg-orange-600'
			}`}
		>
			<div className="flex items-center justify-center gap-2">
				{isOnline ? (
					<>
						<Wifi className="h-5 w-5" />
						<span>חזרת לאינטרנט</span>
					</>
				) : (
					<>
						<WifiOff className="h-5 w-5" />
						<span>אין חיבור לאינטרנט - עובד במצב לא מקוון</span>
					</>
				)}
			</div>
		</div>
	)
}



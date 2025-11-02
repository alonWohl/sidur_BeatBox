import React, { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from './ui/button'

export const InstallPrompt = () => {
	const [deferredPrompt, setDeferredPrompt] = useState(null)
	const [showPrompt, setShowPrompt] = useState(false)

	useEffect(() => {
		// Check if already dismissed
		const dismissed = localStorage.getItem('pwa-install-dismissed')
		if (dismissed) return

		// Check if already installed
		if (window.matchMedia('(display-mode: standalone)').matches) {
			return
		}

		const handler = e => {
			e.preventDefault()
			setDeferredPrompt(e)
			setShowPrompt(true)
		}

		window.addEventListener('beforeinstallprompt', handler)

		return () => window.removeEventListener('beforeinstallprompt', handler)
	}, [])

	const handleInstall = async () => {
		if (!deferredPrompt) return

		deferredPrompt.prompt()
		const { outcome } = await deferredPrompt.userChoice

		if (outcome === 'accepted') {
			console.log('PWA installed')
		}

		setDeferredPrompt(null)
		setShowPrompt(false)
	}

	const handleDismiss = () => {
		setShowPrompt(false)
		localStorage.setItem('pwa-install-dismissed', 'true')
	}

	if (!showPrompt) return null

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#BE202E] shadow-2xl z-50 p-4 md:hidden animate-in slide-in-from-bottom duration-300">
			<div className="flex items-start gap-3">
				<div className="flex-shrink-0 w-12 h-12 bg-[#BE202E]/10 rounded-xl flex items-center justify-center">
					<Download className="h-6 w-6 text-[#BE202E]" />
				</div>

				<div className="flex-1">
					<h3 className="font-bold text-gray-900 mb-1">התקן את האפליקציה</h3>
					<p className="text-sm text-gray-600 mb-3">גישה מהירה ונוחה לסידור העבודה ישירות מהמסך הבית</p>

					<div className="flex gap-2">
						<Button onClick={handleInstall} className="bg-[#BE202E] hover:bg-[#9e1825] text-white flex-1">
							התקן
						</Button>
						<Button onClick={handleDismiss} variant="outline" className="flex-1">
							אולי מאוחר יותר
						</Button>
					</div>
				</div>

				<button onClick={handleDismiss} className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full">
					<X className="h-5 w-5 text-gray-400" />
				</button>
			</div>
		</div>
	)
}



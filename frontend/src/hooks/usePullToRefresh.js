import { useState, useEffect, useRef } from 'react'

export const usePullToRefresh = (onRefresh, threshold = 80) => {
	const [isPulling, setIsPulling] = useState(false)
	const [pullDistance, setPullDistance] = useState(0)
	const startY = useRef(0)
	const currentY = useRef(0)

	useEffect(() => {
		let rafId = null

		const handleTouchStart = e => {
			// Only trigger if at top of page
			if (window.scrollY === 0) {
				startY.current = e.touches[0].clientY
				setIsPulling(true)
			}
		}

		const handleTouchMove = e => {
			if (!isPulling) return

			currentY.current = e.touches[0].clientY
			const distance = Math.max(0, currentY.current - startY.current)

			if (distance > 0) {
				e.preventDefault()
				// Add resistance to the pull
				const resistedDistance = distance * 0.5
				setPullDistance(Math.min(resistedDistance, threshold * 1.5))
			}
		}

		const handleTouchEnd = async () => {
			if (!isPulling) return

			setIsPulling(false)

			if (pullDistance >= threshold) {
				// Trigger refresh
				if (onRefresh) {
					await onRefresh()
				}
			}

			setPullDistance(0)
		}

		document.addEventListener('touchstart', handleTouchStart, { passive: false })
		document.addEventListener('touchmove', handleTouchMove, { passive: false })
		document.addEventListener('touchend', handleTouchEnd)

		return () => {
			document.removeEventListener('touchstart', handleTouchStart)
			document.removeEventListener('touchmove', handleTouchMove)
			document.removeEventListener('touchend', handleTouchEnd)
			if (rafId) cancelAnimationFrame(rafId)
		}
	}, [isPulling, pullDistance, threshold, onRefresh])

	return {
		isPulling,
		pullDistance,
		isRefreshing: pullDistance >= threshold
	}
}



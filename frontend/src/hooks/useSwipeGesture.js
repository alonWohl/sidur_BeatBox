import { useState, useEffect } from 'react'

export const useSwipeGesture = (onSwipeLeft, onSwipeRight) => {
	const [touchStart, setTouchStart] = useState(null)
	const [touchEnd, setTouchEnd] = useState(null)

	// Minimum swipe distance (in px)
	const minSwipeDistance = 50

	const onTouchStart = e => {
		setTouchEnd(null)
		setTouchStart(e.targetTouches[0].clientX)
	}

	const onTouchMove = e => {
		setTouchEnd(e.targetTouches[0].clientX)
	}

	const onTouchEnd = () => {
		if (!touchStart || !touchEnd) return

		const distance = touchStart - touchEnd
		const isLeftSwipe = distance > minSwipeDistance
		const isRightSwipe = distance < -minSwipeDistance

		if (isLeftSwipe && onSwipeLeft) {
			onSwipeLeft()
		}
		if (isRightSwipe && onSwipeRight) {
			onSwipeRight()
		}
	}

	return {
		onTouchStart,
		onTouchMove,
		onTouchEnd
	}
}



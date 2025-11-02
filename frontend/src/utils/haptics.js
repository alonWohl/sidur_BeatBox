// Haptic feedback utilities for mobile devices

export const haptics = {
	// Light tap feedback
	light: () => {
		if ('vibrate' in navigator) {
			navigator.vibrate(10)
		}
	},

	// Medium feedback
	medium: () => {
		if ('vibrate' in navigator) {
			navigator.vibrate(20)
		}
	},

	// Success feedback
	success: () => {
		if ('vibrate' in navigator) {
			navigator.vibrate([10, 50, 10])
		}
	},

	// Error feedback
	error: () => {
		if ('vibrate' in navigator) {
			navigator.vibrate([20, 100, 20, 100, 20])
		}
	},

	// Warning feedback
	warning: () => {
		if ('vibrate' in navigator) {
			navigator.vibrate([30, 50, 30])
		}
	}
}



import { useState, useEffect } from 'react'

export const useDarkMode = () => {
	const [isDark, setIsDark] = useState(() => {
		const saved = localStorage.getItem('darkMode')
		if (saved !== null) {
			return JSON.parse(saved)
		}
		// Check system preference
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	})

	useEffect(() => {
		localStorage.setItem('darkMode', JSON.stringify(isDark))

		if (isDark) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	}, [isDark])

	const toggle = () => setIsDark(!isDark)

	return [isDark, toggle]
}



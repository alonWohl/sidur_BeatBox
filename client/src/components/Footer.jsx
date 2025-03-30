import { forwardRef } from 'react'

export const Footer = forwardRef((props, ref) => {
  return (
    <footer ref={ref} className="bg-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <p className="text-gray-500 text-center text-sm">© 2025 כל הזכויות שמורות ביטבוקס חדרי קרריוקי בע״מ</p>
      </div>
    </footer>
  )
})

Footer.displayName = 'Footer'

import { useState, useLayoutEffect } from 'react'

export function useElementHeight(ref) {
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.borderBoxSize[0]?.blockSize || entry.target.offsetHeight)
      }
    })

    resizeObserver.observe(ref.current)
    return () => resizeObserver.disconnect()
  }, [ref])

  return height
}

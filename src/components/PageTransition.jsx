import { useEffect, useRef } from 'react'

function PageTransition({ children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Trigger animation on mount
    el.style.opacity = '0'
    el.style.transform = 'translateY(12px)'
    // Force reflow
    el.getBoundingClientRect()
    el.style.transition = 'opacity 0.25s ease, transform 0.25s ease'
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  }, [])

  return (
    <div ref={ref} style={{ willChange: 'opacity, transform' }}>
      {children}
    </div>
  )
}

export default PageTransition
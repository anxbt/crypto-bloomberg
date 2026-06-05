import React, { useEffect, useRef, useState } from 'react'

// Scrubs from previous value → next over `duration` ms with ease-out cubic.
// `format` is (number) => string; omit for integer display.
// Use case: hero price counter that animates in on asset load + scrubs on switch.
export default function AnimatedNumber({ value, format, duration = 700 }) {
  const [display, setDisplay] = useState(typeof value === 'number' ? 0 : value)
  const fromRef = useRef(0)

  useEffect(() => {
    if (typeof value !== 'number') return
    const start = performance.now()
    const from = fromRef.current
    const to = value
    let raf
    function tick(now) {
      const elapsed = now - start
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = to
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <>{format ? format(display) : Math.round(display).toLocaleString()}</>
}

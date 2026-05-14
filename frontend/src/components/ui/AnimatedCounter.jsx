import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function AnimatedCounter({ target = 0, duration = 1500, prefix = '', suffix = '', className = '' }) {
  const [count, setCount] = useState(0)
  const startRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = performance.now()
    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(ease * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return (
    <motion.span
      className={`font-mono font-bold ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  )
}

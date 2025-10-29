import { use, useEffect, useRef } from 'react'

export function usePolling(fn: () => Promise<any> | void, intervalMs = 2000, active = true) {
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true
    async function tick() {
      if (!mounted) return
      try { await fn() } catch (e) { /* ignore */ }
      if (mounted) timerRef.current = window.setTimeout(tick, intervalMs)
    }
    if (active) tick()
    return () => {
      mounted = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [fn, intervalMs, active])
}
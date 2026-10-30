import { useEffect, useRef, useState, type RefObject } from 'react'

const hasIO = () => typeof window !== 'undefined' && 'IntersectionObserver' in window

/**
 * Виден ли элемент. `once` (по умолчанию) — после первого пересечения остаётся true
 * и наблюдатель отключается. Без IntersectionObserver элемент сразу считается видимым.
 */
export function useInView<T extends Element>({
  once = true,
  rootMargin,
}: { once?: boolean; rootMargin?: string } = {}): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(() => !hasIO())

  useEffect(() => {
    const el = ref.current
    if (!el || !hasIO()) return
    const io = new IntersectionObserver(
      (entries, observer) => {
        const visible = entries[entries.length - 1].isIntersecting
        if (visible && once) observer.disconnect()
        if (visible || !once) setInView(visible)
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once, rootMargin])

  return [ref, inView]
}

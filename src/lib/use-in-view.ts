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
  // Старт одинаковый на сервере и в браузере: иначе гидратация оставит data-visible из разметки сборки.
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!hasIO()) {
      setInView(true)
      return
    }
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

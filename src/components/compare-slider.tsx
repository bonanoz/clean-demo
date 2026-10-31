import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { ChevronsLeftRight } from 'lucide-react'
import { Photo } from '@/components/kit/Photo'
import type { ImageName } from '@/data/images'
import { useInView } from '@/lib/use-in-view'

type CompareSliderProps = {
  before: ImageName
  after: ImageName
  beforeAlt: string
  afterAlt: string
  /** Стартовое положение ручки, 0–100. Дальше положение живёт в DOM, а не в пропсах. */
  initial?: number
}

const clamp = (value: number) => Math.min(100, Math.max(0, value))
// Верхнее фото («до») режется справа: видна левая часть, до ручки.
const clipAt = (value: number) => `inset(0 ${100 - value}% 0 0)`
// 1cqw — процент ширины корня (он @container), поэтому ручка не зависит от размеров в px.
const moveTo = (value: number) => `translateX(calc(${value}cqw - 50%))`

const sizes = '(min-width: 1024px) 58vw, 100vw'
const pill = 'type-label absolute top-3 rounded-lg bg-ink-0/70 px-2.5 py-1.5 text-paper'

/**
 * Шторка «до/после». Положение пишется напрямую в DOM (clip-path, transform ручки, aria-valuenow):
 * ни перетаскивание, ни клавиши не вызывают ререндер.
 */
export function CompareSlider({ before, after, beforeAlt, afterAlt, initial = 50 }: CompareSliderProps) {
  const start = clamp(initial)
  const [rootRef, seen] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -20% 0px' })
  const top = useRef<HTMLDivElement>(null)
  const handle = useRef<HTMLDivElement>(null)
  const value = useRef(start)
  // Тянущий указатель: offset — расстояние от ручки до указателя в момент нажатия (ручка не прыгает),
  // box — размеры шторки, снятые один раз при нажатии. null — не тянем.
  const grab = useRef<{ id: number; offset: number; box: DOMRect } | null>(null)
  const hint = useRef<Animation[]>([])

  const stopHint = () => {
    hint.current.forEach((animation) => animation.cancel())
    hint.current = []
  }

  const write = (next: number) => {
    const v = clamp(next)
    value.current = v
    stopHint()
    top.current?.style.setProperty('clip-path', clipAt(v))
    const el = handle.current
    if (!el) return
    el.style.transform = moveTo(v)
    // Атрибут меняется только на целом шаге: скринридер не получает 60 событий в секунду.
    const text = String(Math.round(v))
    if (el.getAttribute('aria-valuenow') !== text) el.setAttribute('aria-valuenow', text)
  }

  const valueAt = (clientX: number, box: DOMRect) => ((clientX - box.left) / box.width) * 100

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Второй палец или другая кнопка не перехватывают уже начатое перетаскивание.
    if (event.button !== 0 || grab.current !== null) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const box = rootRef.current!.getBoundingClientRect()
    grab.current = { id: event.pointerId, offset: value.current - valueAt(event.clientX, box), box }
    stopHint()
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = grab.current
    if (drag?.id === event.pointerId) write(valueAt(event.clientX, drag.box) + drag.offset)
  }
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove(event)
    grab.current = null
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[event.key]
    if (step !== undefined) write(Math.round(value.current) + step)
    else if (event.key === 'Home') write(0)
    else if (event.key === 'End') write(100)
    else return
    event.preventDefault()
  }

  // Подсказка: ручка один раз качнётся 50 → 30 → 70 → 50, когда шторка попала в экран.
  // Любое движение пользователя (write, нажатие) её отменяет. При reduce подсказки нет.
  useEffect(() => {
    if (!seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const v = value.current
    const stops = [v, clamp(v - 20), clamp(v + 20), v]
    const tokens = getComputedStyle(rootRef.current!)
    // WAAPI не принимает var() в easing, поэтому читаем токен. Без него (jsdom) остаётся встроенная кривая.
    const easing = tokens.getPropertyValue('--ease-in-out').trim() || 'ease-in-out'
    // Ждём, пока Reveal variant="clip" раскроет фото: --dur-clip, токен записан в ms.
    const delay = parseFloat(tokens.getPropertyValue('--dur-clip')) || 0
    const timing = { duration: 1400, delay }
    hint.current = [
      top.current!.animate(stops.map((s) => ({ clipPath: clipAt(s), easing })), timing),
      handle.current!.animate(stops.map((s) => ({ transform: moveTo(s), easing })), timing),
    ]
    return stopHint
  }, [seen, rootRef])

  return (
    <div ref={rootRef} className="@container relative touch-pan-y overflow-hidden rounded-card bg-ink-2 select-none">
      {/* pointer-events-none на картинках: иначе мышь начинает нативное перетаскивание изображения */}
      <Photo name={after} alt={afterAlt} sizes={sizes} className="pointer-events-none block h-auto w-full" />
      <span aria-hidden="true" className={`${pill} right-3`}>
        После
      </span>
      <div ref={top} className="pointer-events-none absolute inset-0" style={{ clipPath: clipAt(start) }}>
        <Photo name={before} alt={beforeAlt} sizes={sizes} className="block size-full object-cover" />
        <span aria-hidden="true" className={`${pill} left-3`}>
          До
        </span>
      </div>
      <div
        ref={handle}
        role="slider"
        tabIndex={0}
        aria-label="Сравнение до и после"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(start)}
        style={{ transform: moveTo(start) }}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (grab.current = null)}
        className="group absolute inset-y-0 left-0 w-11 cursor-ew-resize outline-none"
      >
        <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-paper" />
        {/* Тёмный ободок под кольцом фокуса: по светлым местам фото --sage-bright один не дотягивает до 3:1 */}
        <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink-0 group-focus-visible:shadow-[0_0_0_6px_var(--ink-0)] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-sage-bright">
          <ChevronsLeftRight aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </span>
      </div>
    </div>
  )
}

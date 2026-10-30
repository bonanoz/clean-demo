import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { CompareSlider } from '@/components/compare-slider'
import { nameIs, setReducedMotion } from '@/test/helpers'

const props = {
  before: 'compare-before',
  after: 'compare-after',
  beforeAlt: 'Салон до химчистки',
  afterAlt: 'Салон после химчистки',
} as const

const slider = () => screen.getByRole('slider', { name: nameIs('Сравнение до и после') })
const value = () => Number(slider().getAttribute('aria-valuenow'))

/** X из inline `clip-path: inset(0 X% 0 0)`; шторка режет верхнее фото. */
function clipX(root: ParentNode): number | null {
  for (const el of root.querySelectorAll<HTMLElement>('*')) {
    const m = el.style.getPropertyValue('clip-path').match(/^inset\(\s*0(?:px|%)?\s+([\d.]+)%\s+0(?:px|%)?\s+0(?:px|%)?\s*\)$/)
    if (m) return Number(m[1])
  }
  return null
}

describe('E6: CompareSlider, разметка', () => {
  it('ползунок: role=slider, подпись, границы 0–100, по умолчанию 50', () => {
    render(<CompareSlider {...props} />)
    const s = slider()
    expect(s).toHaveAttribute('aria-valuemin', '0')
    expect(s).toHaveAttribute('aria-valuemax', '100')
    expect(s).toHaveAttribute('aria-valuenow', '50')
  })

  it('initial задаёт стартовое положение', () => {
    render(<CompareSlider {...props} initial={30} />)
    expect(value()).toBe(30)
  })

  it('обе картинки с непустым alt, размерами и ленивой загрузкой', () => {
    render(<CompareSlider {...props} />)
    const before = screen.getByAltText(props.beforeAlt)
    const after = screen.getByAltText(props.afterAlt)
    expect(before.getAttribute('src')).toMatch(/^\/images\/compare-before-/)
    expect(after.getAttribute('src')).toMatch(/^\/images\/compare-after-/)
    for (const img of [before, after]) {
      expect(Number(img.getAttribute('width'))).toBeGreaterThan(0)
      expect(Number(img.getAttribute('height'))).toBeGreaterThan(0)
      expect(img).toHaveAttribute('loading', 'lazy')
    }
  })

  it('верхнее фото режется inline clip-path: inset(0 X% 0 0), ничто не мешает вертикальной прокрутке', () => {
    const { container } = render(<CompareSlider {...props} />)
    expect(clipX(container)).toBe(50)
    const panY = [...container.querySelectorAll<HTMLElement>('*')].some(
      (el) => el.style.getPropertyValue('touch-action') === 'pan-y' || el.classList.contains('touch-pan-y'),
    )
    expect(panY, 'нет touch-action: pan-y').toBe(true)
  })
})

describe('E6: CompareSlider, клавиатура', () => {
  it('ползунок получает фокус по Tab', async () => {
    const user = userEvent.setup()
    render(<CompareSlider {...props} />)
    await user.tab()
    expect(slider()).toHaveFocus()
  })

  it('ArrowRight +5, End → 100 и дальше не растёт, Home → 0 и дальше не падает', async () => {
    const user = userEvent.setup()
    render(<CompareSlider {...props} />)
    slider().focus()
    expect(value()).toBe(50)

    await user.keyboard('{ArrowRight}')
    expect(value()).toBe(55)

    await user.keyboard('{End}')
    expect(value()).toBe(100)
    await user.keyboard('{ArrowRight}')
    expect(value()).toBe(100)

    await user.keyboard('{Home}')
    expect(value()).toBe(0)
    await user.keyboard('{ArrowLeft}')
    expect(value()).toBe(0)
  })

  it('ArrowUp +5, ArrowDown −5, ArrowLeft −5', async () => {
    const user = userEvent.setup()
    render(<CompareSlider {...props} />)
    slider().focus()
    await user.keyboard('{ArrowUp}')
    expect(value()).toBe(55)
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(value()).toBe(45)
    await user.keyboard('{ArrowLeft}')
    expect(value()).toBe(40)
  })

  it('шаг не выходит за границы около краёв', async () => {
    const user = userEvent.setup()
    render(<CompareSlider {...props} initial={98} />)
    slider().focus()
    await user.keyboard('{ArrowRight}')
    expect(value()).toBe(100)
  })

  it('clip-path следует за значением (в обе стороны согласованно)', async () => {
    const user = userEvent.setup()
    const { container } = render(<CompareSlider {...props} />)
    slider().focus()

    await user.keyboard('{ArrowRight}')
    const x55 = clipX(container)
    expect([45, 55]).toContain(x55)
    const inverted = x55 === 45
    const expected = (v: number) => (inverted ? 100 - v : v)

    await user.keyboard('{End}')
    expect(clipX(container)).toBe(expected(100))
    await user.keyboard('{Home}')
    expect(clipX(container)).toBe(expected(0))
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(clipX(container)).toBe(expected(10))
  })
})

describe('E6: CompareSlider, перетаскивание', () => {
  let captured = false
  const originals = {
    rect: Element.prototype.getBoundingClientRect,
    set: Element.prototype.setPointerCapture,
    has: Element.prototype.hasPointerCapture,
    release: Element.prototype.releasePointerCapture,
  }

  beforeEach(() => {
    captured = false
    // ширина шторки 200 px: clientX = 150 → 75 %
    Element.prototype.getBoundingClientRect = () =>
      ({ x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100, toJSON: () => ({}) }) as DOMRect
    Element.prototype.setPointerCapture = vi.fn(() => {
      captured = true
    })
    Element.prototype.hasPointerCapture = vi.fn(() => captured)
    Element.prototype.releasePointerCapture = vi.fn(() => {
      captured = false
    })
  })

  afterEach(() => {
    Element.prototype.getBoundingClientRect = originals.rect
    Element.prototype.setPointerCapture = originals.set
    Element.prototype.hasPointerCapture = originals.has
    Element.prototype.releasePointerCapture = originals.release
  })

  const down = (x: number) => fireEvent.pointerDown(slider(), { clientX: x, pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0, buttons: 1 })
  const move = (x: number) => fireEvent.pointerMove(slider(), { clientX: x, pointerId: 1, pointerType: 'touch', isPrimary: true, buttons: 1 })
  const up = (x: number) => fireEvent.pointerUp(slider(), { clientX: x, pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0, buttons: 0 })

  it('нажатие захватывает указатель, движение двигает шторку, отпускание фиксирует значение', () => {
    const { container } = render(<CompareSlider {...props} />)
    down(100)
    expect(Element.prototype.setPointerCapture).toHaveBeenCalledWith(1)
    move(150)
    expect(value()).toBe(75)
    move(40)
    up(40)
    expect(value()).toBe(20)
    expect([20, 80]).toContain(clipX(container))
  })

  it('за границами шторки значение зажато в 0–100', () => {
    render(<CompareSlider {...props} />)
    down(100)
    move(500)
    expect(value()).toBe(100)
    move(-300)
    up(-300)
    expect(value()).toBe(0)
  })

  it('движение без нажатия ничего не меняет', () => {
    render(<CompareSlider {...props} />)
    move(150)
    expect(value()).toBe(50)
  })

  it('после перетаскивания клавиши продолжают с нового положения', async () => {
    const user = userEvent.setup()
    render(<CompareSlider {...props} />)
    down(100)
    move(150)
    up(150)
    slider().focus()
    await user.keyboard('{ArrowRight}')
    expect(value()).toBe(80)
  })
})

describe('E6: CompareSlider, подсказка WAAPI', () => {
  const originalAnimate = Element.prototype.animate
  let animate: Mock<(...args: unknown[]) => unknown>
  let restoreMotion: () => void

  beforeEach(() => {
    animate = vi.fn((..._args: unknown[]) => ({ finished: Promise.resolve(), cancel: vi.fn(), finish: vi.fn(), play: vi.fn(), pause: vi.fn(), onfinish: null }))
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate
  })

  afterEach(() => {
    Element.prototype.animate = originalAnimate
    restoreMotion?.()
  })

  const durations = () =>
    animate.mock.calls.map(([, options]) => (typeof options === 'number' ? options : (options as KeyframeAnimationOptions)?.duration))

  it('при prefers-reduced-motion: reduce подсказки нет', async () => {
    restoreMotion = setReducedMotion(true)
    render(<CompareSlider {...props} />)
    await new Promise((r) => setTimeout(r, 30))
    expect(animate).not.toHaveBeenCalled()
  })

  it('без reduce при первом показе проигрывается один раз, 1400 мс', async () => {
    restoreMotion = setReducedMotion(false)
    const { rerender } = render(<CompareSlider {...props} />)
    await waitFor(() => expect(animate).toHaveBeenCalled())
    expect(durations().every((d) => d === 1400), `длительности: ${durations()}`).toBe(true)

    const calls = animate.mock.calls.length
    rerender(<CompareSlider {...props} initial={50} />)
    await new Promise((r) => setTimeout(r, 30))
    expect(animate.mock.calls.length).toBe(calls)
  })

  it('подсказка не меняет aria-valuenow', async () => {
    restoreMotion = setReducedMotion(false)
    render(<CompareSlider {...props} />)
    await waitFor(() => expect(animate).toHaveBeenCalled())
    expect(value()).toBe(50)
  })
})

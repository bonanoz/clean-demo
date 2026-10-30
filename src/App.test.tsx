import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { nav } from '@/data/site'
import { nameIs } from '@/test/helpers'

const sectionIds = ['hero', 'about', 'services', 'results', 'calculator', 'reviews', 'faq', 'booking', 'contacts']

describe('E1: App, сборка страницы', () => {
  it('секции идут в порядке hero, about, services, results, calculator, reviews, faq, booking, contacts', () => {
    const { container } = render(<App />)
    const found = [...container.querySelectorAll('[id]')].map((el) => el.id).filter((id) => sectionIds.includes(id))
    expect(found).toEqual(sectionIds)
  })

  it('восемь секций лежат в <main id="main">, контакты (подвал) идут после него', () => {
    const { container } = render(<App />)
    const main = container.querySelector('main')!
    expect(main).toHaveAttribute('id', 'main')
    for (const id of sectionIds.slice(0, 8)) {
      expect(main.querySelector(`#${id}`), `#${id} внутри main`).not.toBeNull()
    }
    const contacts = container.querySelector('#contacts')!
    expect(main.contains(contacts)).toBe(false)
    expect(main.compareDocumentPosition(contacts) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('у каждой секции в main есть доступное имя', () => {
    const { container } = render(<App />)
    for (const id of sectionIds.slice(0, 8)) {
      expect(container.querySelector(`#${id}`), `#${id}`).toHaveAccessibleName()
    }
  })

  it('шапка стоит перед main', () => {
    const { container } = render(<App />)
    const header = screen.getByRole('banner')
    const main = container.querySelector('main')!
    expect(header.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('каждая ссылка навигации указывает на существующий id', () => {
    const { container } = render(<App />)
    for (const item of nav) {
      expect(container.querySelector(item.href), `${item.label} → ${item.href}`).not.toBeNull()
    }
  })

  it('любая якорная ссылка на странице (#something) указывает на существующий id', () => {
    const { container } = render(<App />)
    const broken = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
      .map((a) => a.getAttribute('href')!)
      .filter((href) => href.length > 1 && !container.querySelector(href))
    expect(broken).toEqual([])
  })

  it('первая фокусируемая ссылка — «К содержимому» на #main', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.tab()
    const skip = screen.getByRole('link', { name: nameIs('К содержимому') })
    expect(skip).toHaveAttribute('href', '#main')
    expect(skip).toHaveFocus()
  })
})

describe('E1: index.html', () => {
  const root = join(import.meta.dirname, '..')
  const html = readFileSync(join(root, 'index.html'), 'utf8')
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const meta = (selector: string) => doc.querySelector(selector)?.getAttribute('content') ?? ''

  it('язык, заголовок и описание', () => {
    expect(doc.documentElement.lang).toBe('ru')
    expect(doc.title.trim().length).toBeGreaterThan(0)
    expect(meta('meta[name="description"]').trim().length).toBeGreaterThan(20)
  })

  it('theme-color #050505', () => {
    expect(meta('meta[name="theme-color"]').toLowerCase()).toBe('#050505')
  })

  it('Open Graph: title, description, image hero-main-1024.webp', () => {
    expect(meta('meta[property="og:title"]').length).toBeGreaterThan(0)
    expect(meta('meta[property="og:description"]').length).toBeGreaterThan(0)
    expect(meta('meta[property="og:image"]')).toContain('hero-main-1024.webp')
  })

  it('SVG-фавикон на месте', () => {
    const href = doc.querySelector('link[rel~="icon"]')?.getAttribute('href') ?? ''
    expect(href).toMatch(/\.svg$/)
    const file = join(root, 'public', href.replace(/^\//, ''))
    expect(() => readFileSync(file)).not.toThrow()
  })

  it('предзагружены ровно два шрифта первого экрана: Unbounded cyrillic и Geist cyrillic', () => {
    const fonts = [...doc.querySelectorAll('link[rel="preload"][as="font"]')]
    expect(fonts.map((l) => l.getAttribute('href')).sort()).toEqual([
      '/fonts/geist-cyrillic-wght.woff2',
      '/fonts/unbounded-cyrillic-wght.woff2',
    ])
    for (const link of fonts) {
      expect(link.getAttribute('type')).toBe('font/woff2')
      expect(link.hasAttribute('crossorigin')).toBe(true)
    }
  })

  it('hero-main предзагружен с imagesrcset и imagesizes', () => {
    const link = doc.querySelector('link[rel="preload"][as="image"]')
    expect(link, 'нет preload для hero-main').not.toBeNull()
    const srcset = link!.getAttribute('imagesrcset') ?? ''
    for (const w of [640, 1024, 1600]) expect(srcset).toContain(`/images/hero-main-${w}.`)
    expect(link!.getAttribute('imagesizes')).toBe('(min-width: 1024px) 58vw, 100vw')
  })
})

describe('E1: токены дизайн-системы в index.css', () => {
  const root = join(import.meta.dirname, '..')
  const css = readFileSync(join(root, 'src', 'index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  // Сравниваем без пробелов и регистра: важны имя и значение токена, а не вёрстка файла.
  const flat = css.replace(/\s+/g, '').toLowerCase()
  const has = (decl: string) => flat.includes(decl.replace(/\s+/g, '').toLowerCase())

  it.each([
    ['--ink-0', '#050505'],
    ['--ink-1', '#0d0f0e'],
    ['--ink-2', '#131412'],
    ['--ink-3', '#1d1f1c'],
    ['--line', '#2d2e2c'],
    ['--paper', '#f2f3f1'],
    ['--fog', '#b3b8b5'],
    ['--fog-dim', '#8a8f8c'],
    ['--sage', '#5f7561'],
    ['--sage-deep', '#475a4b'],
    ['--sage-bright', '#8fa691'],
  ])('палитра: %s = %s', (name, value) => {
    expect(has(`${name}:${value}`)).toBe(true)
  })

  it('утилиты Tailwind для палитры объявлены в @theme (--color-*)', () => {
    for (const name of ['ink-0', 'ink-1', 'ink-2', 'ink-3', 'line', 'paper', 'fog', 'fog-dim', 'sage', 'sage-deep', 'sage-bright']) {
      expect(flat, `--color-${name}`).toContain(`--color-${name}:`)
    }
  })

  it('токены движения', () => {
    expect(has('--ease-out: cubic-bezier(0.23, 1, 0.32, 1)')).toBe(true)
    expect(has('--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)')).toBe(true)
    expect(has('--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)')).toBe(true)
    expect(has('--dur-press: 160ms')).toBe(true)
    expect(has('--dur-ui: 200ms')).toBe(true)
    expect(has('--dur-reveal: 700ms')).toBe(true)
    expect(has('--stagger: 50ms')).toBe(true)
  })

  it('шкала текста и ритм секций', () => {
    expect(has('--text-h1: clamp(2.125rem, 1.4rem + 3.4vw, 4.5rem)')).toBe(true)
    expect(has('--text-h2: clamp(1.75rem, 1.3rem + 2vw, 3.25rem)')).toBe(true)
    expect(has('--text-h3: clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)')).toBe(true)
    expect(has('--text-price: clamp(1.5rem, 1.25rem + 1vw, 2.25rem)')).toBe(true)
    expect(has('--text-lead: clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)')).toBe(true)
    expect(has('--text-body: clamp(1rem, 0.96rem + 0.18vw, 1.0625rem)')).toBe(true)
    expect(has('--text-small: 0.875rem')).toBe(true)
    expect(has('--text-label: 0.75rem')).toBe(true)
    expect(has('--section-y: clamp(4rem, 3rem + 5vw, 8rem)')).toBe(true)
  })

  it('самохостинг шрифтов: @font-face на все шесть файлов, swap, unicode-range, фолбэки с подгонкой метрик', () => {
    for (const file of ['unbounded', 'geist', 'geist-mono']) {
      for (const subset of ['cyrillic', 'latin']) {
        expect(flat, `${file}-${subset}`).toContain(`/fonts/${file}-${subset}-wght.woff2`)
      }
    }
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? []
    expect(faces.length).toBeGreaterThanOrEqual(9) // 6 шрифтов + 3 фолбэка
    expect(faces.filter((f) => /font-display:\s*swap/.test(f)).length).toBeGreaterThanOrEqual(6)
    expect(faces.filter((f) => /unicode-range/.test(f)).length).toBeGreaterThanOrEqual(6)
    for (const prop of ['size-adjust', 'ascent-override', 'descent-override']) {
      expect(faces.filter((f) => f.includes(prop)).length, prop).toBeGreaterThanOrEqual(3)
    }
  })

  it('глобальные правила типографики, фокуса и reduced motion', () => {
    expect(has('font-synthesis: none')).toBe(true)
    expect(has('text-wrap: balance')).toBe(true)
    expect(has('text-wrap: pretty')).toBe(true)
    expect(flat).toMatch(/outline:2pxsolidvar\(--(color-)?sage-bright\)/)
    expect(has('outline-offset: 2px')).toBe(true)
    expect(flat).toContain('prefers-reduced-motion')
  })

  it('скрытое состояние Reveal только внутри @media (prefers-reduced-motion: no-preference)', () => {
    const selector = '[data-reveal]:not([data-visible])'
    const positions = [...css.matchAll(/\[data-reveal\]:not\(\[data-visible\]\)/g)].map((m) => m.index!)
    expect(positions.length, `нет правила для ${selector}`).toBeGreaterThan(0)
    for (const at of positions) {
      expect(enclosingAtRules(css, at).join(' ').replace(/\s+/g, '')).toContain('prefers-reduced-motion:no-preference')
    }
  })
})

/** Прелюдии блоков `{ … }`, внутри которых стоит позиция `at`. */
function enclosingAtRules(code: string, at: number): string[] {
  const stack: string[] = []
  let start = 0
  for (let i = 0; i < at; i++) {
    if (code[i] === '{') {
      stack.push(code.slice(start, i).trim())
      start = i + 1
    } else if (code[i] === '}') {
      stack.pop()
      start = i + 1
    } else if (code[i] === ';') {
      start = i + 1
    }
  }
  return stack
}

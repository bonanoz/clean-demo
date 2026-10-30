import { vi, expect } from 'vitest'

// Общие помощники тестов-контрактов. Не тест и не часть сборки приложения.

/** Схлопывает любые пробелы (включая неразрывные) в обычный и обрезает края. */
export const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim()

/** Предикат для `getByRole(..., { name })`: имя совпадает с ожидаемым с точностью до неразрывных пробелов. */
export const nameIs = (expected: string) => (accName: string) => norm(accName) === norm(expected)

/** То же, но имя только содержит ожидаемую строку. */
export const nameHas = (part: string) => (accName: string) => norm(accName).includes(norm(part))

/** RegExp из обычной строки: для getByLabelText, где подпись может содержать лишнее. */
export const re = (s: string) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

/** Самый глубокий элемент, чей текст (с точностью до пробелов) содержит `text`. */
export function findTextEl(root: ParentNode, text: string): HTMLElement | null {
  const want = norm(text)
  const matches = [...root.querySelectorAll<HTMLElement>('*')].filter((el) => norm(el.textContent).includes(want))
  return matches.find((el) => !matches.some((m) => m !== el && el.contains(m))) ?? null
}

/**
 * Короткие (1–2 буквы) русские слова, после которых стоит обычный пробел.
 * В видимых строках после них обязан быть неразрывный пробел (typo()).
 */
export function looseShortWords(text: string): string[] {
  return text.match(/(?<![\p{L}\p{N}-])[А-Яа-яЁё]{1,2} (?=\S)/gu) ?? []
}

/** Строка из данных показана на странице и прошла через typo(). */
export function expectTypoApplied(root: ParentNode, rawText: string) {
  const el = findTextEl(root, rawText)
  expect(el, `текст не найден на странице: ${rawText}`).not.toBeNull()
  expect(looseShortWords(el!.textContent ?? ''), `обычный пробел после короткого слова: ${rawText}`).toEqual([])
}

/** Меняет prefers-reduced-motion для следующего рендера; возвращает функцию отката. */
export function setReducedMotion(reduce: boolean): () => void {
  const prev = window.matchMedia
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('no-preference') ? !reduce : query.includes('reduce') ? reduce : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
  return () => {
    window.matchMedia = prev
  }
}

/** Каждый img: непустой alt, width/height, src из /images/. */
export function expectValidPhotos(root: ParentNode, minCount = 1) {
  const imgs = [...root.querySelectorAll('img')]
  expect(imgs.length).toBeGreaterThanOrEqual(minCount)
  for (const img of imgs) {
    expect(img.getAttribute('alt')?.trim(), `пустой alt у ${img.getAttribute('src')}`).toBeTruthy()
    expect(Number(img.getAttribute('width'))).toBeGreaterThan(0)
    expect(Number(img.getAttribute('height'))).toBeGreaterThan(0)
    expect(img.getAttribute('src')).toMatch(/^\/images\//)
  }
  return imgs
}

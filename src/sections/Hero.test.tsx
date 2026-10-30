import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from '@/sections/Hero'
import { expectValidPhotos, nameIs } from '@/test/helpers'

function renderHero() {
  const { container } = render(<Hero />)
  const hero = container.querySelector<HTMLElement>('section#hero')
  expect(hero, 'нет <section id="hero">').not.toBeNull()
  return hero!
}

describe('E3: Hero', () => {
  it('ровно один h1 «Заводской блеск», «Вернём машине заводской блеск» — в лиде', () => {
    const hero = renderHero()
    const h1s = within(hero).getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(within(hero).getByRole('heading', { level: 1, name: nameIs('Заводской блеск') })).toBe(h1s[0])
    expect(hero).toHaveTextContent(/Вернём машине заводской блеск/)
  })

  it('ссылки «Записаться» → #booking и «Рассчитать цену» → #calculator', () => {
    const hero = renderHero()
    const book = within(hero).getAllByRole('link', { name: nameIs('Записаться') })
    expect(book.length).toBeGreaterThanOrEqual(1)
    for (const a of book) expect(a).toHaveAttribute('href', '#booking')

    const calc = within(hero).getAllByRole('link', { name: nameIs('Рассчитать цену') })
    expect(calc.length).toBeGreaterThanOrEqual(1)
    for (const a of calc) expect(a).toHaveAttribute('href', '#calculator')
  })

  it('машина и бенто: пять фото из /images/ с alt, width и height', () => {
    const hero = renderHero()
    const imgs = expectValidPhotos(hero, 5)
    for (const name of ['hero-car', 'hero-main', 'hero-wheel', 'hero-front', 'hero-interior']) {
      expect(
        imgs.some((img) => img.getAttribute('src')?.startsWith(`/images/${name}-`)),
        `нет фото ${name}`,
      ).toBe(true)
    }
  })

  // sizes совпадают с preload в index.html, иначе браузер скачает картинку дважды
  it.each([
    ['hero-car', '(min-width: 1024px) 50vw, 84vw'],
    ['hero-main', '(min-width: 1024px) 58vw, 100vw'],
  ])('%s: fetchpriority="high", не lazy; sizes зафиксирован', (name, sizes) => {
    const hero = renderHero()
    const img = hero.querySelector<HTMLImageElement>(`img[src^="/images/${name}-"]`)!
    expect(img).toHaveAttribute('fetchpriority', 'high')
    expect(img).not.toHaveAttribute('loading', 'lazy')
    const sources = img.closest('picture')!.querySelectorAll('source')
    expect(sources.length).toBeGreaterThanOrEqual(2)
    for (const s of sources) expect(s).toHaveAttribute('sizes', sizes)
  })

  it('остальные фото — loading="lazy", без fetchpriority="high"', () => {
    const hero = renderHero()
    const first = ['/images/hero-main-', '/images/hero-car-']
    const others = [...hero.querySelectorAll('img')].filter((img) => !first.some((p) => img.getAttribute('src')?.startsWith(p)))
    expect(others.length).toBeGreaterThanOrEqual(3)
    for (const img of others) {
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).not.toHaveAttribute('fetchpriority', 'high')
    }
  })

  it('карточка hero-wheel с меткой «Внимание к деталям»', () => {
    const hero = renderHero()
    expect(hero).toHaveTextContent(/внимание к деталям/i)
  })

  it('две инфо-карточки: «[01] Выездная мойка» и «[02] 1 500 владельцев доверили нам машину»', () => {
    const hero = renderHero()
    expect(hero).toHaveTextContent('[01]')
    expect(hero).toHaveTextContent('Выездная мойка')
    expect(hero).toHaveTextContent('[02]')
    expect(hero).toHaveTextContent('1 500 владельцев доверили нам машину')
  })
})

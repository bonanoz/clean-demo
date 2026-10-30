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
  it('ровно один h1 «Вернём машине заводской блеск»', () => {
    const hero = renderHero()
    const h1s = within(hero).getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(within(hero).getByRole('heading', { level: 1, name: nameIs('Вернём машине заводской блеск') })).toBe(h1s[0])
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

  it('бенто: четыре фото из /images/ с alt, width и height', () => {
    const hero = renderHero()
    const imgs = expectValidPhotos(hero, 4)
    for (const name of ['hero-main', 'hero-wheel', 'hero-front', 'hero-interior']) {
      expect(
        imgs.some((img) => img.getAttribute('src')?.startsWith(`/images/${name}-`)),
        `нет фото ${name}`,
      ).toBe(true)
    }
  })

  it('hero-main: fetchpriority="high", не lazy; sizes зафиксирован', () => {
    const hero = renderHero()
    const main = hero.querySelector<HTMLImageElement>('img[src^="/images/hero-main-"]')!
    expect(main).toHaveAttribute('fetchpriority', 'high')
    expect(main).not.toHaveAttribute('loading', 'lazy')
    const sources = main.closest('picture')!.querySelectorAll('source')
    expect(sources.length).toBeGreaterThanOrEqual(2)
    for (const s of sources) expect(s).toHaveAttribute('sizes', '(min-width: 1024px) 58vw, 100vw')
  })

  it('остальные фото — loading="lazy", без fetchpriority="high"', () => {
    const hero = renderHero()
    const others = [...hero.querySelectorAll('img')].filter((img) => !img.getAttribute('src')?.startsWith('/images/hero-main-'))
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

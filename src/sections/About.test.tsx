import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { About } from '@/sections/About'
import { expectTypoApplied, expectValidPhotos, nameIs } from '@/test/helpers'

function renderAbout() {
  const { container } = render(<About />)
  const about = container.querySelector<HTMLElement>('section#about')
  expect(about, 'нет <section id="about">').not.toBeNull()
  return about!
}

describe('E3: About', () => {
  it('h2 «Машине мало обычной мойки»', () => {
    const about = renderAbout()
    expect(within(about).getByRole('heading', { level: 2, name: nameIs('Машине мало обычной мойки') })).toBeInTheDocument()
  })

  it('строка «Чтобы машина выглядела как из салона — clean.cars»', () => {
    const about = renderAbout()
    expect(about).toHaveTextContent('Чтобы машина выглядела как из салона — clean.cars')
  })

  it('строка прошла через typo: неразрывные пробелы после «из» и перед тире', () => {
    const about = renderAbout()
    expect(about.textContent).toContain('из\u00a0салона\u00a0—')
    expectTypoApplied(about, 'Чтобы машина выглядела как из салона — clean.cars')
  })

  it('карточка-папка «Профессиональная химия и оборудование»', () => {
    const about = renderAbout()
    expect(about).toHaveTextContent('Профессиональная химия и оборудование')
    expectTypoApplied(about, 'Профессиональная химия и оборудование')
  })

  it('карточка «Безопасно для лака» со ссылкой «Подробнее» на #services', () => {
    const about = renderAbout()
    expect(about).toHaveTextContent('Безопасно для лака')
    const more = within(about).getAllByRole('link', { name: nameIs('Подробнее') })
    expect(more.some((a) => a.getAttribute('href') === '#services')).toBe(true)
  })

  it('фото about-studio: alt, width, height, /images/, lazy', () => {
    const about = renderAbout()
    const imgs = expectValidPhotos(about, 1)
    expect(imgs.some((img) => img.getAttribute('src')?.startsWith('/images/about-studio-'))).toBe(true)
    for (const img of imgs) {
      expect(img).toHaveAttribute('loading', 'lazy')
      expect(img).not.toHaveAttribute('fetchpriority', 'high')
    }
  })
})

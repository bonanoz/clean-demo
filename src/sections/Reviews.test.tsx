import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Reviews } from '@/sections/Reviews'
import { reviews } from '@/data/reviews'
import { expectTypoApplied, findTextEl, nameIs, norm } from '@/test/helpers'

function renderReviews() {
  const { container } = render(<Reviews />)
  const section = container.querySelector<HTMLElement>('section#reviews')
  expect(section, 'нет <section id="reviews">').not.toBeNull()
  return section!
}

/** Текстовые альтернативы оценки внутри `root`: aria-label или текст листового элемента. */
function ratingAlts(root: ParentNode): string[] {
  return [...root.querySelectorAll<HTMLElement>('*')]
    .flatMap((el) => [el.getAttribute('aria-label'), el.children.length === 0 ? el.textContent : null])
    .map((t) => norm(t))
    .filter((t) => /^Оценка \d из 5$/.test(t))
}

describe('E6: data/reviews', () => {
  it('не меньше четырёх отзывов с полями name, car, text, rating', () => {
    expect(reviews.length).toBeGreaterThanOrEqual(4)
    for (const r of reviews) {
      expect(r.name.trim()).not.toBe('')
      expect(r.car.trim()).not.toBe('')
      expect(r.text.trim().length).toBeGreaterThan(20)
      expect(Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5).toBe(true)
    }
  })
})

describe('E6: Reviews', () => {
  it('h2 «Что говорят клиенты»', () => {
    const section = renderReviews()
    expect(within(section).getByRole('heading', { level: 2, name: nameIs('Что говорят клиенты') })).toBeInTheDocument()
  })

  it('все отзывы из данных показаны: имя и текст', () => {
    const section = renderReviews()
    for (const r of reviews) {
      expect(section, r.name).toHaveTextContent(r.name)
      expect(section, r.text).toHaveTextContent(r.text)
    }
  })

  it('у каждого отзыва есть текстовая альтернатива оценки «Оценка N из 5»', () => {
    const section = renderReviews()
    expect(ratingAlts(section).length).toBeGreaterThanOrEqual(4)
    for (const r of reviews) {
      const textEl = findTextEl(section, r.text)!
      let card: HTMLElement | null = textEl
      while (card && card !== section && !norm(card.textContent).includes(norm(r.name))) card = card.parentElement
      expect(card, `карточка отзыва ${r.name}`).not.toBe(section)
      expect(ratingAlts(card!), r.name).toContain(`Оценка ${r.rating} из 5`)
    }
  })

  it('тексты отзывов прошли через typo', () => {
    const section = renderReviews()
    for (const r of reviews) expectTypoApplied(section, r.text)
  })
})

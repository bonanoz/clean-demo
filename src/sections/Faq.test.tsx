import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Faq } from '@/sections/Faq'
import { faq } from '@/data/faq'
import { expectTypoApplied, findTextEl, nameIs } from '@/test/helpers'

function renderFaq() {
  const { container } = render(<Faq />)
  const section = container.querySelector<HTMLElement>('section#faq')
  expect(section, 'нет <section id="faq">').not.toBeNull()
  return section!
}

const trigger = (section: HTMLElement, q: string) => within(section).getByRole('button', { name: nameIs(q) })

/** Ответ показан: элемент с текстом есть и виден. */
function answerVisible(section: HTMLElement, a: string) {
  const el = findTextEl(section, a)
  if (!el) return false
  try {
    expect(el).toBeVisible()
    return true
  } catch {
    return false
  }
}

describe('E6: data/faq', () => {
  it('не меньше шести вопросов с непустыми q и a', () => {
    expect(faq.length).toBeGreaterThanOrEqual(6)
    for (const item of faq) {
      expect(item.q.trim()).not.toBe('')
      expect(item.a.trim().length).toBeGreaterThan(20)
    }
  })
})

describe('E6: Faq', () => {
  it('h2 «Частые вопросы»', () => {
    const section = renderFaq()
    expect(within(section).getByRole('heading', { level: 2, name: nameIs('Частые вопросы') })).toBeInTheDocument()
  })

  it('не меньше шести вопросов-кнопок, вначале все закрыты, ответов не видно', () => {
    const section = renderFaq()
    expect(within(section).getAllByRole('button').length).toBeGreaterThanOrEqual(6)
    for (const item of faq) {
      expect(trigger(section, item.q), item.q).toHaveAttribute('aria-expanded', 'false')
      expect(answerVisible(section, item.a), `ответ виден до клика: ${item.q}`).toBe(false)
    }
  })

  it('клик по вопросу открывает ответ', async () => {
    const user = userEvent.setup()
    const section = renderFaq()
    await user.click(trigger(section, faq[0].q))
    expect(trigger(section, faq[0].q)).toHaveAttribute('aria-expanded', 'true')
    expect(answerVisible(section, faq[0].a)).toBe(true)
  })

  it('клик по другому вопросу закрывает первый (одновременно открыт один)', async () => {
    const user = userEvent.setup()
    const section = renderFaq()
    await user.click(trigger(section, faq[0].q))
    await user.click(trigger(section, faq[1].q))

    expect(trigger(section, faq[1].q)).toHaveAttribute('aria-expanded', 'true')
    expect(trigger(section, faq[0].q)).toHaveAttribute('aria-expanded', 'false')
    expect(answerVisible(section, faq[1].a)).toBe(true)
    expect(answerVisible(section, faq[0].a)).toBe(false)
    expect(section.querySelectorAll('button[aria-expanded="true"]')).toHaveLength(1)
  })

  it('повторный клик по открытому вопросу закрывает его', async () => {
    const user = userEvent.setup()
    const section = renderFaq()
    await user.click(trigger(section, faq[2].q))
    await user.click(trigger(section, faq[2].q))
    expect(trigger(section, faq[2].q)).toHaveAttribute('aria-expanded', 'false')
    expect(answerVisible(section, faq[2].a)).toBe(false)
  })

  it('вопросы и ответы прошли через typo', async () => {
    const user = userEvent.setup()
    const section = renderFaq()
    for (const item of faq) {
      expectTypoApplied(section, item.q)
      await user.click(trigger(section, item.q))
      expectTypoApplied(section, item.a)
    }
  })
})

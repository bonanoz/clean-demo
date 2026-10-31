import { render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Services } from '@/sections/Services'
import { serviceGroups } from '@/data/services'
import { priceRange } from '@/lib/price'
import { formatRub } from '@/lib/format'
import { expectTypoApplied, expectValidPhotos, nameIs, norm } from '@/test/helpers'

function renderServices() {
  const { container } = render(<Services />)
  const section = container.querySelector<HTMLElement>('section#services')
  expect(section, 'нет <section id="services">').not.toBeNull()
  return section!
}

/** Ближайший предок заголовка группы, внутри которого есть обе цены; чужие группы в него не входят. */
function groupCard(section: HTMLElement, group: (typeof serviceGroups)[number]) {
  const heading = within(section).getAllByRole('heading', { name: nameIs(group.title) })[0]
  const { min, max } = priceRange(group.id)
  const prices = [min, max].map((v) => norm(formatRub(v)))
  let el: HTMLElement | null = heading
  while (el && el !== section) {
    const text = norm(el.textContent)
    if (prices.every((p) => text.includes(p))) return el
    el = el.parentElement
  }
  return null
}

describe('E4: Services', () => {
  it('h2 «От мойки кузова до полного детейлинга» и бейдж «1 500+ клиентов»', () => {
    const section = renderServices()
    expect(within(section).getByRole('heading', { level: 2, name: nameIs('От мойки кузова до полного детейлинга') })).toBeInTheDocument()
    expect(section).toHaveTextContent('1 500+ клиентов')
  })

  it('три группы с заголовками из serviceGroups', () => {
    const section = renderServices()
    for (const group of serviceGroups) {
      expect(within(section).getAllByRole('heading', { name: nameIs(group.title) }).length, group.title).toBeGreaterThanOrEqual(1)
    }
  })

  it.each(serviceGroups.map((g) => [g.id, g] as const))('группа %s: видны минимум и максимум цены в формате formatRub', (_id, group) => {
    const section = renderServices()
    const { min, max } = priceRange(group.id)
    const card = groupCard(section, group)
    expect(card, `у группы «${group.title}» нет обеих цен ${formatRub(min)} и ${formatRub(max)} рядом с заголовком`).not.toBeNull()
    for (const other of serviceGroups.filter((g) => g.id !== group.id)) {
      expect(within(card!).queryByRole('heading', { name: nameIs(other.title) }), `в карточке «${group.title}» оказалась «${other.title}»`).toBeNull()
    }
  })

  it('все шесть пунктов группы interior видны, строки прошли через typo', () => {
    const section = renderServices()
    const interior = serviceGroups.find((g) => g.id === 'interior')!
    expect(interior.items).toHaveLength(6)
    for (const item of interior.items) {
      expect(within(section).getAllByText(item)[0], item).toBeVisible()
      expectTypoApplied(section, item)
    }
  })

  it('неразрывный пробел после коротких слов в пунктах', () => {
    const section = renderServices()
    expect(section.textContent).toContain('сидений и\u00a0багажника')
    expect(section.textContent).toContain('Стёкла и\u00a0зеркала')
  })

  it('пункты салона лежат в зелёной панели bg-sage', () => {
    const section = renderServices()
    const panel = section.querySelector('.bg-sage')
    expect(panel, 'нет элемента с классом bg-sage').not.toBeNull()
    const interior = serviceGroups.find((g) => g.id === 'interior')!
    for (const item of interior.items) {
      expect(panel).toHaveTextContent(item)
    }
  })

  it('пункты кузова и защиты тоже показаны', () => {
    const section = renderServices()
    for (const id of ['exterior', 'protection']) {
      for (const item of serviceGroups.find((g) => g.id === id)!.items) {
        expect(section, item).toHaveTextContent(item)
      }
    }
  })

  it('у карточек кузова и защиты есть кнопка «Записаться» на #booking', () => {
    const section = renderServices()
    for (const id of ['exterior', 'protection'] as const) {
      const group = serviceGroups.find((g) => g.id === id)!
      const card = groupCard(section, group)!
      const links = within(card).getAllByRole('link', { name: nameIs('Записаться') })
      for (const a of links) expect(a).toHaveAttribute('href', '#booking')
    }
    const all = within(section).getAllByRole('link', { name: nameIs('Записаться') })
    expect(all.length).toBeGreaterThanOrEqual(2)
  })

  it('фото салона: interior-console, interior-cleaning, interior-seats; всё lazy, с alt и размерами', () => {
    const section = renderServices()
    const imgs = expectValidPhotos(section, 3)
    for (const name of ['interior-console', 'interior-cleaning', 'interior-seats']) {
      expect(
        imgs.some((img) => img.getAttribute('src')?.startsWith(`/images/${name}-`)),
        `нет фото ${name}`,
      ).toBe(true)
    }
    for (const img of imgs) expect(img).toHaveAttribute('loading', 'lazy')
  })
})
